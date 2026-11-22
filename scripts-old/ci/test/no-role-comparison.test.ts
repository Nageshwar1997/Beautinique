// no-role-comparison (RULES §3.5, TASKS T4.11): the shipped code (src/, app/) decides by
// permission and scope, never by a role's name, so roles stay data Master changes without a
// deploy. The rule's cases, the "bad" fixture through the real shared config (no file is exempt),
// and its app list against the one in the contracts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { ESLint, type Linter, type Rule, RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '../../..');
const FIXTURE = join(import.meta.dirname, 'fixtures/no-role-comparison');

interface RoleModule {
  APPS: readonly string[];
  isRoleKey: (text: string) => boolean;
  isRoleConstant: (name: string) => boolean;
  noRoleComparison: Rule.RuleModule;
}
interface ConfigModule {
  packageConfig: (options: {
    platform: 'neutral' | 'browser' | 'node';
    tsconfigRootDir: string;
  }) => Linter.Config[];
}

/** The configs are plain JS without types; a path in a variable keeps tsc from asking for them. */
async function load<T>(file: string): Promise<T> {
  const url = pathToFileURL(join(ROOT, file)).href;
  return (await import(url)) as T;
}

const roles = await load<RoleModule>('configs/eslint-rules/no-role-comparison.js');
const { packageConfig } = await load<ConfigModule>('configs/eslint-config.js');

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });
const compared = [{ messageId: 'compared' }];

tester.run('no-role-comparison', roles.noRoleComparison, {
  valid: [
    "if (permissions.includes('iam.grant.manage')) {}",
    "if (purpose === 'seller.kyc_document') {}",
    "if (event.type === 'admin.grant') {}",
    "if (role === '') {}",
    'if (role === null) {}',
    'if (a.role === b.role) {}',
    'if (role.key === query.role) {}',
    'if (roles.length === 0) {}',
    "if (app === 'customer') {}",
    "if (role.app === 'admin') {}",
    "if (key === 'network.area') {}",
    "if (status === 'pending') {}",
    "const labels = { role: 'Role' };",
    "const MASTER_ROLE = 'master.master';",
    'holdsRole(access, role);',
    "if (role.permissions.includes('iam.totp.reset')) {}",
  ],
  invalid: [
    { code: "if (role === 'MASTER') {}", errors: compared },
    { code: "if ('MASTER' !== role) {}", errors: compared },
    { code: "if (grant.role === 'master.master') {}", errors: compared },
    { code: "if (role.key == 'admin.state_admin') {}", errors: compared },
    { code: "if (role.name === 'Master') {}", errors: compared },
    { code: "if (roleKey === 'x') {}", errors: compared },
    { code: "if (held?.role === 'seller.account_owner') {}", errors: compared },
    { code: "if (x === ('master.master' as const)) {}", errors: compared },
    { code: 'if (key === MASTER_ROLE) {}', errors: compared },
    { code: 'if (ROLE_ADMIN === key) {}', errors: compared },
    { code: "mine.includes('master.master');", errors: compared },
    { code: "held.has('logistics.c_night_lead');", errors: compared },
    { code: 'keys.indexOf(MASTER_ROLE);', errors: compared },
    { code: "switch (role) { case 'MASTER': break; default: break; }", errors: compared },
    { code: "switch (key) { case 'admin.state_admin': break; default: break; }", errors: compared },
    { code: "holdsRole(access, 'master.master');", errors: [{ messageId: 'holdsRole' }] },
    { code: 'authz.holdsRole(access, MASTER_ROLE);', errors: [{ messageId: 'holdsRole' }] },
  ],
});

describe('role keys and constants', () => {
  it('know a role key by its app and name, and a role constant by its words', () => {
    expect(roles.isRoleKey('master.master')).toBe(true);
    expect(roles.isRoleKey('admin.c_desk_lead')).toBe(true);
    expect(roles.isRoleKey('network.area')).toBe(false);
    expect(roles.isRoleKey('iam.grant.manage')).toBe(false);
    expect(roles.isRoleKey('Master.master')).toBe(false);
    expect(roles.isRoleConstant('MASTER_ROLE')).toBe(true);
    expect(roles.isRoleConstant('ROLE_ADMIN')).toBe(true);
    expect(roles.isRoleConstant('SIGN_UP_ROLES')).toBe(true);
    expect(roles.isRoleConstant('CONTROLE')).toBe(false);
    expect(roles.isRoleConstant('masterRole')).toBe(false);
  });

  it('start with the apps of the contracts, the same eleven', () => {
    const source = readFileSync(join(ROOT, 'packages/shared/contracts/src/platform.ts'), 'utf8');
    const block = /export const APPS = \[([^\]]+)\]/.exec(source)?.[1] ?? '';
    const listed = [...block.matchAll(/'([a-z]+)'/g)].map(([, app]) => app);
    expect(listed).toHaveLength(11);
    expect([...roles.APPS]).toEqual(listed);
  });
});

describe('the shared config', () => {
  it('reports the bad file, and not the tests or code that only looks like it', async () => {
    const eslint = new ESLint({
      cwd: FIXTURE,
      overrideConfigFile: true,
      overrideConfig: packageConfig({ platform: 'neutral', tsconfigRootDir: FIXTURE }),
    });
    const results = await eslint.lintFiles(['src/**/*.ts', 'test/**/*.ts']);
    const reports = (file: string) => {
      const result = results.find((entry) => entry.filePath === join(FIXTURE, file));
      expect(result, file).toBeDefined();
      expect(result?.messages.filter((message) => message.fatal === true) ?? []).toEqual([]);
      return (result?.messages ?? [])
        .filter((message) => message.ruleId === 'bq/no-role-comparison')
        .map((message) => message.line);
    };
    expect(reports('src/bad.ts')).toEqual([4, 6, 8, 12, 20]);
    expect(reports('src/good.ts')).toEqual([]);
    expect(reports('test/sample.ts')).toEqual([]);
  });
});
