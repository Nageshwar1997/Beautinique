import type { AppId, OTP_PURPOSES } from '@beautinique/shared-contracts';

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

/**
 * The sign-in code email. The code is in the body only, not the subject, so a lock-screen preview
 * of the subject alone does not show it. Plain English, a text part and a simple HTML part.
 */
export function otpEmail({ to, code, app, purpose, minutes }: OtpEmailInput): EmailMessage {
  const appName = APP_NAMES[app];
  const signUp = purpose === 'sign-up';
  const subject = signUp ? `Confirm your email for ${appName}` : `Your ${appName} sign-in code`;
  const lead = signUp
    ? `Use this code to confirm your email and create your ${appName} account:`
    : `Use this code to sign in to ${appName}:`;
  const validity = `It works for ${String(minutes)} minutes, on the page where you asked for it.`;
  const ignore = `If you did not ask for this code, ignore this email. Nobody can ${
    signUp ? 'use your email' : 'sign in'
  } without it.`;
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
  return { to, subject, text, html, tags: [signUp ? 'otp-sign-up' : 'otp-sign-in'] };
}
