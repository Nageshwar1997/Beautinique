import * as z from 'zod';

import { errorBody } from './http';
import { HEADERS } from './platform';
import type { RouteDefinition } from './routes';

type JsonSchema = Record<string, unknown>;

/** JSON Schema (draft 2020-12, as OpenAPI 3.1 uses) of a zod schema, without the $schema line. */
function jsonSchema(schema: z.ZodType, io: 'input' | 'output'): JsonSchema {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema, { io, unrepresentable: 'throw' });
  return rest;
}

function parameters(schema: z.ZodObject | undefined, location: 'path' | 'query') {
  if (!schema) return [];
  const object = jsonSchema(schema, 'input');
  const properties = (object.properties ?? {}) as Record<string, JsonSchema>;
  const required = new Set((object.required ?? []) as string[]);
  return Object.entries(properties).map(([name, property]) => ({
    name,
    in: location,
    required: location === 'path' || required.has(name),
    schema: property,
  }));
}

/**
 * An OpenAPI 3.1 document for the routes: path, query and header parameters, request body, the
 * `{ data }` success body and the shared error body. Beautinique details (apps, access, rate limit,
 * idempotency, step-up, owner) go in `x-bq`.
 */
export function toOpenApi(
  routes: readonly RouteDefinition[],
  info: { title: string; version: string; description?: string },
) {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const route of routes) {
    const path = route.path.replace(/:([a-zA-Z0-9]+)/g, '{$1}');
    const headerParameters = [
      {
        name: HEADERS.app,
        in: 'header',
        required: true,
        schema: { type: 'string', enum: [...route.apps] },
      },
      ...(route.idempotency
        ? [
            {
              name: HEADERS.idempotencyKey,
              in: 'header',
              required: true,
              schema: { type: 'string', minLength: 1, maxLength: 255 },
            },
          ]
        : []),
    ];
    paths[path] ??= {};
    paths[path][route.method.toLowerCase()] = {
      operationId: route.id,
      summary: route.summary,
      tags: [route.id.split('.')[0]],
      parameters: [
        ...parameters(route.input.params, 'path'),
        ...parameters(route.input.query, 'query'),
        ...headerParameters,
      ],
      ...(route.input.body
        ? {
            requestBody: {
              required: true,
              content: { 'application/json': { schema: jsonSchema(route.input.body, 'input') } },
            },
          }
        : {}),
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { data: jsonSchema(route.output, 'output') },
                required: ['data'],
              },
            },
          },
        },
        default: { $ref: '#/components/responses/Error' },
      },
      security: route.access.type === 'public' ? [] : [{ bearerAuth: [] }],
      'x-bq': {
        apps: [...route.apps],
        access: { ...route.access },
        rateLimit: route.rateLimit,
        idempotency: route.idempotency,
        stepUp: route.stepUp,
        owner: route.owner,
      },
    };
  }
  return {
    openapi: '3.1.0',
    info,
    paths,
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: { Error: jsonSchema(errorBody, 'output') },
      responses: {
        Error: {
          description: 'Error (see error.code)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
  };
}
