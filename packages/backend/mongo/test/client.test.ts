import { describe, expect, it } from 'vitest';

import { createMongoClient, SERVER_SELECTION_TIMEOUT_MS } from '../src/client.ts';

describe('createMongoClient (docs/ARCHITECTURE.md §10.2)', () => {
  const uri = 'mongodb://127.0.0.1:27017/?directConnection=true';

  it('AC-PLATFORM-1: majority writes and reads, retries, a short wait for the server, undefined left out', () => {
    const client = createMongoClient({ uri, appName: 'commerce', maxPoolSize: 10 });
    const { options } = client;

    expect(options.appName).toBe('commerce');
    expect(options.maxPoolSize).toBe(10);
    expect(options.retryWrites).toBe(true);
    expect(options.retryReads).toBe(true);
    expect(options.writeConcern.w).toBe('majority');
    expect(options.readConcern.level).toBe('majority');
    expect(options.serverSelectionTimeoutMS).toBe(SERVER_SELECTION_TIMEOUT_MS);
    expect(client.bsonOptions.ignoreUndefined).toBe(true);
  });

  it('CR-3: an app name and a pool size are needed', () => {
    expect(() => createMongoClient({ uri, appName: ' ', maxPoolSize: 10 })).toThrow(
      'appName is required.',
    );
    for (const maxPoolSize of [0, 1.5, -1, Number.NaN]) {
      expect(() => createMongoClient({ uri, appName: 'commerce', maxPoolSize })).toThrow(
        'maxPoolSize must be a whole number of 1 or more.',
      );
    }
  });
});
