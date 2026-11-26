import {
  defineErrors,
  definePermission,
  defineRoute,
  type PermissionDefinition,
} from '@beautinique/shared-contracts';
import { array, boolean, date, number, strictObject, string, undefined as nothing } from 'zod';

import type { Actor, Grant } from '../../src/actor.ts';

// Permissions and routes shaped like the real ones, to run the kit against.

export const orderRead = definePermission({
  name: 'commerce.order.read',
  scope: 'self',
  authenticator: false,
  stepUp: false,
  subRoleAllowed: true,
});

export const orderPlace = definePermission({
  name: 'commerce.order.place',
  scope: 'self',
  authenticator: false,
  stepUp: false,
  subRoleAllowed: true,
});

export const hubSwitch = definePermission({
  name: 'logistics.hub.switch',
  scope: 'hub',
  authenticator: true,
  stepUp: true,
  subRoleAllowed: false,
});

export const commerceErrors = defineErrors('commerce', {
  STOCK_UNAVAILABLE: 409,
  ORDER_CLOSED: 422,
});

const orderSummary = strictObject(
  { orderId: string('orderId is required.'), status: string('status is required.') },
  'An order has orderId and status only.',
);

export const getOrder = defineRoute({
  id: 'commerce.order.get',
  method: 'GET',
  path: '/api/v1/commerce/orders/:orderId',
  summary: 'Read an order',
  apps: ['customer', 'seller'],
  permission: orderRead,
  rateLimit: 'read',
  params: { orderId: string('orderId is required.') },
  response: orderSummary,
  errors: { COMMERCE_ORDER_CLOSED: commerceErrors.COMMERCE_ORDER_CLOSED },
});

export const listOrders = defineRoute({
  id: 'commerce.order.list',
  method: 'GET',
  path: '/api/v1/commerce/orders',
  summary: 'The orders of the person',
  apps: ['customer'],
  permission: orderRead,
  rateLimit: 'read',
  query: {
    limit: number('limit must be a number.')
      .int('limit must be a whole number.')
      .min(1, 'limit must be at least 1.')
      .max(100, 'limit must be at most 100.')
      .optional(),
    cursor: string('cursor must be text.').optional(),
    open: boolean('open must be true or false.').optional(),
    since: date('since must be a date.').optional(),
    ids: array(number('ids must be numbers.'), 'ids must be a list.').optional(),
  },
  response: strictObject(
    { items: array(string('An item must be text.'), 'items must be a list.') },
    'The orders have items only.',
  ),
});

export const placeOrder = defineRoute({
  id: 'commerce.order.place',
  method: 'POST',
  path: '/api/v1/commerce/orders',
  summary: 'Place an order',
  apps: ['customer'],
  permission: orderPlace,
  rateLimit: 'place-order',
  idempotency: 'required',
  body: {
    addressId: string('addressId is required.'),
    quantity: number('quantity must be a number.').int('quantity must be a whole number.'),
  },
  response: orderSummary,
  status: 201,
  errors: { COMMERCE_STOCK_UNAVAILABLE: commerceErrors.COMMERCE_STOCK_UNAVAILABLE },
});

export const homePage = defineRoute({
  id: 'catalog.home.get',
  method: 'GET',
  path: '/api/v1/catalog/home',
  summary: 'The home page of the shop',
  apps: ['customer'],
  permission: 'public',
  rateLimit: 'read',
  cache: { maxAgeSeconds: 60 },
  response: strictObject(
    { banners: array(string('A banner must be text.'), 'banners must be a list.') },
    'The home page has banners only.',
  ),
});

export const closeOrder = defineRoute({
  id: 'commerce.order.close',
  method: 'POST',
  path: '/api/v1/commerce/orders/:orderId/close',
  summary: 'Close an order',
  apps: ['customer'],
  permission: orderPlace,
  rateLimit: 'write',
  params: { orderId: string('orderId is required.') },
  response: nothing('The answer has no body.'),
  status: 204,
});

export const switchHub = defineRoute({
  id: 'logistics.hub.switch',
  method: 'POST',
  path: '/api/v1/logistics/hubs/:hubId/switch',
  summary: 'Switch a hub',
  apps: ['logistics-ops'],
  permission: hubSwitch,
  rateLimit: 'write',
  params: { hubId: string('hubId is required.') },
  response: nothing('The answer has no body.'),
  status: 204,
});

export const signUp = defineRoute({
  id: 'commerce.order.sign_up',
  method: 'POST',
  path: '/api/v1/commerce/sign-up',
  summary: 'A public route that asks for a key',
  apps: ['customer'],
  permission: 'public',
  rateLimit: 'sign-in',
  idempotency: 'required',
  body: { email: string('email is required.') },
  response: nothing('The answer has no body.'),
  status: 204,
});

/** The time of the tests: UTC milliseconds, to put in grants and in step-up. */
export const NOW = new Date('2026-11-26T10:00:00.000Z');
export const HOUR = 60 * 60 * 1000;

export function grant(
  permission: PermissionDefinition | string,
  scope: Grant['scope'] = { type: 'self' },
  extra: Partial<Grant> = {},
): Grant {
  return {
    permission: typeof permission === 'string' ? permission : permission.name,
    scope,
    ...extra,
  };
}

export function actorOf(grants: Grant[] = [], extra: Partial<Actor> = {}): Actor {
  return { accountId: 'acc-1', app: 'customer', authenticator: false, grants, ...extra };
}
