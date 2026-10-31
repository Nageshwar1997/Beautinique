import type { AppId, AUTHENTICATOR_CHANGES, OTP_PURPOSES } from '@beautinique/shared-contracts';
import { formatDateTime } from '@beautinique/shared-utils';

import type { EmailMessage } from './port.ts';

/** How each app is named in an email: the customer app is the shop itself. */
const APP_NAMES: Readonly<Record<AppId, string>> = {
  customer: 'Beautinique',
  seller: 'Beautinique Seller',
  admin: 'Beautinique Admin',
  superadmin: 'Beautinique Super Admin',
  master: 'Beautinique Master',
  support: 'Beautinique Support',
  finance: 'Beautinique Finance',
  logistics: 'Beautinique Logistics',
  delivery: 'Beautinique Delivery',
  growth: 'Beautinique Growth',
  creator: 'Beautinique Creator',
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => `&#${String(char.charCodeAt(0))};`);

export interface OtpEmailInput {
  to: string;
  code: string;
  app: AppId;
  purpose: (typeof OTP_PURPOSES)[number];
  /** How long the code works, in whole minutes */
  minutes: number;
}

/** What each kind of code email says. `sign-in` only for events from before sign-in by password. */
const WORDING: Readonly<
  Record<
    OtpEmailInput['purpose'],
    (appName: string) => { subject: string; lead: string; misuse: string }
  >
> = {
  'sign-up': (appName) => ({
    subject: `Confirm your email for ${appName}`,
    lead: `Use this code to confirm your email and create your ${appName} account:`,
    misuse: 'use your email',
  }),
  password: (appName) => ({
    subject: `Set your ${appName} password`,
    lead: `Use this code to set a new password for your ${appName} account:`,
    misuse: 'change your password',
  }),
  'sign-in': (appName) => ({
    subject: `Your ${appName} sign-in code`,
    lead: `Use this code to sign in to ${appName}:`,
    misuse: 'sign in',
  }),
  invite: (appName) => ({
    subject: `Accept your ${appName} invitation`,
    lead: `Use this code to confirm your email and accept your invitation to ${appName}:`,
    misuse: 'accept your invitation',
  }),
};

/**
 * The email-code email. The code is in the body only, not the subject, so a lock-screen preview
 * of the subject alone does not show it. Plain English, a text part and a simple HTML part.
 */
export function otpEmail({ to, code, app, purpose, minutes }: OtpEmailInput): EmailMessage {
  const appName = APP_NAMES[app];
  const { subject, lead, misuse } = WORDING[purpose](appName);
  const validity = `It works for ${String(minutes)} minutes, on the page where you asked for it.`;
  const ignore = `If you did not ask for this code, ignore this email. Nobody can ${misuse} without it.`;
  const never =
    'Never share this code. Beautinique will never ask you for it on a call or in a chat.';
  const text = [lead, '', code, '', validity, '', ignore, never, '', `– ${appName}`].join('\n');
  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f7f4f2;font-family:Arial,Helvetica,sans-serif;color:#1f1a1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px">
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:24px">${escapeHtml(lead)}</td></tr>
<tr><td style="padding:12px 28px;font-size:32px;line-height:40px;font-weight:bold;letter-spacing:8px">${escapeHtml(code)}</td></tr>
<tr><td style="padding:8px 28px;font-size:14px;line-height:22px">${escapeHtml(validity)}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;line-height:20px;color:#5c5357">${escapeHtml(ignore)} ${escapeHtml(never)}</td></tr>
</table>
<p style="max-width:480px;margin:16px auto 0;font-size:12px;color:#5c5357;text-align:center">${escapeHtml(appName)}</p>
</body>
</html>`;
  return { to, subject, text, html, tags: [`otp-${purpose}`] };
}

export interface SessionReuseEmailInput {
  to: string;
  app: AppId;
  /** `Chrome on Windows` */
  device: string;
  /** When identity ended the session (ISO) */
  detectedAt: string;
}

/**
 * A refresh token came back after it was replaced, so someone had a copy and identity ended that
 * session (ARCHITECTURE §7.2). Plain English: what happened, that it is ended, what to do.
 */
export function sessionReuseEmail({
  to,
  app,
  device,
  detectedAt,
}: SessionReuseEmailInput): EmailMessage {
  const appName = APP_NAMES[app];
  const subject = `We signed you out of ${appName}`;
  const lead = `Someone used an old sign-in of your ${appName} account (${device}). To keep your account safe, we ended that session on ${formatDateTime(detectedAt)} IST.`;
  const next =
    'If this was not you, set a new password with "Forgot password" on the sign-in page: that ends every session of your account. If you were just using two tabs, sign in again.';
  const text = [lead, '', next, '', `– ${appName}`].join('\n');
  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f7f4f2;font-family:Arial,Helvetica,sans-serif;color:#1f1a1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px">
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:24px">${escapeHtml(lead)}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:14px;line-height:22px">${escapeHtml(next)}</td></tr>
</table>
<p style="max-width:480px;margin:16px auto 0;font-size:12px;color:#5c5357;text-align:center">${escapeHtml(appName)}</p>
</body>
</html>`;
  return { to, subject, text, html, tags: ['security-session-reuse'] };
}

export interface InvitationEmailInput {
  to: string;
  app: AppId;
  /** The role, as identity names it, e.g. `State Admin` */
  roleName: string;
  /** Until when it can be accepted (ISO) */
  expiresAt: string;
  /** The app's address (NOTIFY__APP_URLS); left out = no link */
  url?: string | undefined;
}

/**
 * Someone was invited to a role (TASKS T3.3). No secret in it: the person accepts in the app with
 * this email address and an email code, so a forwarded invitation is no use to anyone else.
 */
export function invitationEmail({
  to,
  app,
  roleName,
  expiresAt,
  url,
}: InvitationEmailInput): EmailMessage {
  const appName = APP_NAMES[app];
  const subject = `You are invited to ${appName}`;
  const lead = `You are invited to ${appName} as ${roleName}.`;
  const where = url === undefined ? `the ${appName} app` : `${appName} (${url})`;
  const how = `To accept, open ${where}, choose "Accept an invitation" and use this email address. We will send you a code to confirm it, and you set your password there (if you have a Beautinique account already, it keeps its password).`;
  const until = `The invitation works until ${formatDateTime(expiresAt)} IST.`;
  const ignore =
    'If you did not expect this, ignore this email: nothing happens unless you accept.';
  const text = [lead, '', how, '', until, '', ignore, '', `– ${appName}`].join('\n');
  const button =
    url === undefined
      ? ''
      : `<tr><td style="padding:8px 28px"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#1f1a1c;color:#ffffff;border-radius:8px;text-decoration:none;font-size:15px">Open ${escapeHtml(appName)}</a></td></tr>`;
  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f7f4f2;font-family:Arial,Helvetica,sans-serif;color:#1f1a1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px">
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:24px;font-weight:bold">${escapeHtml(lead)}</td></tr>
<tr><td style="padding:8px 28px;font-size:14px;line-height:22px">${escapeHtml(how)}</td></tr>
${button}
<tr><td style="padding:8px 28px;font-size:14px;line-height:22px">${escapeHtml(until)}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;line-height:20px;color:#5c5357">${escapeHtml(ignore)}</td></tr>
</table>
<p style="max-width:480px;margin:16px auto 0;font-size:12px;color:#5c5357;text-align:center">${escapeHtml(appName)}</p>
</body>
</html>`;
  return { to, subject, text, html, tags: ['invitation'] };
}

export interface AuthenticatorResetEmailInput {
  to: string;
  /** When it was reset (ISO) */
  resetAt: string;
}

/**
 * A Security Officer reset the account's authenticator (ARCHITECTURE §7.1): what happened, when,
 * and what to do if it was not asked for. Every session of the account ended with it.
 */
export function authenticatorResetEmail({
  to,
  resetAt,
}: AuthenticatorResetEmailInput): EmailMessage {
  const appName = APP_NAMES.customer;
  const subject = 'Your Beautinique authenticator was reset';
  const lead = `Your authenticator app was removed from your Beautinique account on ${formatDateTime(resetAt)} IST, and you were signed out everywhere. Where an authenticator is required, you set up a new one at your next sign-in.`;
  const next =
    'If you did not ask for this, set a new password with "Forgot password" on the sign-in page and tell your manager or Beautinique support at once.';
  const text = [lead, '', next, '', `– ${appName}`].join('\n');
  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f7f4f2;font-family:Arial,Helvetica,sans-serif;color:#1f1a1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px">
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:24px">${escapeHtml(lead)}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:14px;line-height:22px">${escapeHtml(next)}</td></tr>
</table>
<p style="max-width:480px;margin:16px auto 0;font-size:12px;color:#5c5357;text-align:center">${escapeHtml(appName)}</p>
</body>
</html>`;
  return { to, subject, text, html, tags: ['security-authenticator-reset'] };
}

export interface AuthenticatorChangedEmailInput {
  to: string;
  change: (typeof AUTHENTICATOR_CHANGES)[number];
  /** The app it was done in */
  app: AppId;
  /** `Chrome on Windows` */
  device: string;
  /** When (ISO) */
  changedAt: string;
}

const AUTHENTICATOR_CHANGE_TEXT: Readonly<
  Record<AuthenticatorChangedEmailInput['change'], { subject: string; what: string; now: string }>
> = {
  enabled: {
    subject: 'An authenticator was set up for your Beautinique account',
    what: 'An authenticator app was set up for your account',
    now: 'From now on, every sign-in asks for its code.',
  },
  replaced: {
    subject: 'Your Beautinique authenticator was replaced',
    what: 'A new authenticator app replaced the old one on your account',
    now: 'The old one and its recovery codes no longer work.',
  },
  'recovery-codes': {
    subject: 'New recovery codes for your Beautinique account',
    what: 'New recovery codes were made for your account',
    now: 'The old ones no longer work.',
  },
  disabled: {
    subject: 'Your Beautinique authenticator was turned off',
    what: 'The authenticator app was turned off for your account',
    now: 'Sign-ins now ask only for your password.',
  },
};

/**
 * The person changed their own authenticator (ARCHITECTURE §9.2): what changed, where and when,
 * and what to do if it was not them. Their sessions stay, so the way out ends them.
 */
export function authenticatorChangedEmail({
  to,
  change,
  app,
  device,
  changedAt,
}: AuthenticatorChangedEmailInput): EmailMessage {
  const appName = APP_NAMES[app];
  const { subject, what, now } = AUTHENTICATOR_CHANGE_TEXT[change];
  const lead = `${what} in ${appName} (${device}) on ${formatDateTime(changedAt)} IST. ${now}`;
  const next =
    'If this was not you, set a new password with "Forgot password" on the sign-in page at once (that signs you out everywhere) and contact Beautinique support.';
  const text = [lead, '', next, '', `– ${appName}`].join('\n');
  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f7f4f2;font-family:Arial,Helvetica,sans-serif;color:#1f1a1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px">
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:24px">${escapeHtml(lead)}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:14px;line-height:22px">${escapeHtml(next)}</td></tr>
</table>
<p style="max-width:480px;margin:16px auto 0;font-size:12px;color:#5c5357;text-align:center">${escapeHtml(appName)}</p>
</body>
</html>`;
  return { to, subject, text, html, tags: [`security-authenticator-${change}`] };
}
