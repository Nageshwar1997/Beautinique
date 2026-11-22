// no-hardcoded-geo (RULES §3.4, TASKS T4.10): places are data, so the shipped code (src/, app/)
// names no state, pincode, district or hub. The rule's cases, the "bad" fixture through the real
// shared config (configs/eslint-config.js, with geoDataFiles), and its states list against the
// one in the contracts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { ESLint, type Linter, type Rule, RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '../../..');
const FIXTURE = join(import.meta.dirname, 'fixtures/no-hardcoded-geo');

interface GeoModule {
  STATES: readonly (readonly [string, string])[];
  placeKind: (name: string) => 'place' | 'state' | null;
  noHardcodedGeo: Rule.RuleModule;
}
interface ConfigModule {
  packageConfig: (options: {
    platform: 'neutral' | 'browser' | 'node';
    tsconfigRootDir: string;
    geoDataFiles?: string[];
  }) => Linter.Config[];
}

/** The configs are plain JS without types; a path in a variable keeps tsc from asking for them. */
async function load<T>(file: string): Promise<T> {
  const url = pathToFileURL(join(ROOT, file)).href;
  return (await import(url)) as T;
}

const geo = await load<GeoModule>('configs/eslint-rules/no-hardcoded-geo.js');
const { packageConfig } = await load<ConfigModule>('configs/eslint-config.js');

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

tester.run('no-hardcoded-geo', geo.noHardcodedGeo, {
  valid: [
    "const zone = 'Asia/Kolkata';",
    "const text = 'Maharashtra, Gujarat';",
    "if (state === 'idle') {}",
    "if (readyState === 'complete') {}",
    "if (scope.type === 'district') {}",
    "if (district === '') {}",
    "if (provider === 'github') {}",
    "if (gitHub.name === 'x') {}",
    "const SCOPE_NAMES = { state: 'State', district: 'District', hub: 'Hub' };",
    "const districtLabel = 'District';",
    'const TIMEOUT_MS = 300000;',
    "const code = '012345';",
    "const order = '4110011';",
    'if (district === place.district) {}',
    "if (capacity === 'full') {}",
    "const lane = { state: 'UNKNOWN' };",
  ],
  invalid: [
    { code: "const s = 'Maharashtra';", errors: [{ messageId: 'stateName' }] },
    { code: "const s = '  tamil   nadu ';", errors: [{ messageId: 'stateName' }] },
    { code: 'const s = `Kerala`;', errors: [{ messageId: 'stateName' }] },
    { code: "const s = 'Orissa';", errors: [{ messageId: 'stateName' }] },
    { code: "type Launch = 'Goa';", errors: [{ messageId: 'stateName' }] },
    { code: 'const option = <option>West Bengal</option>;', errors: [{ messageId: 'stateName' }] },
    { code: "const pin = '411001';", errors: [{ messageId: 'pincode' }] },
    { code: 'const pin = `560001`;', errors: [{ messageId: 'pincode' }] },
    { code: "if (district === 'Pune') {}", errors: [{ messageId: 'placeDecision' }] },
    { code: "if ('Pune' !== order.district) {}", errors: [{ messageId: 'placeDecision' }] },
    { code: "if (order?.hubId == 'H1') {}", errors: [{ messageId: 'placeDecision' }] },
    { code: 'if (pinCode === 411001) {}', errors: [{ messageId: 'placeDecision' }] },
    { code: "if (row['warehouse'] === 'W1') {}", errors: [{ messageId: 'placeDecision' }] },
    { code: "if (stateCode === '27') {}", errors: [{ messageId: 'placeDecision' }] },
    { code: "if (PUNE_CITY === 'x') {}", errors: [{ messageId: 'placeDecision' }] },
    {
      code: "switch (hubId) { case 'CHAKAN-01': break; default: break; }",
      errors: [{ messageId: 'placeDecision' }],
    },
    { code: "warehouseIds.includes('W1');", errors: [{ messageId: 'placeDecision' }] },
    { code: "districtCodes?.has('2701');", errors: [{ messageId: 'placeDecision' }] },
    { code: "const hubId = 'CHAKAN-01';", errors: [{ messageId: 'placeValue' }] },
    { code: "const district = 'Pune';", errors: [{ messageId: 'placeValue' }] },
    { code: "const order = { hubId: 'H1' };", errors: [{ messageId: 'placeValue' }] },
    { code: 'const address = { pincode: 411001 };', errors: [{ messageId: 'placeValue' }] },
    { code: "if (state === 'MH') {}", errors: [{ messageId: 'stateId' }] },
    { code: "const scope = { state: 'DL' };", errors: [{ messageId: 'stateId' }] },
    { code: "const stateId = 'KA';", errors: [{ messageId: 'stateId' }] },
    { code: "const home = { stateId: 'TN' as const };", errors: [{ messageId: 'stateId' }] },
  ],
});

describe('placeKind', () => {
  it('reads the last word of a name, past id/code/name', () => {
    expect(geo.placeKind('district')).toBe('place');
    expect(geo.placeKind('hubIds')).toBe('place');
    expect(geo.placeKind('warehouseCodes')).toBe('place');
    expect(geo.placeKind('PUNE_DISTRICT')).toBe('place');
    expect(geo.placeKind('pinCode')).toBe('place');
    expect(geo.placeKind('postalCodes')).toBe('place');
    expect(geo.placeKind('lgdCode')).toBe('place');
    expect(geo.placeKind('cities')).toBe('place');
    expect(geo.placeKind('stateId')).toBe('place');
    expect(geo.placeKind('state')).toBe('state');
    expect(geo.placeKind('readyState')).toBe('state');
    expect(geo.placeKind('GitHub')).toBeNull();
    expect(geo.placeKind('capacity')).toBeNull();
    expect(geo.placeKind('pin')).toBeNull();
    expect(geo.placeKind('id')).toBeNull();
  });
});

describe('the shared config', () => {
  it('reports the bad file, and not the place data, the tests or code that only looks like places', async () => {
    const eslint = new ESLint({
      cwd: FIXTURE,
      overrideConfigFile: true,
      overrideConfig: packageConfig({
        platform: 'neutral',
        tsconfigRootDir: FIXTURE,
        geoDataFiles: ['src/places.ts'],
      }),
    });
    const results = await eslint.lintFiles(['src/**/*.ts', 'test/**/*.ts']);
    const reports = (file: string) => {
      const result = results.find((entry) => entry.filePath === join(FIXTURE, file));
      expect(result, file).toBeDefined();
      expect(result?.messages.filter((message) => message.fatal === true) ?? []).toEqual([]);
      return (result?.messages ?? [])
        .filter((message) => message.ruleId === 'bq/no-hardcoded-geo')
        .map((message) => message.line);
    };
    expect(reports('src/bad.ts')).toEqual([2, 4, 7, 12, 19]);
    expect(reports('src/places.ts')).toEqual([]);
    expect(reports('src/good.ts')).toEqual([]);
    expect(reports('test/sample.ts')).toEqual([]);
  });
});

describe('the states list', () => {
  it('is the contracts list of states and union territories, id for id and name for name', () => {
    const source = readFileSync(join(ROOT, 'packages/shared/contracts/src/states.ts'), 'utf8');
    const listed = [...source.matchAll(/\bid: '([A-Z]{2})',\s*name: '([^']+)'/g)].map(
      ([, id, name]) => [id, name],
    );
    expect(listed).toHaveLength(36);
    expect(geo.STATES).toEqual(listed);
  });
});
