import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { object, string } from '@beautinique/shared-zod';
import { afterEach, describe, expect, it } from 'vitest';

import {
  defineEvent,
  definePermission,
  eventCatalogue,
  events,
  permissionCatalogue,
  permissions,
  routes,
} from '../src';
import { generateFiles, staleGenerated, writeGenerated } from '../src/codegen';

const info = { title: 'Beautinique API', version: '1.0.0' };
const input = { routes, events, permissions, info };
const NAMES = ['openapi.json', 'gateway-manifest.json', 'events.json', 'permissions.json'];
const directories: string[] = [];
const temp = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'bq-codegen-'));
  directories.push(directory);
  return directory;
};
afterEach(async () => {
  await Promise.all(directories.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

describe('generateFiles', () => {
  const files = generateFiles(input);
  const parsed = (name: string) =>
    JSON.parse(files.find((f) => f.name === name)?.content ?? 'null') as Record<string, unknown>;

  it('makes the four files in a fixed order, ending in a newline, the same bytes every time', () => {
    expect(files.map((f) => f.name)).toEqual(NAMES);
    expect(files.every((f) => f.content.endsWith('}\n'))).toBe(true);
    expect(generateFiles(input)).toEqual(files);
  });

  it('holds the OpenAPI document and the gateway manifest of the same routes', () => {
    expect(Object.keys(parsed('openapi.json').paths as object)).toEqual([
      '/platform/pings',
      '/platform/pings/{pingId}',
      '/platform/wake',
      '/auth/sign-up/code',
      '/auth/password/code',
      '/auth/otp/{challengeId}/resend',
      '/auth/otp/{challengeId}/verify',
      '/auth/login',
      '/auth/login/{loginId}/totp',
      '/auth/login/{loginId}/recovery',
      '/auth/login/{loginId}/totp/enroll',
      '/auth/login/{loginId}/totp/confirm',
      '/auth/refresh',
      '/auth/logout',
      '/iam/me',
      '/auth/sessions',
      '/auth/sessions/{sessionId}',
      '/auth/sessions/end-others',
      '/iam/roles',
      '/iam/roles/{roleKey}',
      '/iam/grants',
      '/iam/grants/{grantId}/end',
      '/iam/invitations',
      '/iam/invitations/{invitationId}/revoke',
      '/auth/invitations/code',
      '/auth/step-up',
      '/iam/users/{userId}/authenticator/reset',
      '/iam/users/{userId}/sessions/end',
    ]);
    const manifest = parsed('gateway-manifest.json') as {
      version: string;
      routes: { id: string }[];
    };
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.routes.map((r) => r.id)).toEqual(routes.map((r) => r.id));
  });

  it('lists every event version with the JSON Schema of its envelope', () => {
    const list = (
      parsed('events.json') as {
        events: { type: string; version: number; schema: { required: string[] } }[];
      }
    ).events;
    expect(list.map((e) => [e.type, e.version])).toEqual([
      ['identity.authenticator.reset', 1],
      ['identity.invitation.created', 1],
      ['identity.otp.requested', 1],
      ['identity.session.reuseDetected', 1],
      ['platform.ping.recorded', 1],
    ]);
    expect(list[4]?.schema.required).toEqual(expect.arrayContaining(['eventId', 'data', 'scope']));
  });

  it('lists permissions sorted by key', () => {
    const list = (
      parsed('permissions.json') as { permissions: { key: string; scopeTypes: string[] }[] }
    ).permissions;
    expect(list.map((p) => p.key)).toEqual([
      'iam.app.sign_in',
      'iam.grant.manage',
      'iam.grant.read',
      'iam.role.manage',
      'iam.session.revoke',
      'iam.totp.reset',
      'platform.ping.read',
    ]);
    expect(list.at(-1)?.scopeTypes).toEqual(['global']);
  });
});

describe('order', () => {
  it('sorts events by type then version, and permissions by key', () => {
    const event = (type: string, version: number) =>
      defineEvent({
        type,
        version,
        producer: 'core',
        description: 'x',
        data: object({ a: string() }),
      });
    const permission = (key: string) =>
      definePermission({
        key,
        description: 'x',
        scopeTypes: ['global'],
        risk: 'low',
        mfa: false,
        secondSignature: false,
      });
    const files = generateFiles({
      ...input,
      events: eventCatalogue([event('b.x.done', 1), event('a.x.done', 2), event('a.x.done', 1)]),
      permissions: permissionCatalogue([permission('m.b.read'), permission('m.a.read')]),
    });
    const content = (name: string) =>
      JSON.parse(files.find((f) => f.name === name)?.content ?? '{}') as never;
    const listed = (content('events.json') as { events: { type: string; version: number }[] })
      .events;
    expect(listed.map((e) => `${e.type}@${String(e.version)}`)).toEqual([
      'a.x.done@1',
      'a.x.done@2',
      'b.x.done@1',
    ]);
    const keys = (content('permissions.json') as { permissions: { key: string }[] }).permissions;
    expect(keys.map((p) => p.key)).toEqual(['m.a.read', 'm.b.read']);
  });
});

describe('write and check', () => {
  it('writes the files into a new folder and then finds nothing stale', async () => {
    const directory = path.join(await temp(), 'nested', 'generated');
    expect(await writeGenerated(directory, input)).toEqual(NAMES);
    const openapi = JSON.parse(await readFile(path.join(directory, 'openapi.json'), 'utf8')) as {
      openapi: string;
    };
    expect(openapi.openapi).toBe('3.1.0');
    expect(await staleGenerated(directory, input)).toEqual([]);
  });

  it('names a missing file, an edited file and files made for another version', async () => {
    const directory = await temp();
    expect(await staleGenerated(directory, input)).toEqual(NAMES);
    await writeGenerated(directory, input);
    await writeFile(path.join(directory, 'events.json'), '{}\n');
    await rm(path.join(directory, 'permissions.json'));
    expect(await staleGenerated(directory, input)).toEqual(['events.json', 'permissions.json']);
    const other = { ...input, info: { ...info, version: '2.0.0' } };
    expect(await staleGenerated(directory, other)).toEqual(
      expect.arrayContaining(['openapi.json', 'gateway-manifest.json']),
    );
  });
});

describe('the committed generated/ folder', () => {
  it('is up to date with the contracts (run "npm run generate" after changing them)', async () => {
    const root = new URL('../', import.meta.url);
    const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8')) as {
      version: string;
    };
    const directory = fileURLToPath(new URL('generated/', root));
    expect(await staleGenerated(directory, { ...input, info: { ...info, version } })).toEqual([]);
  });
});
