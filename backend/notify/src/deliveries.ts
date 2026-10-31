import { decryptField, type SealingKeys } from '@beautinique/backend-server-crypto';
import type { Logger } from '@beautinique/backend-server-kit';
import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import { subscribe, type Subscription, type TaskTrigger } from '@beautinique/backend-server-queue';
import {
  type AppId,
  type AUTHENTICATOR_CHANGES,
  authenticatorChanged,
  authenticatorReset,
  invitationCreated,
  type OTP_PURPOSES,
  otpRequested,
  otpSealContext,
  sessionReuseDetected,
} from '@beautinique/shared-contracts';

import { type EmailSender, EmailSendError } from './email/port.ts';
import {
  authenticatorChangedEmail,
  authenticatorResetEmail,
  invitationEmail,
  otpEmail,
  sessionReuseEmail,
} from './email/templates.ts';

export const DELIVERIES = 'notify_deliveries';
export const EMAIL_DAYS = 'notify_email_days';
/** The subscriber identity's relay sends identity.otp.requested to. */
export const OTP_EMAIL = 'notify.otpEmail';
/** The subscriber identity's relay sends identity.session.reuseDetected to. */
export const SECURITY_EMAIL = 'notify.securityEmail';
/** The subscriber identity's relay sends identity.invitation.created to. */
export const INVITATION_EMAIL = 'notify.invitationEmail';
/** The subscriber identity's relay sends identity.authenticator.reset to. */
export const AUTHENTICATOR_EMAIL = 'notify.authenticatorEmail';
/** The subscriber identity's relay sends identity.authenticator.changed to. */
export const AUTHENTICATOR_CHANGED_EMAIL = 'notify.authenticatorChangedEmail';
/** The task that sends what is due; it runs every minute and at once after each new email. */
export const SEND_TASK = 'email.sendDue';

/** Deliveries are the delivery log: kept 400 days (ARCHITECTURE §6.5), then MongoDB drops them. */
export const DELIVERY_KEEP_SECONDS = 400 * 24 * 60 * 60;
/** A day's email count is needed for that day only; a month is plenty for a look back. */
export const EMAIL_DAY_KEEP_SECONDS = 35 * 24 * 60 * 60;
/** How long one send may hold a delivery before another run may take it again. */
export const SEND_LEASE_MS = 60_000;
/** Tries per email; the waits between them grow 10 s, 30 s, 90 s, 270 s. */
export const MAX_ATTEMPTS = 5;
const RETRY_BASE_MS = 10_000;
/** Emails per run; when more are due, the run asks for the next one at once. */
export const SEND_BATCH = 20;

/**
 * The send order, and who goes after the day's soft limit: sign-in codes first, then transactional
 * (order, refund, security), then the rest, which waits for the next day (ARCHITECTURE §7.1).
 */
export const LANES = { otp: 0, transactional: 1, other: 2 } as const;
export type Lane = keyof typeof LANES;

type Status = 'queued' | 'sending' | 'sent' | 'expired' | 'failed';

export interface Delivery {
  /** The id of the event that asked for it: a redelivered event finds it already there. */
  _id: string;
  channel: 'email';
  lane: Lane;
  /** LANES[lane]: the order a run sends in */
  priority: number;
  template:
    'otp' | 'session-reuse' | 'invitation' | 'authenticator-reset' | 'authenticator-changed';
  to: string;
  /** The sign-in code, still sealed; removed once the email went, failed or ran out. */
  otp?: {
    challengeId: string;
    sealedCode?: string;
    app: AppId;
    purpose: (typeof OTP_PURPOSES)[number];
    minutes: number;
  };
  /** A session ended because its refresh token was copied (no secret in it) */
  security?: { app: AppId; device: string; detectedAt: string };
  /** An invitation to a role (no secret in it: it is accepted with an email code) */
  invitation?: { app: AppId; roleName: string; expiresAt: string };
  /** A Security Officer reset the authenticator (no secret in it) */
  authenticator?: { resetAt: string };
  /** The person changed their own authenticator (no secret in it) */
  authenticatorChange?: {
    change: (typeof AUTHENTICATOR_CHANGES)[number];
    app: AppId;
    device: string;
    changedAt: string;
  };
  status: Status;
  attempts: number;
  /** Not sent before this */
  dueAt: Date;
  /** Not sent after this (a code that no longer works); null = no end */
  expiresAt: Date | null;
  leaseUntil?: Date;
  provider?: string;
  providerId?: string;
  /** The last failure's code (EmailSendError.code); never the message or the address */
  error?: string;
  createdAt: Date;
  sentAt?: Date;
}

interface EmailDay {
  /** The UTC day, `2026-10-27` */
  _id: string;
  sent: number;
  createdAt: Date;
}

/** The release steps make these before notify listens (ARCHITECTURE §11.1). */
export const indexes: readonly IndexSpec[] = [
  // equality, sort, range: a run takes the most urgent due delivery first
  {
    collection: DELIVERIES,
    name: 'status_priority_dueAt',
    key: { status: 1, priority: 1, dueAt: 1 },
  },
  {
    collection: DELIVERIES,
    name: 'createdAt_ttl',
    key: { createdAt: 1 },
    expireAfterSeconds: DELIVERY_KEEP_SECONDS,
  },
  {
    collection: EMAIL_DAYS,
    name: 'createdAt_ttl',
    key: { createdAt: 1 },
    expireAfterSeconds: EMAIL_DAY_KEEP_SECONDS,
  },
];

const describe = (error: unknown) =>
  error instanceof Error
    ? { name: error.name, message: error.message }
    : { message: String(error) };

const deliveriesOf = (mongo: Mongo) => mongo.db.collection<Delivery>(DELIVERIES);

/**
 * identity.otp.requested → a queued email in the OTP lane, then a send run at once. Only database
 * work in the handler (it may run again); the email goes from the send task, outside the
 * transaction. The code stays sealed at rest.
 */
export function otpSubscription({
  mongo,
  trigger,
  logger,
}: {
  mongo: Mongo;
  trigger: TaskTrigger;
  logger: Logger;
}): Subscription {
  const deliveries = deliveriesOf(mongo);
  return subscribe(OTP_EMAIL, otpRequested, async (event, session) => {
    const { challengeId, email, app, purpose, sealedCode, expiresAt } = event.data;
    const ends = new Date(expiresAt);
    const minutes = Math.max(
      1,
      Math.round((ends.getTime() - Date.parse(event.occurredAt)) / 60_000),
    );
    const now = new Date();
    await deliveries.insertOne(
      {
        _id: event.eventId,
        channel: 'email',
        lane: 'otp',
        priority: LANES.otp,
        template: 'otp',
        to: email,
        otp: { challengeId, sealedCode, app, purpose, minutes },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: ends,
        createdAt: now,
      },
      { session },
    );
    try {
      await trigger.runSoon(SEND_TASK);
    } catch (error) {
      // the every-minute run sends it anyway
      logger.warn(
        { err: describe(error), deliveryId: event.eventId },
        'email send not started at once',
      );
    }
  });
}

/**
 * identity.session.reuseDetected → a security email in the transactional lane (after codes,
 * before everything else; ARCHITECTURE §7.1), then a send run at once.
 */
export function securitySubscription({
  mongo,
  trigger,
  logger,
}: {
  mongo: Mongo;
  trigger: TaskTrigger;
  logger: Logger;
}): Subscription {
  const deliveries = deliveriesOf(mongo);
  return subscribe(SECURITY_EMAIL, sessionReuseDetected, async (event, session) => {
    const { email, app, device, detectedAt } = event.data;
    const now = new Date();
    await deliveries.insertOne(
      {
        _id: event.eventId,
        channel: 'email',
        lane: 'transactional',
        priority: LANES.transactional,
        template: 'session-reuse',
        to: email,
        security: { app, device, detectedAt },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: null,
        createdAt: now,
      },
      { session },
    );
    try {
      await trigger.runSoon(SEND_TASK);
    } catch (error) {
      // the every-minute run sends it anyway
      logger.warn(
        { err: describe(error), deliveryId: event.eventId },
        'email send not started at once',
      );
    }
  });
}

/**
 * identity.invitation.created → an invitation email in the transactional lane, then a send run at
 * once. It is not sent after the invitation ran out.
 */
export function invitationSubscription({
  mongo,
  trigger,
  logger,
}: {
  mongo: Mongo;
  trigger: TaskTrigger;
  logger: Logger;
}): Subscription {
  const deliveries = deliveriesOf(mongo);
  return subscribe(INVITATION_EMAIL, invitationCreated, async (event, session) => {
    const { email, app, roleName, expiresAt } = event.data;
    const now = new Date();
    await deliveries.insertOne(
      {
        _id: event.eventId,
        channel: 'email',
        lane: 'transactional',
        priority: LANES.transactional,
        template: 'invitation',
        to: email,
        invitation: { app, roleName, expiresAt },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: new Date(expiresAt),
        createdAt: now,
      },
      { session },
    );
    try {
      await trigger.runSoon(SEND_TASK);
    } catch (error) {
      // the every-minute run sends it anyway
      logger.warn(
        { err: describe(error), deliveryId: event.eventId },
        'email send not started at once',
      );
    }
  });
}

/**
 * identity.authenticator.reset → a security email in the transactional lane, then a send run at
 * once.
 */
export function authenticatorSubscription({
  mongo,
  trigger,
  logger,
}: {
  mongo: Mongo;
  trigger: TaskTrigger;
  logger: Logger;
}): Subscription {
  const deliveries = deliveriesOf(mongo);
  return subscribe(AUTHENTICATOR_EMAIL, authenticatorReset, async (event, session) => {
    const { email, resetAt } = event.data;
    const now = new Date();
    await deliveries.insertOne(
      {
        _id: event.eventId,
        channel: 'email',
        lane: 'transactional',
        priority: LANES.transactional,
        template: 'authenticator-reset',
        to: email,
        authenticator: { resetAt },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: null,
        createdAt: now,
      },
      { session },
    );
    try {
      await trigger.runSoon(SEND_TASK);
    } catch (error) {
      // the every-minute run sends it anyway
      logger.warn(
        { err: describe(error), deliveryId: event.eventId },
        'email send not started at once',
      );
    }
  });
}

/**
 * identity.authenticator.changed (the person set one up, replaced it, got new recovery codes or
 * turned it off) → a security email in the transactional lane, then a send run at once.
 */
export function authenticatorChangedSubscription({
  mongo,
  trigger,
  logger,
}: {
  mongo: Mongo;
  trigger: TaskTrigger;
  logger: Logger;
}): Subscription {
  const deliveries = deliveriesOf(mongo);
  return subscribe(AUTHENTICATOR_CHANGED_EMAIL, authenticatorChanged, async (event, session) => {
    const { email, change, app, device, changedAt } = event.data;
    const now = new Date();
    await deliveries.insertOne(
      {
        _id: event.eventId,
        channel: 'email',
        lane: 'transactional',
        priority: LANES.transactional,
        template: 'authenticator-changed',
        to: email,
        authenticatorChange: { change, app, device, changedAt },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: null,
        createdAt: now,
      },
      { session },
    );
    try {
      await trigger.runSoon(SEND_TASK);
    } catch (error) {
      // the every-minute run sends it anyway
      logger.warn(
        { err: describe(error), deliveryId: event.eventId },
        'email send not started at once',
      );
    }
  });
}

export interface SendDueDeps {
  mongo: Mongo;
  sender: EmailSender;
  otpKeys: SealingKeys;
  logger: Logger;
  trigger: TaskTrigger;
  limits: { daily: number; other: number };
  /** Each app's address for links (NOTIFY__APP_URLS); an app left out gets no link */
  appUrls?: ReadonlyMap<AppId, string>;
  /** default: the clock; tests move time */
  now?: () => Date;
  batchSize?: number;
}

/** What one run did. */
export interface SendReport {
  sent: number;
  retried: number;
  expired: number;
  failed: number;
  deferred: number;
}

const dayOf = (at: Date): string => at.toISOString().slice(0, 10);
const nextDay = (at: Date): Date =>
  new Date(`${dayOf(new Date(at.getTime() + 86_400_000))}T00:00:00.000Z`);

/**
 * Sends every email that is due, most urgent first, within the day's budget. Safe to run again and
 * side by side: each delivery is claimed with a lease before its send. Brevo's free day is counted
 * in UTC days.
 */
export async function sendDue({
  mongo,
  sender,
  otpKeys,
  logger,
  trigger,
  limits,
  appUrls,
  now = () => new Date(),
  batchSize = SEND_BATCH,
}: SendDueDeps): Promise<SendReport> {
  const deliveries = deliveriesOf(mongo);
  const days = mongo.db.collection<EmailDay>(EMAIL_DAYS);
  const report: SendReport = { sent: 0, retried: 0, expired: 0, failed: 0, deferred: 0 };

  // a run that stopped mid-send (deploy, crash) leaves `sending` behind: free it after its lease
  await deliveries.updateMany(
    { status: 'sending', leaseUntil: { $lte: now() } },
    { $set: { status: 'queued' }, $unset: { leaseUntil: '' } },
  );

  /** Counts one email against today's budget; false when this lane's limit is reached. */
  const reserve = async (lane: Lane, at: Date): Promise<boolean> => {
    const day = dayOf(at);
    await days.updateOne(
      { _id: day },
      { $setOnInsert: { sent: 0, createdAt: at } },
      { upsert: true },
    );
    const limit = lane === 'other' ? limits.other : limits.daily;
    const counted = await days.updateOne({ _id: day, sent: { $lt: limit } }, { $inc: { sent: 1 } });
    return counted.modifiedCount === 1;
  };
  const giveBack = (at: Date) => days.updateOne({ _id: dayOf(at) }, { $inc: { sent: -1 } });

  /** The delivery's end state: the sealed code goes, whatever the end. */
  const finish = (delivery: Delivery, set: Partial<Delivery>) =>
    deliveries.updateOne(
      { _id: delivery._id, status: 'sending' },
      { $set: set, $unset: { 'otp.sealedCode': '', leaseUntil: '' } },
    );

  const render = (delivery: Delivery) => {
    if (delivery.template === 'session-reuse') {
      const { security } = delivery;
      if (!security) throw new EmailSendError('SECURITY_DETAILS_MISSING', { retry: false });
      return sessionReuseEmail({ to: delivery.to, ...security });
    }
    if (delivery.template === 'authenticator-reset') {
      const { authenticator } = delivery;
      if (!authenticator)
        throw new EmailSendError('AUTHENTICATOR_DETAILS_MISSING', { retry: false });
      return authenticatorResetEmail({ to: delivery.to, ...authenticator });
    }
    if (delivery.template === 'authenticator-changed') {
      const { authenticatorChange } = delivery;
      if (!authenticatorChange)
        throw new EmailSendError('AUTHENTICATOR_DETAILS_MISSING', { retry: false });
      return authenticatorChangedEmail({ to: delivery.to, ...authenticatorChange });
    }
    if (delivery.template === 'invitation') {
      const { invitation } = delivery;
      if (!invitation) throw new EmailSendError('INVITATION_DETAILS_MISSING', { retry: false });
      return invitationEmail({
        to: delivery.to,
        ...invitation,
        url: appUrls?.get(invitation.app),
      });
    }
    const { otp } = delivery;
    if (!otp?.sealedCode) throw new EmailSendError('OTP_CODE_MISSING', { retry: false });
    const code = decryptField(otpKeys, otp.sealedCode, otpSealContext(otp.challengeId));
    return otpEmail({
      to: delivery.to,
      code,
      app: otp.app,
      purpose: otp.purpose,
      minutes: otp.minutes,
    });
  };

  async function sendOne(delivery: Delivery, at: Date): Promise<void> {
    const where = { deliveryId: delivery._id, lane: delivery.lane, attempt: delivery.attempts };
    if (delivery.expiresAt !== null && delivery.expiresAt <= at) {
      await finish(delivery, { status: 'expired' });
      report.expired += 1;
      logger.warn(where, 'email expired before it could go');
      return;
    }
    if (!(await reserve(delivery.lane, at))) {
      if (delivery.lane === 'other') {
        await deliveries.updateOne(
          { _id: delivery._id, status: 'sending' },
          {
            $set: { status: 'queued', dueAt: nextDay(at) },
            $inc: { attempts: -1 },
            $unset: { leaseUntil: '' },
          },
        );
        report.deferred += 1;
        logger.info(where, 'email waits for tomorrow (daily limit for other emails)');
      } else {
        await finish(delivery, { status: 'failed', error: 'DAILY_LIMIT' });
        report.failed += 1;
        logger.error(where, 'email not sent: the daily email limit is reached');
      }
      return;
    }
    let providerId: string;
    try {
      ({ providerId } = await sender.send(render(delivery)));
    } catch (error) {
      await giveBack(at);
      const code =
        error instanceof EmailSendError
          ? error.code
          : error instanceof Error && error.name === 'CryptoError'
            ? 'OTP_CODE_UNREADABLE'
            : 'UNEXPECTED';
      const retry =
        (error instanceof EmailSendError ? error.retry : code === 'UNEXPECTED') &&
        delivery.attempts < MAX_ATTEMPTS;
      const dueAt = new Date(at.getTime() + RETRY_BASE_MS * 3 ** (delivery.attempts - 1));
      if (retry && (delivery.expiresAt === null || dueAt < delivery.expiresAt)) {
        await deliveries.updateOne(
          { _id: delivery._id, status: 'sending' },
          { $set: { status: 'queued', dueAt, error: code }, $unset: { leaseUntil: '' } },
        );
        report.retried += 1;
        logger.warn({ ...where, code, err: describe(error) }, 'email not sent, will try again');
      } else {
        await finish(delivery, { status: 'failed', error: code });
        report.failed += 1;
        logger.error({ ...where, code, err: describe(error) }, 'email not sent');
      }
      return;
    }
    // outside the try: once the provider took it, a failed write here must not count as a failed
    // send; the delivery stays `sending` until its lease runs out, so at worst a later run sends again
    await finish(delivery, { status: 'sent', sentAt: now(), provider: sender.name, providerId });
    report.sent += 1;
    logger.info({ ...where, provider: sender.name, providerId }, 'email sent');
  }

  for (let handled = 0; handled < batchSize; handled += 1) {
    const at = now();
    const delivery = await deliveries.findOneAndUpdate(
      { status: 'queued', dueAt: { $lte: at } },
      {
        $set: { status: 'sending', leaseUntil: new Date(at.getTime() + SEND_LEASE_MS) },
        $inc: { attempts: 1 },
      },
      { sort: { priority: 1, dueAt: 1 }, returnDocument: 'after' },
    );
    if (!delivery) return report;
    await sendOne(delivery, at);
  }
  // a full batch: more may be due, so the next run starts now instead of in a minute
  await trigger.runSoon(SEND_TASK);
  return report;
}
