import { array, boolean, number, strictObject, string, undefined as nothing } from 'zod';

import { defineErrors } from '../../src/error-codes.ts';
import { definePermission } from '../../src/permission.ts';
import { defineRoute } from '../../src/route.ts';

// A few routes shaped like the real ones will be, to test the contracts against.

export const orderPlace = definePermission({
  name: 'commerce.order.place',
  scope: 'self',
  authenticator: false,
  stepUp: false,
  subRoleAllowed: true,
});

export const orderRead = definePermission({
  name: 'commerce.order.read',
  scope: 'self',
  authenticator: false,
  stepUp: false,
  subRoleAllowed: true,
});

export const payoutApprove = definePermission({
  name: 'finance.payout_batch.approve',
  scope: 'global',
  authenticator: true,
  stepUp: true,
  subRoleAllowed: false,
});

export const commerceErrors = defineErrors('commerce', { STOCK_UNAVAILABLE: 409 });

const orderSummary = strictObject(
  {
    orderId: string('orderId is required.'),
    status: string('status is required.'),
  },
  'An order has orderId and status only.',
);

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
    items: array(
      strictObject(
        {
          variantId: string('variantId is required.'),
          quantity: number('quantity must be a number.')
            .int('quantity must be a whole number.')
            .min(1, 'quantity must be at least 1.'),
        },
        'An item has variantId and quantity only.',
      ),
      'items must be a list.',
    ).min(1, 'items must have at least 1 item.'),
  },
  response: orderSummary,
  status: 201,
  errors: { COMMERCE_STOCK_UNAVAILABLE: commerceErrors.COMMERCE_STOCK_UNAVAILABLE },
});

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
});

export const myOrders = defineRoute({
  id: 'commerce.order.mine',
  method: 'GET',
  path: '/api/v1/commerce/orders/mine',
  summary: 'The orders of the person',
  apps: ['customer'],
  permission: orderRead,
  rateLimit: 'read',
  query: {
    cursor: string('cursor must be text.').optional(),
    limit: number('limit must be a number.')
      .int('limit must be a whole number.')
      .min(1, 'limit must be at least 1.')
      .max(100, 'limit must be at most 100.')
      .optional(),
  },
  response: strictObject(
    {
      items: array(orderSummary, 'items must be a list.'),
      nextCursor: string('nextCursor must be text.').optional(),
    },
    'The orders have items and nextCursor only.',
  ),
});

export const catalogHome = defineRoute({
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

export const approvePayoutBatch = defineRoute({
  id: 'finance.payout_batch.approve',
  method: 'POST',
  path: '/api/v1/finance/payout-batches/:batchId/approve',
  summary: 'Approve a payout batch',
  apps: ['finance'],
  permission: payoutApprove,
  rateLimit: 'write',
  idempotency: 'required',
  params: { batchId: string('batchId is required.') },
  body: { confirm: boolean('confirm must be true or false.') },
  response: nothing('The answer has no body.'),
  status: 204,
});

export const allSampleRoutes = [
  placeOrder,
  getOrder,
  myOrders,
  catalogHome,
  approvePayoutBatch,
] as const;
