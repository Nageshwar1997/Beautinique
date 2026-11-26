import { describe, expect, it } from 'vitest';
import { string, strictObject } from 'zod';

import { buildOpenApi, defineRoute, openApiJson } from '../src/index.ts';
import { allSampleRoutes, getOrder, orderRead, placeOrder } from './utils/sample-contracts.ts';

const info = { title: 'Beautinique API', version: '1.0.0' };
const document = buildOpenApi(allSampleRoutes, info);

type Operation = {
  operationId: string;
  tags: string[];
  parameters?: { name: string; in: string; required: boolean; schema: unknown }[];
  requestBody?: { required: boolean; content: Record<string, { schema: Record<string, unknown> }> };
  responses: Record<string, { description: string; content?: unknown; headers?: unknown }>;
  security: unknown[];
  [extension: `x-${string}`]: unknown;
};

function operation(path: string, method: string): Operation {
  return document.paths[path]?.[method] as unknown as Operation;
}

describe('buildOpenApi: the document', () => {
  it('AC-PLATFORM-15: is an OpenAPI 3.1 document with the paths written as {name}', () => {
    expect(document.openapi).toBe('3.1.0');
    expect(document.info).toEqual(info);
    expect(Object.keys(document.paths)).toEqual([
      '/api/v1/catalog/home',
      '/api/v1/commerce/orders',
      '/api/v1/commerce/orders/{orderId}',
      '/api/v1/commerce/orders/mine',
      '/api/v1/finance/payout-batches/{batchId}/approve',
    ]);
  });

  it('AC-PLATFORM-15: is the same for the same routes in any order, and the same after JSON', () => {
    const reversed = buildOpenApi([...allSampleRoutes].reverse(), info);

    expect(openApiJson(reversed)).toBe(openApiJson(document));
    expect(JSON.parse(openApiJson(document))).toEqual(document);
    expect(openApiJson(document).endsWith('}\n')).toBe(true);
  });

  it('AC-PLATFORM-15: names its dialect once, not in each schema', () => {
    expect(openApiJson(document)).not.toContain('$schema');
  });

  it('AC-PLATFORM-15: describes the error body once, and the cookie of the session', () => {
    expect(document.components.schemas.Error).toMatchObject({
      type: 'object',
      additionalProperties: false,
      required: ['error'],
    });
    expect(document.components.securitySchemes.session).toEqual({
      type: 'apiKey',
      in: 'cookie',
      name: 'session',
    });
  });

  it('CR-12: refuses two routes with one id', () => {
    expect(() => buildOpenApi([getOrder, getOrder], info)).toThrow('Two routes have the id');
  });
});

describe('buildOpenApi: an operation', () => {
  it('AC-PLATFORM-15: has the id, the tag, the extensions of the contract and the session', () => {
    const place = operation('/api/v1/commerce/orders', 'post');

    expect(place).toMatchObject({
      operationId: 'commerce.order.place',
      summary: 'Place an order',
      tags: ['commerce'],
      security: [{ session: [] }],
      'x-apps': ['customer'],
      'x-permission': 'commerce.order.place',
      'x-step-up': false,
      'x-rate-limit': 'place-order',
      'x-idempotency': 'required',
    });
    expect(place).not.toHaveProperty('x-cache-max-age-seconds');
  });

  it('SR-036: the body is the strict input schema of the contract', () => {
    const body = operation('/api/v1/commerce/orders', 'post').requestBody;

    expect(body?.required).toBe(true);
    expect(body?.content['application/json']?.schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
      required: ['addressId', 'items'],
    });
  });

  it('SR-045: a route that needs an idempotency key says so in a header', () => {
    expect(operation('/api/v1/commerce/orders', 'post').parameters).toContainEqual({
      name: 'Idempotency-Key',
      in: 'header',
      required: true,
      schema: { type: 'string' },
    });
    expect(operation('/api/v1/commerce/orders/{orderId}', 'get').parameters).not.toContainEqual(
      expect.objectContaining({ name: 'Idempotency-Key' }),
    );
  });

  it('AC-PLATFORM-15: the path parts and the query are parameters, required unless they may be left out', () => {
    expect(operation('/api/v1/commerce/orders/{orderId}', 'get').parameters).toEqual([
      { name: 'orderId', in: 'path', required: true, schema: { type: 'string' } },
    ]);
    const query = operation('/api/v1/commerce/orders/mine', 'get').parameters;
    expect(query?.map((parameter) => [parameter.name, parameter.in, parameter.required])).toEqual([
      ['cursor', 'query', false],
      ['limit', 'query', false],
    ]);
    expect(operation('/api/v1/catalog/home', 'get').parameters).toBeUndefined();
  });

  it('AC-PLATFORM-15: a route that reads has no request body', () => {
    expect(operation('/api/v1/commerce/orders/{orderId}', 'get').requestBody).toBeUndefined();
  });
});

describe('buildOpenApi: the answers', () => {
  it('AC-PLATFORM-15: the success has the status and the output schema of the contract', () => {
    const created = operation('/api/v1/commerce/orders', 'post').responses['201'];
    expect(created?.description).toBe('Success');
    expect(created?.content).toMatchObject({
      'application/json': { schema: { type: 'object', required: ['orderId', 'status'] } },
    });
    expect(operation('/api/v1/commerce/orders/{orderId}', 'get').responses['200']).toBeDefined();
  });

  it('AC-PLATFORM-15: a 204 has no content', () => {
    const approve = operation('/api/v1/finance/payout-batches/{batchId}/approve', 'post');

    expect(approve.responses['204']).toEqual({ description: 'Success, no content' });
  });

  it('CR-18: the errors are by status, with the codes of the route and the common ones its shape implies', () => {
    const place = operation('/api/v1/commerce/orders', 'post').responses;

    expect(Object.keys(place)).toEqual([
      '201',
      '400',
      '401',
      '403',
      '409',
      '413',
      '422',
      '426',
      '429',
      '500',
      '503',
    ]);
    expect(place['409']?.description).toBe('IDEMPOTENCY_IN_PROGRESS, COMMERCE_STOCK_UNAVAILABLE');
    expect(place['422']?.description).toBe('IDEMPOTENCY_KEY_REUSED');
    expect(place['400']?.content).toEqual({
      'application/json': { schema: { $ref: '#/components/schemas/Error' } },
    });
  });

  it('SR-008: 429 and 503 tell the caller when to come back', () => {
    const responses = operation('/api/v1/commerce/orders', 'post').responses;

    expect(responses['429']?.headers).toEqual({ 'Retry-After': { schema: { type: 'integer' } } });
    expect(responses['503']?.headers).toEqual({ 'Retry-After': { schema: { type: 'integer' } } });
    expect(responses['400']?.headers).toBeUndefined();
  });

  it('SR-032: a public route needs no session and has no 401 or 403; a path part can be 404', () => {
    const home = operation('/api/v1/catalog/home', 'get');
    const order = operation('/api/v1/commerce/orders/{orderId}', 'get');

    expect(home.security).toEqual([]);
    expect(home['x-cache-max-age-seconds']).toBe(60);
    expect(home['x-permission']).toBeNull();
    expect(Object.keys(home.responses)).toEqual(['200', '426', '429', '500', '503']);
    expect(Object.keys(order.responses)).toContain('404');
    expect(Object.keys(operation('/api/v1/commerce/orders', 'post').responses)).not.toContain(
      '404',
    );
  });

  it('SR-037: a step-up route says so', () => {
    expect(operation('/api/v1/finance/payout-batches/{batchId}/approve', 'post')['x-step-up']).toBe(
      true,
    );
  });

  it('AC-PLATFORM-15: two methods on one path are two operations of that path', () => {
    const list = defineRoute({
      id: 'commerce.order.list',
      method: 'GET',
      path: '/api/v1/commerce/orders',
      summary: 'List orders',
      apps: ['customer'],
      permission: orderRead,
      rateLimit: 'read',
      response: strictObject({ items: string('items is required.') }, 'The answer has items only.'),
    });
    const both = buildOpenApi([placeOrder, list], info);

    expect(Object.keys(both.paths['/api/v1/commerce/orders'] ?? {})).toEqual(['get', 'post']);
  });
});
