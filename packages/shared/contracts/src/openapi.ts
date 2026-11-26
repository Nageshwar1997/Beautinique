import { toJSONSchema, type ZodType } from 'zod';

import { COMMON_ERRORS, errorBodySchema } from './error-codes.ts';
import { buildRouteManifest, compareRoutes } from './manifest.ts';
import type { AnyRoute } from './route.ts';

export interface OpenApiInfo {
  title: string;
  version: string;
}

type Json = Record<string, unknown>;

/** The OpenAPI 3.1 document: plain JSON, so it can be written as it is. */
export interface OpenApiDocument {
  openapi: '3.1.0';
  info: OpenApiInfo;
  paths: Record<string, Record<string, Json>>;
  components: { schemas: Record<string, Json>; securitySchemes: Record<string, Json> };
}

function jsonSchemaOf(schema: ZodType, io: 'input' | 'output'): Json {
  // The document names its dialect once, so the `$schema` of each piece is left out.
  const entries = Object.entries(toJSONSchema(schema, { io })).filter(([key]) => key !== '$schema');
  return Object.fromEntries(entries);
}

// The fields of a strict object as OpenAPI parameters: one for each field, `required` unless the
// field may be missing.
function parametersOf(schema: ZodType | undefined, place: 'path' | 'query'): Json[] {
  if (schema === undefined) return [];
  const { properties = {}, required = [] } = jsonSchemaOf(schema, 'input') as {
    properties?: Record<string, Json>;
    required?: string[];
  };
  return Object.entries(properties).map(([name, fieldSchema]) => ({
    name,
    in: place,
    required: place === 'path' || required.includes(name),
    schema: fieldSchema,
  }));
}

// Which error codes a route can answer with, by status: the common ones that its shape implies,
// and the ones it names.
function errorCodesByStatus(route: AnyRoute): Map<number, string[]> {
  const codes: string[] = [
    'APP_VERSION_TOO_OLD',
    'RATE_LIMITED',
    'INTERNAL',
    'SERVICE_UNAVAILABLE',
  ];
  if (route.params !== undefined || route.query !== undefined || route.body !== undefined) {
    codes.push('VALIDATION_FAILED');
  }
  if (route.body !== undefined) codes.push('PAYLOAD_TOO_LARGE');
  if (route.permission !== 'public') codes.push('UNAUTHENTICATED', 'FORBIDDEN');
  if (route.stepUp) codes.push('STEP_UP_REQUIRED');
  if (route.params !== undefined) codes.push('NOT_FOUND');
  if (route.idempotency === 'required') {
    codes.push('IDEMPOTENCY_IN_PROGRESS', 'IDEMPOTENCY_KEY_REUSED');
  }

  const byStatus = new Map<number, string[]>();
  const add = (code: string, status: number) => {
    byStatus.set(status, [...(byStatus.get(status) ?? []), code]);
  };
  for (const code of codes) add(code, COMMON_ERRORS[code as keyof typeof COMMON_ERRORS]);
  for (const [code, status] of Object.entries(route.errors)) add(code, status);
  return byStatus;
}

function operationOf(route: AnyRoute): Json {
  const parameters = [...parametersOf(route.params, 'path'), ...parametersOf(route.query, 'query')];
  if (route.idempotency === 'required') {
    parameters.push({
      name: 'Idempotency-Key',
      in: 'header',
      required: true,
      schema: { type: 'string' },
    });
  }

  const responses: Record<string, Json> = {
    [String(route.status)]:
      route.status === 204
        ? { description: 'Success, no content' }
        : {
            description: 'Success',
            content: { 'application/json': { schema: jsonSchemaOf(route.response, 'output') } },
          },
  };
  for (const [status, codes] of [...errorCodesByStatus(route)].sort(([a], [b]) => a - b)) {
    responses[String(status)] = {
      description: codes.join(', '),
      ...(status === 429 || status === 503
        ? { headers: { 'Retry-After': { schema: { type: 'integer' } } } }
        : {}),
      content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
    };
  }

  return {
    operationId: route.id,
    summary: route.summary,
    tags: [route.service],
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(route.body === undefined
      ? {}
      : {
          requestBody: {
            required: true,
            content: { 'application/json': { schema: jsonSchemaOf(route.body, 'input') } },
          },
        }),
    responses,
    security: route.permission === 'public' ? [] : [{ session: [] }],
    'x-apps': route.apps,
    'x-permission': route.permission === 'public' ? null : route.permission.name,
    'x-step-up': route.stepUp,
    'x-rate-limit': route.rateLimit,
    'x-idempotency': route.idempotency,
    ...(route.cache === undefined ? {} : { 'x-cache-max-age-seconds': route.cache.maxAgeSeconds }),
  };
}

/**
 * The OpenAPI document of the routes (docs/ARCHITECTURE.md §5 rule 1, AC-PLATFORM-15): the real
 * spec of the API, made from the contracts and never written by hand. The request is described by
 * the input of the schemas and the answer by their output. Paths and methods are in a fixed order, so
 * the same routes always give the same file.
 */
export function buildOpenApi(routes: readonly AnyRoute[], info: OpenApiInfo): OpenApiDocument {
  buildRouteManifest(routes); // refuses two routes at one place
  const paths: Record<string, Record<string, Json>> = {};
  for (const route of [...routes].sort(compareRoutes)) {
    const path = route.path.replaceAll(/:([A-Za-z][A-Za-z0-9]*)/g, '{$1}');
    paths[path] = { ...paths[path], [route.method.toLowerCase()]: operationOf(route) };
  }
  return {
    openapi: '3.1.0',
    info,
    paths,
    components: {
      schemas: { Error: jsonSchemaOf(errorBodySchema, 'output') },
      securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: 'session' } },
    },
  };
}

/** The document as the text of `openapi.json`: two spaces, and a line break at the end. */
export function openApiJson(document: OpenApiDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}
