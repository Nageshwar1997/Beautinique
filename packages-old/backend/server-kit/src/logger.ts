import { type DestinationStream, type Level, type Logger, pino } from 'pino';

/**
 * Fields that never reach a log (ARCHITECTURE §14): secrets, one-time codes, tokens, cookies and
 * financial identifiers, at any depth up to three levels and in request headers.
 */
const SECRET_FIELDS = [
  'password',
  'newPassword',
  'currentPassword',
  'otp',
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'secret',
  'totpSecret',
  'apiKey',
  'authorization',
  'cookie',
  'pan',
  'accountNumber',
  'ifsc',
  'aadhaar',
  'drivingLicence',
  'vehicleRc',
];

/** Header names with a dash, which the field paths above cannot reach (authorization and cookie they do). */
const SECRET_HEADERS = ['set-cookie', 'x-origin-secret'];

export const REDACTED_PATHS = [
  ...SECRET_FIELDS.flatMap((field) => [field, `*.${field}`, `*.*.${field}`]),
  ...SECRET_HEADERS.flatMap((header) => [`headers["${header}"]`, `req.headers["${header}"]`]),
];

export interface LoggerOptions {
  /** the deployable, e.g. "identity" */
  name: string;
  level?: Level | 'silent';
  /** where lines go (default stdout); tests pass a stream */
  destination?: DestinationStream;
}

/** JSON lines to stdout (Render keeps them), ISO times, the service name, secrets redacted. */
export function createLogger({ name, level = 'info', destination }: LoggerOptions): Logger {
  const options = {
    name,
    level,
    base: { service: name },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
  };
  return destination ? pino(options, destination) : pino(options);
}
