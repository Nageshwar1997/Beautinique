import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { eventCatalogue } from './events';
import { jsonSchema, toOpenApi } from './openapi';
import type { PermissionDefinition } from './permissions';
import type { RouteDefinition } from './routes';
import { gatewayManifest } from './routes';

export interface GeneratedFile {
  /** File name inside the output folder. */
  name: string;
  content: string;
}

export interface CodegenInput {
  routes: readonly RouteDefinition[];
  events: ReturnType<typeof eventCatalogue>;
  permissions: ReadonlyMap<string, PermissionDefinition>;
  info: { title: string; version: string; description?: string };
}

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

/**
 * The generated files, as text and in a fixed order: `openapi.json`, `gateway-manifest.json`
 * (what the gateway reads per route), `events.json` (JSON Schema of every event version) and
 * `permissions.json`. The same input always gives the same bytes.
 */
export function generateFiles({
  routes,
  events,
  permissions,
  info,
}: CodegenInput): GeneratedFile[] {
  return [
    { name: 'openapi.json', content: json(toOpenApi(routes, info)) },
    {
      name: 'gateway-manifest.json',
      content: json({ version: info.version, routes: gatewayManifest(routes) }),
    },
    {
      name: 'events.json',
      content: json({
        version: info.version,
        events: events
          .all()
          .toSorted((a, b) => a.type.localeCompare(b.type) || a.version - b.version)
          .map(({ type, version, producer, description, envelope }) => ({
            type,
            version,
            producer,
            description,
            schema: jsonSchema(envelope, 'output'),
          })),
      }),
    },
    {
      name: 'permissions.json',
      content: json({
        version: info.version,
        permissions: [...permissions.values()].toSorted((a, b) => a.key.localeCompare(b.key)),
      }),
    },
  ];
}

/** Writes the generated files into `directory` (made if missing). Returns the names written. */
export async function writeGenerated(directory: string, input: CodegenInput): Promise<string[]> {
  await mkdir(directory, { recursive: true });
  const files = generateFiles(input);
  for (const file of files) await writeFile(path.join(directory, file.name), file.content);
  return files.map((file) => file.name);
}

/** Names of the files in `directory` that are missing or differ from what the contracts generate now. */
export async function staleGenerated(directory: string, input: CodegenInput): Promise<string[]> {
  const stale: string[] = [];
  for (const file of generateFiles(input)) {
    const current = await readFile(path.join(directory, file.name), 'utf8').catch(() => null);
    if (current !== file.content) stale.push(file.name);
  }
  return stale;
}
