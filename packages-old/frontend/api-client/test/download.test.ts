import { csvFileZod, defineRoute } from '@beautinique/shared-contracts';
import { object, string } from '@beautinique/shared-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ApiClient, createApiClient, saveFile } from '../src/index';
import { SAVE_URL_LIFETIME_MS } from '../src/save-file';
import { BASE_URL, failure, fakeGateway } from './fake-gateway';

/** A file route like the audit log's CSV: signed in, with a step-up. */
const exportOrders = defineRoute({
  id: 'test.orders.export',
  method: 'GET',
  path: '/test/orders/export',
  summary: 'The test orders as a file',
  apps: ['customer'],
  access: { type: 'permission', permission: 'test.order.export' },
  rateLimit: 'search',
  idempotency: false,
  stepUp: true,
  owner: 'core',
  download: 'csv',
  input: { query: object({ status: string().optional() }) },
  output: csvFileZod,
});

const csv = () =>
  new Response('"Order"\r\n"o-1"\r\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="orders.csv"',
    },
  });

const clients: ApiClient[] = [];
afterEach(() => {
  for (const client of clients.splice(0)) client.dispose();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('download (T4.1 PR D)', () => {
  it('refreshes an ended token and asks for a step-up like a call, then takes the file', async () => {
    const gateway = fakeGateway({ access: true });
    gateway.answers.push(
      () => failure(401, 'UNAUTHENTICATED'),
      () => failure(401, 'STEP_UP_REQUIRED'),
      csv,
    );
    const client = createApiClient({ app: 'customer', baseUrl: BASE_URL, fetch: gateway.fetch });
    clients.push(client);
    const stepUp = vi.fn(() => Promise.resolve(true));
    client.setStepUpHandler(stepUp);
    const file = await client.download(exportOrders, { query: { status: 'paid' } });
    expect(file.fileName).toBe('orders.csv');
    expect(await file.blob.text()).toBe('"Order"\r\n"o-1"\r\n');
    expect(stepUp).toHaveBeenCalledTimes(1);
    expect(gateway.paths()).toEqual([
      'GET /api/v1/test/orders/export',
      'POST /api/v1/auth/refresh',
      'GET /api/v1/test/orders/export',
      'GET /api/v1/test/orders/export',
    ]);
    expect(gateway.requests.at(-1)?.search).toBe('?status=paid');
  });

  it('gives the error when the person cancels the step-up', async () => {
    const gateway = fakeGateway({ access: true });
    gateway.answers.push(() => failure(401, 'STEP_UP_REQUIRED'));
    const client = createApiClient({ app: 'customer', baseUrl: BASE_URL, fetch: gateway.fetch });
    clients.push(client);
    client.setStepUpHandler(() => Promise.resolve(false));
    await expect(client.download(exportOrders, { query: {} })).rejects.toMatchObject({
      code: 'STEP_UP_REQUIRED',
    });
  });
});

describe('saveFile', () => {
  it('saves through a hidden link with the file name, then lets the object URL go', () => {
    vi.useFakeTimers();
    const made = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:file-1');
    const revoked = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clicked = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const blob = new Blob(['a']);
    saveFile({ blob, fileName: 'orders.csv' });
    expect(made).toHaveBeenCalledWith(blob);
    const link = clicked.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('orders.csv');
    expect(link.href).toBe('blob:file-1');
    // the link goes again at once, the URL a minute later
    expect(document.querySelector('a[download]')).toBeNull();
    expect(revoked).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SAVE_URL_LIFETIME_MS);
    expect(revoked).toHaveBeenCalledWith('blob:file-1');
  });
});
