// Brevo against a local stand-in server (its documented request and answers); Mailpit for real,
// from `npm run infra:up`.
import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { LOOPBACK_HOST } from '@beautinique/backend-server-kit';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { brevoSender } from '../src/email/brevo.ts';
import { mailpitSender } from '../src/email/mailpit.ts';
import { type EmailMessage, EmailSendError } from '../src/email/port.ts';
import { invitationEmail, otpEmail, sessionReuseEmail } from '../src/email/templates.ts';

const MAILPIT_URL = 'http://localhost:8025';
const from = { email: 'no-reply@beautinique.example', name: 'Beautinique' };
const message = (to: string): EmailMessage =>
  otpEmail({ to, code: '482913', app: 'customer', purpose: 'sign-in', minutes: 10 });

describe('otpEmail', () => {
  it('puts the code in the body only, with how long it works and what to do if unasked', () => {
    const email = message('riya@beautinique.example');
    expect(email.subject).toBe('Your Beautinique sign-in code');
    expect(email.subject).not.toContain('482913');
    expect(email.text).toContain('\n482913\n');
    expect(email.html).toContain('>482913<');
    expect(email.text).toContain('It works for 10 minutes');
    expect(email.text).toContain('If you did not ask for this code, ignore this email.');
    expect(email.text).toContain('Never share this code.');
    expect(email.tags).toEqual(['otp-sign-in']);
    expect(email.html).toContain('<html lang="en">');
  });

  it('asks a new customer to confirm the email, and names the app the code is for', () => {
    const signUp = otpEmail({
      to: 'new@beautinique.example',
      code: '000111',
      app: 'customer',
      purpose: 'sign-up',
      minutes: 10,
    });
    expect(signUp.subject).toBe('Confirm your email for Beautinique');
    expect(signUp.text).toContain('create your Beautinique account');
    expect(signUp.tags).toEqual(['otp-sign-up']);
    const seller = otpEmail({
      to: 's@beautinique.example',
      code: '123456',
      app: 'superadmin',
      purpose: 'sign-in',
      minutes: 5,
    });
    expect(seller.subject).toBe('Your Beautinique Super Admin sign-in code');
    expect(seller.text).toContain('It works for 5 minutes');
  });

  it('gives a password code its own subject, words and tag', () => {
    const reset = otpEmail({
      to: 'rider@beautinique.example',
      code: '246810',
      app: 'delivery',
      purpose: 'password',
      minutes: 10,
    });
    expect(reset.subject).toBe('Set your Beautinique Delivery password');
    expect(reset.text).toContain('set a new password for your Beautinique Delivery account');
    expect(reset.text).toContain('Nobody can change your password without it.');
    expect(reset.subject).not.toContain('246810');
    expect(reset.tags).toEqual(['otp-password']);
  });

  it('escapes what goes into the HTML', () => {
    const email = otpEmail({
      to: 'x@beautinique.example',
      code: '<b>&"',
      app: 'customer',
      purpose: 'sign-in',
      minutes: 10,
    });
    expect(email.html).toContain('&#60;b&#62;&#38;&#34;');
    expect(email.html).not.toContain('<b>&"');
  });
});

/** A stand-in for api.brevo.com that answers with the next status of `answers` and keeps what came. */
interface Received {
  path: string | undefined;
  headers: IncomingMessage['headers'];
  body: Record<string, unknown>;
}
let brevo: Server;
let brevoUrl: string;
const received: Received[] = [];
const answers: { status: number; body?: unknown; delayMs?: number }[] = [];

beforeAll(async () => {
  brevo = createServer((request, response) => {
    let raw = '';
    request.on('data', (chunk: Buffer) => (raw += chunk.toString()));
    request.on('end', () => {
      received.push({
        path: request.url,
        headers: request.headers,
        body: JSON.parse(raw) as Record<string, unknown>,
      });
      const answer = answers.shift() ?? {
        status: 201,
        body: { messageId: '<m1@smtp-relay.mailin.fr>' },
      };
      setTimeout(() => {
        response.writeHead(answer.status, { 'content-type': 'application/json' });
        // an error body that echoes the message: it must not reach an error or a log
        response.end(JSON.stringify(answer.body ?? { code: 'invalid_parameter', message: raw }));
      }, answer.delayMs ?? 0);
    });
  });
  await new Promise<void>((resolve) => brevo.listen(0, LOOPBACK_HOST, resolve));
  brevoUrl = `http://${LOOPBACK_HOST}:${String((brevo.address() as AddressInfo).port)}`;
});

afterAll(async () => {
  brevo.closeAllConnections();
  await new Promise((resolve) => brevo.close(resolve));
});

const failureOf = async (send: Promise<unknown>): Promise<EmailSendError> => {
  try {
    await send;
  } catch (error) {
    expect(error).toBeInstanceOf(EmailSendError);
    return error as EmailSendError;
  }
  throw new Error('the send did not fail');
};

describe('brevoSender', () => {
  const sender = (timeoutMs?: number) =>
    brevoSender({ apiKey: 'test-api-key', from, baseUrl: brevoUrl, timeoutMs });

  it('posts the email to /v3/smtp/email with the api-key header and returns the message id', async () => {
    received.length = 0;
    const result = await sender().send(message('riya@beautinique.example'));
    expect(result).toEqual({ providerId: '<m1@smtp-relay.mailin.fr>' });
    expect(received).toHaveLength(1);
    const [request] = received;
    expect(request?.path).toBe('/v3/smtp/email');
    expect(request?.headers['api-key']).toBe('test-api-key');
    expect(request?.headers['content-type']).toBe('application/json');
    expect(request?.body).toEqual({
      sender: from,
      to: [{ email: 'riya@beautinique.example' }],
      subject: 'Your Beautinique sign-in code',
      htmlContent: expect.stringContaining('482913') as string,
      textContent: expect.stringContaining('482913') as string,
      tags: ['otp-sign-in'],
    });
    answers.push({ status: 202, body: {} });
    expect(await sender().send(message('a@beautinique.example'))).toEqual({
      providerId: 'unknown',
    });
  });

  it('refuses for good on 400, and lets 401, 402, 429 and 5xx be tried again', async () => {
    for (const [status, code, retry] of [
      [400, 'BREVO_REJECTED', false],
      [401, 'BREVO_UNAUTHORIZED', true],
      [403, 'BREVO_UNAUTHORIZED', true],
      [402, 'BREVO_UNAVAILABLE', true],
      [429, 'BREVO_UNAVAILABLE', true],
      [503, 'BREVO_UNAVAILABLE', true],
    ] as const) {
      answers.push({ status });
      const error = await failureOf(sender().send(message('riya@beautinique.example')));
      expect([error.code, error.retry, error.status], String(status)).toEqual([
        code,
        retry,
        status,
      ]);
      // nothing of the message in the error
      expect(error.message).not.toContain('482913');
      expect(error.message).not.toContain('riya@');
    }
  });

  it('gives up on a slow answer and on no server at all, both worth another try', async () => {
    answers.push({ status: 201, delayMs: 500 });
    const slow = await failureOf(sender(100).send(message('riya@beautinique.example')));
    expect([slow.code, slow.retry]).toEqual(['BREVO_UNREACHABLE', true]);
    const gone = brevoSender({ apiKey: 'k', from, baseUrl: 'http://127.0.0.1:1' });
    const refused = await failureOf(gone.send(message('riya@beautinique.example')));
    expect([refused.code, refused.retry, refused.status]).toEqual([
      'BREVO_UNREACHABLE',
      true,
      undefined,
    ]);
  });
});

describe('mailpitSender', () => {
  it('delivers into the laptop inbox through Mailpit’s HTTP API', async () => {
    const to = `otp-${randomUUID().slice(0, 8)}@beautinique.example`;
    const sender = mailpitSender({ url: MAILPIT_URL, from });
    const { providerId } = await sender.send(message(to));
    expect(providerId).not.toBe('unknown');
    const found = (await (
      await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`)
    ).json()) as { messages: { ID: string; Subject: string; From: { Address: string } }[] };
    expect(found.messages).toHaveLength(1);
    expect(found.messages[0]).toMatchObject({
      ID: providerId,
      Subject: 'Your Beautinique sign-in code',
      From: { Address: from.email },
    });
    await fetch(`${MAILPIT_URL}/api/v1/messages`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ IDs: [providerId] }),
    });
  });

  it('turns a refused message and a missing Mailpit into send errors', async () => {
    const noSender = mailpitSender({ url: MAILPIT_URL, from: { email: '', name: '' } });
    const refused = await failureOf(noSender.send(message('x@beautinique.example')));
    expect([refused.code, refused.retry]).toEqual(['MAILPIT_REJECTED', false]);
    const gone = mailpitSender({ url: 'http://127.0.0.1:1', from });
    const missing = await failureOf(gone.send(message('x@beautinique.example')));
    expect([missing.code, missing.retry]).toEqual(['MAILPIT_UNREACHABLE', true]);
  });
});

describe('the invitation emails', () => {
  it('names the app, the role, how to accept and until when, with no secret', () => {
    const email = invitationEmail({
      to: 'asha@beautinique.example',
      app: 'admin',
      roleName: 'State Admin',
      expiresAt: '2026-11-05T09:30:00.000Z',
      url: 'https://bq-admin.example',
    });
    expect(email.subject).toBe('You are invited to Beautinique Admin');
    expect(email.text).toContain('as State Admin');
    expect(email.text).toContain('"Accept an invitation"');
    expect(email.text).toContain('5 Nov 2026, 3:00 pm IST');
    expect(email.text).toContain('https://bq-admin.example');
    expect(email.html).toContain('href="https://bq-admin.example"');
    expect(email.tags).toEqual(['invitation']);
    const escaped = invitationEmail({
      to: 'x@beautinique.example',
      app: 'seller',
      roleName: '<b>Owner</b>',
      expiresAt: '2026-11-05T09:30:00.000Z',
    });
    expect(escaped.html).not.toContain('<b>Owner');
    expect(escaped.html).not.toContain('href=');
  });

  it('gives the invitation code its own subject, words and tag', () => {
    const email = otpEmail({
      to: 'asha@beautinique.example',
      code: '123456',
      app: 'admin',
      purpose: 'invite',
      minutes: 10,
    });
    expect(email.subject).toBe('Accept your Beautinique Admin invitation');
    expect(email.text).toContain('accept your invitation to Beautinique Admin');
    expect(email.subject).not.toContain('123456');
    expect(email.tags).toEqual(['otp-invite']);
  });
});

describe('the session-reuse email', () => {
  it('says what happened, when (IST) and what to do, with no secret', () => {
    const email = sessionReuseEmail({
      to: 'riya@beautinique.example',
      app: 'seller',
      device: 'Chrome on Windows',
      detectedAt: '2026-10-28T09:30:00.000Z',
    });
    expect(email.subject).toBe('We signed you out of Beautinique Seller');
    expect(email.text).toContain('(Chrome on Windows)');
    expect(email.text).toContain('28 Oct 2026, 3:00 pm IST');
    expect(email.text).toContain('"Forgot password"');
    expect(email.tags).toEqual(['security-session-reuse']);
    const escaped = sessionReuseEmail({
      to: 'x@beautinique.example',
      app: 'customer',
      device: '<script>',
      detectedAt: '2026-10-28T09:30:00.000Z',
    });
    expect(escaped.html).not.toContain('<script>');
  });
});
