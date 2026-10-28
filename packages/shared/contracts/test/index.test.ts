import {
  array,
  boolean,
  mobileNumberZod,
  number,
  object,
  objectIdZod,
  paiseZod,
  string,
} from '@beautinique/shared-zod';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  APPS,
  buildPath,
  cursorPage,
  cursorQuery,
  defineAreaSetting,
  defineEvent,
  definePermission,
  defineRoute,
  DEPLOYABLES,
  ERROR_CODES,
  errorBody,
  errorCode,
  eventCatalogue,
  gatewayManifest,
  HEADERS,
  LOCATION_SCOPES,
  matchPath,
  MAX_S_MAX_AGE,
  MAX_STALE_WHILE_REVALIDATE,
  pathParams,
  permissionCatalogue,
  resolveAreaSetting,
  type RouteDefinition,
  type RouteInput,
  type RouteOutput,
  type RouteRequest,
  routeTable,
  SCOPE_TYPES,
  successBody,
  toOpenApi,
} from '../src/index';

const product = object({ id: objectIdZod, name: string(), price: paiseZod });

const getProduct = defineRoute({
  id: 'catalog.products.get',
  method: 'GET',
  path: '/catalog/products/:productId',
  summary: 'One product',
  apps: ['customer', 'seller'],
  access: { type: 'public' },
  rateLimit: 'public',
  idempotency: false,
  stepUp: false,
  owner: 'core',
  cache: { sMaxAge: 300, staleWhileRevalidate: 60 },
  input: { params: object({ productId: objectIdZod }), query: cursorQuery },
  output: product,
});

const updateContact = defineRoute({
  id: 'sellers.contacts.update',
  method: 'PATCH',
  path: '/sellers/:sellerId/contacts/:contactId',
  summary: 'Change a seller contact',
  apps: ['seller'],
  access: { type: 'permission', permission: 'seller.contact.update' },
  rateLimit: 'write',
  idempotency: true,
  stepUp: true,
  owner: 'core',
  input: {
    params: object({ sellerId: objectIdZod, contactId: objectIdZod }),
    body: object({ phone: mobileNumberZod }),
  },
  output: object({ updated: boolean() }),
});

/** A valid route to break one field at a time. */
const base = (): RouteDefinition => ({
  id: 'catalog.products.list',
  method: 'GET',
  path: '/catalog/products',
  summary: 'Products',
  apps: ['customer'],
  access: { type: 'signed-in' },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'core',
  input: {},
  output: array(product),
});

describe('platform constants', () => {
  it('lists the 11 apps, 5 deployables and the scope types with the location chain', () => {
    expect(APPS).toHaveLength(11);
    expect(new Set(APPS).size).toBe(11);
    expect(DEPLOYABLES).toEqual(['gateway', 'identity', 'payments', 'notify', 'core']);
    expect(LOCATION_SCOPES).toEqual(['global', 'state', 'district', 'city', 'hub']);
    for (const scope of LOCATION_SCOPES) expect(SCOPE_TYPES).toContain(scope);
    expect(HEADERS).toEqual({
      app: 'X-BQ-App',
      idempotencyKey: 'Idempotency-Key',
      requestId: 'X-Request-Id',
      clientIp: 'X-BQ-Client-Ip',
      passport: 'X-BQ-Passport',
    });
  });
});

describe('routes', () => {
  it('keep their exact types for clients and handlers', () => {
    expectTypeOf<RouteRequest<typeof updateContact>>().toEqualTypeOf<{
      params: { sellerId: string; contactId: string };
      query: undefined;
      body: { phone: string };
    }>();
    expectTypeOf<RouteInput<typeof getProduct>['query']>().toEqualTypeOf<{
      cursor?: string | undefined;
      limit: number;
    }>();
    expectTypeOf<RouteOutput<typeof getProduct>>().toEqualTypeOf<{
      id: string;
      name: string;
      price: number;
    }>();
    expect(Object.isFrozen(getProduct)).toBe(true);
  });

  it('refuse wrong declarations with a clear message', () => {
    const bad: [Partial<RouteDefinition>, string][] = [
      [{ id: 'products' }, 'id must look like'],
      [{ method: 'HEAD' as RouteDefinition['method'] }, 'unknown method'],
      [{ path: 'catalog/products' }, 'path must be'],
      [{ path: '/Catalog/Products' }, 'path must be'],
      [{ path: '/catalog//products' }, 'path must be'],
      [{ summary: '  ' }, 'needs a summary'],
      [{ apps: [] }, 'at least one app'],
      [{ apps: ['shop' as RouteDefinition['apps'][number]] }, 'unknown app "shop"'],
      [{ apps: ['customer', 'customer'] }, 'lists an app twice'],
      [{ owner: 'billing' as RouteDefinition['owner'] }, 'unknown owner'],
      [{ rateLimit: 'fast' as RouteDefinition['rateLimit'] }, 'unknown rate-limit class'],
      [{ access: { type: 'permission', permission: 'Seller.Update' } }, 'is not a permission key'],
      [{ stepUp: true }, 'step-up needs a permission route'],
      [{ idempotency: true }, 'GET routes cannot need an Idempotency-Key'],
      [{ input: { body: object({}) } }, 'GET routes cannot have a body'],
      [{ method: 'DELETE', input: { body: object({}) } }, 'DELETE routes cannot have a body'],
      [{ path: '/catalog/products/:id' }, 'path parameters (id) and input.params (none) differ'],
      [
        { input: { params: object({ id: objectIdZod }) } },
        'path parameters (none) and input.params (id) differ',
      ],
      [
        { path: '/a/:id/b/:id', input: { params: object({ id: objectIdZod }) } },
        'path repeats a parameter',
      ],
      [{ cache: { sMaxAge: 60, staleWhileRevalidate: 0 } }, 'only public GET routes can be cached'],
      [
        {
          method: 'POST',
          access: { type: 'public' },
          cache: { sMaxAge: 60, staleWhileRevalidate: 0 },
        },
        'only public GET routes can be cached',
      ],
      ...[0, 1.5, MAX_S_MAX_AGE + 1].map((sMaxAge): [Partial<RouteDefinition>, string] => [
        { access: { type: 'public' }, cache: { sMaxAge, staleWhileRevalidate: 0 } },
        `cache.sMaxAge must be a whole number of seconds from 1 to ${String(MAX_S_MAX_AGE)}`,
      ]),
      ...[-1, 0.5, MAX_STALE_WHILE_REVALIDATE + 1].map(
        (staleWhileRevalidate): [Partial<RouteDefinition>, string] => [
          { access: { type: 'public' }, cache: { sMaxAge: 60, staleWhileRevalidate } },
          'cache.staleWhileRevalidate must be a whole number of seconds',
        ],
      ),
    ];
    for (const [change, message] of bad) {
      expect(() => defineRoute({ ...base(), ...change }), JSON.stringify(change)).toThrow(message);
    }
    expect(() => defineRoute(base())).not.toThrow();
    for (const cache of [
      { sMaxAge: 1, staleWhileRevalidate: 0 },
      { sMaxAge: MAX_S_MAX_AGE, staleWhileRevalidate: MAX_STALE_WHILE_REVALIDATE },
    ]) {
      expect(() => defineRoute({ ...base(), access: { type: 'public' }, cache })).not.toThrow();
    }
  });

  it('path helpers build, read and match paths', () => {
    expect(pathParams('/sellers/:sellerId/contacts/:contactId')).toEqual(['sellerId', 'contactId']);
    expect(buildPath('/catalog/products/:productId', { productId: 'a b/c' })).toBe(
      '/catalog/products/a%20b%2Fc',
    );
    expect(buildPath('/orders/:n', { n: 42 })).toBe('/orders/42');
    expect(() => buildPath('/catalog/products/:productId')).toThrow(
      'Missing path parameter "productId"',
    );
    expect(() => buildPath('/catalog/products/:productId', { productId: '' })).toThrow(
      'Missing path parameter',
    );
    expect(matchPath('/catalog/products/:productId', '/catalog/products/a%20b')).toEqual({
      productId: 'a b',
    });
    expect(matchPath('/catalog/products/:productId', '/catalog/products/x/')).toEqual({
      productId: 'x',
    });
    expect(matchPath('/catalog/products/:productId', '/catalog/products')).toBeNull();
    expect(matchPath('/catalog/products/:productId', '/catalog/brands/x')).toBeNull();
    expect(matchPath('/catalog/products/:productId', '/catalog/products/%E0%A4')).toBeNull();
    expect(matchPath('/a/:b', '/a/')).toBeNull();
  });

  it('a route table refuses duplicate ids and two routes for the same method and path shape', () => {
    expect(routeTable([getProduct, updateContact])).toHaveLength(2);
    expect(() => routeTable([getProduct, getProduct])).toThrow('declared twice');
    const sameShape = defineRoute({
      ...getProduct,
      id: 'catalog.products.byId',
      path: '/catalog/products/:id',
      input: { params: object({ id: objectIdZod }) },
    });
    expect(() => routeTable([getProduct, sameShape])).toThrow(
      'both match GET /catalog/products/:id',
    );
    const otherMethod = defineRoute({
      ...updateContact,
      id: 'sellers.contacts.replace',
      method: 'PUT',
    });
    expect(() => routeTable([updateContact, otherMethod])).not.toThrow();
  });

  it('the gateway manifest is plain JSON with everything the gateway checks', () => {
    const manifest = gatewayManifest([updateContact]);
    expect(JSON.parse(JSON.stringify(manifest))).toEqual(manifest);
    expect(manifest[0]).toEqual({
      id: 'sellers.contacts.update',
      method: 'PATCH',
      path: '/sellers/:sellerId/contacts/:contactId',
      owner: 'core',
      apps: ['seller'],
      access: { type: 'permission', permission: 'seller.contact.update' },
      rateLimit: 'write',
      idempotency: true,
      stepUp: true,
      cache: null,
    });
    expect(gatewayManifest([getProduct])[0]?.cache).toEqual({
      sMaxAge: 300,
      staleWhileRevalidate: 60,
    });
  });
});

describe('permissions', () => {
  const valid = {
    key: 'network.area.go_live.request',
    description: 'Ask to open an area',
    scopeTypes: ['state', 'district'] as const,
    risk: 'high' as const,
    mfa: true,
    secondSignature: true,
  };

  it('are declared once with scope types and safeguards', () => {
    const permission = definePermission(valid);
    expect(permission.key).toBe('network.area.go_live.request');
    expect(Object.isFrozen(permission) && Object.isFrozen(permission.scopeTypes)).toBe(true);
    const catalogue = permissionCatalogue([
      permission,
      definePermission({ ...valid, key: 'seller.application.decide', secondSignature: false }),
    ]);
    expect([...catalogue.keys()]).toEqual([
      'network.area.go_live.request',
      'seller.application.decide',
    ]);
    expect(() => permissionCatalogue([permission, permission])).toThrow('declared twice');
  });

  it('refuse wrong declarations', () => {
    expect(() => definePermission({ ...valid, key: 'network.area' })).toThrow(
      '<module>.<resource>.<action>',
    );
    expect(() => definePermission({ ...valid, key: 'Network.Area.Open' })).toThrow(
      '<module>.<resource>.<action>',
    );
    expect(() => definePermission({ ...valid, description: ' ' })).toThrow('needs a description');
    expect(() => definePermission({ ...valid, scopeTypes: [] })).toThrow('at least one scope type');
    expect(() => definePermission({ ...valid, scopeTypes: ['planet' as 'state'] })).toThrow(
      'unknown scope type "planet"',
    );
    expect(() => definePermission({ ...valid, scopeTypes: ['state', 'state'] })).toThrow(
      'scope type twice',
    );
    expect(() => definePermission({ ...valid, risk: 'medium' })).toThrow('its risk must be high');
  });
});

describe('events', () => {
  const approved = defineEvent({
    type: 'sellers.org.approved',
    version: 1,
    producer: 'core',
    description: 'A seller organisation was approved',
    data: object({ sellerOrgId: objectIdZod }),
  });
  const event = {
    eventId: '0192f3a4-5b6c-7d8e-9f01-23456789abcd',
    type: 'sellers.org.approved',
    version: 1,
    occurredAt: '2026-10-20T07:56:26.899Z',
    producer: 'core',
    aggregate: { type: 'sellerOrg', id: '65f1a2b3c4d5e6f708192a3b' },
    actor: { type: 'user', id: 'u1' },
    correlationId: 'req-1',
    causationId: null,
    scope: { type: 'state', ids: ['27'] },
    data: { sellerOrgId: '65f1a2b3c4d5e6f708192a3b' },
  };

  it('validate the whole envelope', () => {
    expect(approved.envelope.parse(event)).toEqual(event);
    for (const [field, value] of [
      ['eventId', '3f6c2a1e-8b4d-4c2a-9f1e-2b3c4d5e6f70'],
      ['type', 'sellers.org.rejected'],
      ['version', 2],
      ['occurredAt', '20 Oct 2026'],
      ['producer', 'identity'],
      ['actor', { type: 'robot', id: 'x' }],
      ['data', { sellerOrgId: 'nope' }],
      ['scope', { type: 'planet', ids: [] }],
    ] as const) {
      expect(approved.envelope.safeParse({ ...event, [field]: value }).success, field).toBe(false);
    }
    expect(
      approved.envelope.safeParse({ ...event, causationId: 'evt-0', scope: null }).success,
    ).toBe(true);
  });

  it('refuse wrong declarations', () => {
    const def = {
      type: 'sellers.org.approved',
      version: 1,
      producer: 'core' as const,
      description: 'x',
      data: object({}),
    };
    expect(() => defineEvent({ ...def, type: 'sellers.approved' })).toThrow(
      '<context>.<aggregate>.<pastTense>',
    );
    expect(() => defineEvent({ ...def, type: 'Sellers.org.approved' })).toThrow(
      '<context>.<aggregate>.<pastTense>',
    );
    expect(() => defineEvent({ ...def, version: 0 })).toThrow(
      'version must be a whole number from 1',
    );
    expect(() => defineEvent({ ...def, version: 1.5 })).toThrow('version must be');
    expect(() => defineEvent({ ...def, producer: 'billing' as 'core' })).toThrow(
      'unknown producer',
    );
    expect(() => defineEvent({ ...def, description: '' })).toThrow('needs a description');
  });

  it('a catalogue finds versions, gives the latest, and refuses duplicates and gaps', () => {
    const v2 = defineEvent({
      ...approved,
      version: 2,
      data: object({ sellerOrgId: objectIdZod, tier: string() }),
    });
    const catalogue = eventCatalogue([approved, v2]);
    expect(catalogue.get('sellers.org.approved', 1)).toBe(approved);
    expect(catalogue.latest('sellers.org.approved')).toBe(v2);
    expect(catalogue.latest('nope.x.happened')).toBeUndefined();
    expect(catalogue.all()).toHaveLength(2);
    expect(() => eventCatalogue([approved, approved])).toThrow('declared twice');
    expect(() => eventCatalogue([v2])).toThrow('versions must be 1..n without gaps, got 2');
  });
});

describe('area settings', () => {
  const promise = defineAreaSetting({
    key: 'delivery.promise_days',
    description: 'Days from order to delivery shown to customers',
    schema: number().int().min(1).max(15),
    defaultValue: 4,
  });

  it('the most specific value wins', () => {
    const values = {
      global: 5,
      state: { '27': 4 },
      district: { '519': 2 },
      pincode: { '411001': 1 },
    };
    expect(
      resolveAreaSetting(promise, values, {
        stateId: '27',
        districtId: '519',
        pincode: '411001',
      }),
    ).toEqual({ value: 1, level: 'pincode' });
    expect(
      resolveAreaSetting(promise, values, {
        stateId: '27',
        districtId: '519',
        pincode: '411002',
      }),
    ).toEqual({ value: 2, level: 'district' });
    expect(resolveAreaSetting(promise, values, { stateId: '27', districtId: '520' })).toEqual({
      value: 4,
      level: 'state',
    });
    expect(resolveAreaSetting(promise, values, { stateId: '29' })).toEqual({
      value: 5,
      level: 'global',
    });
    expect(resolveAreaSetting(promise, {}, { stateId: '29' })).toEqual({
      value: 4,
      level: 'default',
    });
    expect(resolveAreaSetting(promise, { state: {} }, { stateId: 'constructor' })).toEqual({
      value: 4,
      level: 'default',
    });
  });

  it('refuse wrong declarations, including an invalid default', () => {
    expect(() => defineAreaSetting({ ...promise, key: 'promise' })).toThrow('<area>.<name>');
    expect(() => defineAreaSetting({ ...promise, description: '' })).toThrow('needs a description');
    expect(() => defineAreaSetting({ ...promise, defaultValue: 0 })).toThrow('invalid default');
  });
});

describe('http bodies', () => {
  it('error codes have sensible statuses and the error body validates', () => {
    for (const [code, status] of Object.entries(ERROR_CODES)) {
      expect(errorCode.safeParse(code).success, code).toBe(true);
      expect(status >= 400 && status < 600, code).toBe(true);
    }
    expect(ERROR_CODES.STEP_UP_REQUIRED).toBe(401);
    expect(ERROR_CODES.IDEMPOTENCY_KEY_REUSED).toBe(422);
    expect(errorCode.safeParse('notFound').success).toBe(false);
    const body = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Check the form',
        details: [{ path: ['items', 0, 'qty'], message: 'Too many' }],
        requestId: 'r1',
      },
    };
    expect(errorBody.parse(body)).toEqual(body);
    expect(
      errorBody.safeParse({ error: { code: 'x', message: 'm', requestId: 'r' } }).success,
    ).toBe(false);
  });

  it('success bodies and cursor pagination', () => {
    expect(successBody(number()).parse({ data: 3 })).toEqual({ data: 3 });
    expect(cursorQuery.parse({})).toEqual({ limit: 20 });
    expect(cursorQuery.parse({ cursor: 'abc', limit: '50' })).toEqual({ cursor: 'abc', limit: 50 });
    for (const bad of [{ limit: 0 }, { limit: 101 }, { limit: 2.5 }, { cursor: '' }]) {
      expect(cursorQuery.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
    }
    expect(cursorPage(string()).parse({ items: ['a'], nextCursor: null })).toEqual({
      items: ['a'],
      nextCursor: null,
    });
  });
});

describe('OpenAPI', () => {
  const doc = toOpenApi([getProduct, updateContact], {
    title: 'Beautinique API',
    version: '1.0.0',
  });
  const get = doc.paths['/catalog/products/{productId}']?.get as Record<string, unknown>;
  const patch = doc.paths['/sellers/{sellerId}/contacts/{contactId}']?.patch as Record<
    string,
    unknown
  >;

  it('is plain JSON in OpenAPI 3.1 form', () => {
    expect(doc.openapi).toBe('3.1.0');
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
    expect(Object.keys(doc.paths)).toEqual([
      '/catalog/products/{productId}',
      '/sellers/{sellerId}/contacts/{contactId}',
    ]);
  });

  it('describes parameters, headers, body, responses, security and x-bq', () => {
    expect(get.operationId).toBe('catalog.products.get');
    expect(get.tags).toEqual(['catalog']);
    const params = get.parameters as {
      name: string;
      in: string;
      required: boolean;
      schema: Record<string, unknown>;
    }[];
    expect(params.map((p) => `${p.in}:${p.name}:${String(p.required)}`)).toEqual([
      'path:productId:true',
      'query:cursor:false',
      'query:limit:false',
      'header:X-BQ-App:true',
    ]);
    expect(params[3]?.schema).toEqual({ type: 'string', enum: ['customer', 'seller'] });
    expect(get.security).toEqual([]);
    expect(get.requestBody).toBeUndefined();

    const patchParams = patch.parameters as { name: string; in: string }[];
    expect(patchParams.map((p) => p.name)).toEqual([
      'sellerId',
      'contactId',
      'X-BQ-App',
      'Idempotency-Key',
    ]);
    expect(patch.security).toEqual([{ bearerAuth: [] }]);
    const body = (
      patch.requestBody as {
        content: Record<string, { schema: { properties: Record<string, unknown> } }>;
      }
    ).content['application/json']?.schema;
    expect(body?.properties.phone).toMatchObject({ type: 'string' });
    expect(patch['x-bq']).toEqual({
      apps: ['seller'],
      access: { type: 'permission', permission: 'seller.contact.update' },
      rateLimit: 'write',
      idempotency: true,
      stepUp: true,
      owner: 'core',
      cache: null,
    });
    expect((get['x-bq'] as { cache: unknown }).cache).toEqual({
      sMaxAge: 300,
      staleWhileRevalidate: 60,
    });
    const ok = (
      get.responses as Record<
        string,
        {
          content: Record<
            string,
            { schema: { properties: { data: { properties: Record<string, unknown> } } } }
          >;
        }
      >
    )['200'];
    expect(
      Object.keys(ok?.content['application/json']?.schema.properties.data.properties ?? {}),
    ).toEqual(['id', 'name', 'price']);
    expect((get.responses as Record<string, unknown>).default).toEqual({
      $ref: '#/components/responses/Error',
    });
    expect(Object.keys(doc.components.schemas.Error)).toContain('properties');
  });
});
