import { createFakeClock, type FakeClock } from '@beautinique/shared-clock';
import { defineEvent } from '@beautinique/shared-contracts';
import { ObjectId } from 'mongodb';
import { number, string } from 'zod';

import type { EventsLogger, OpsAlert } from '../../src/inbox.ts';

// Events shaped like the real ones, to run the outbox, the dispatcher and the inbox against.

export const orderPlaced = defineEvent({
  type: 'commerce.order.placed',
  version: 1,
  description: 'An order was placed.',
  data: { orderId: string('orderId is required.'), lines: number('lines must be a number.') },
});

export const orderConfirmed = defineEvent({
  type: 'commerce.order.confirmed',
  version: 1,
  description: 'An order was confirmed.',
  data: { orderId: string('orderId is required.') },
});

export const paymentCaptured = defineEvent({
  type: 'payments.payment.captured',
  version: 1,
  description: 'A payment was captured.',
  data: { paymentId: string('paymentId is required.') },
});

export const START = new Date('2026-11-27T04:30:00.000Z');

export const clockAt = (at: Date = START): FakeClock => createFakeClock(at);

/** The input of an event about one order, at one version of it. */
export function aboutOrder(orderId: string, version: number, data: { lines?: number } = {}) {
  return {
    aggregate: { type: 'order', id: orderId, version },
    actor: { type: 'system' as const, id: 'test' },
    correlationId: `corr-${orderId}`,
    causationId: `cause-${orderId}`,
    data: { orderId, lines: data.lines ?? 1 },
  };
}

export const newId = (): string => new ObjectId().toHexString();

export interface Logged {
  level: 'error' | 'warn';
  fields: Readonly<Record<string, unknown>>;
  message: string;
}

/** A logger that keeps what it is told, to look at in a test. */
export function recordingLogger(): EventsLogger & { lines: Logged[] } {
  const lines: Logged[] = [];
  return {
    lines,
    error(fields, message) {
      lines.push({ level: 'error', fields, message });
    },
    warn(fields, message) {
      lines.push({ level: 'warn', fields, message });
    },
  };
}

/** An alert that keeps what it is raised with. */
export function recordingAlert(): ((alert: OpsAlert) => void) & { raised: OpsAlert[] } {
  const raised: OpsAlert[] = [];
  const alert = (given: OpsAlert) => {
    raised.push(given);
  };
  return Object.assign(alert, { raised });
}
