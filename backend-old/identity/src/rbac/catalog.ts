import type { IndexSpec, Mongo, ObjectId } from '@beautinique/backend-server-mongo';
import type { AppId, PermissionDefinition, SessionPolicy } from '@beautinique/shared-contracts';

export const APP_RECORDS = 'identity_apps';
export const PERMISSIONS = 'identity_permissions';

/**
 * An app as data (ARCHITECTURE §7.1): who uses it and how they sign in. Its `_id` is an ObjectId
 * like every document's (owner, 2026-11-12); code, contracts, cookies and tokens use its `key`.
 */
export interface AppRecord {
  _id: ObjectId;
  key: AppId;
  audience: 'external' | 'internal';
  /** An unknown email can make an account here */
  signUp: boolean;
  /** `required`: every sign-in asks the authenticator; `optional`: the person's choice */
  totp: 'required' | 'optional';
  session: SessionPolicy;
  updatedAt: Date;
}

/** A permission key as data, from the code catalogue. `retired`: no longer in the code. */
export interface PermissionRecord extends PermissionDefinition {
  _id: ObjectId;
  retired: boolean;
  updatedAt: Date;
}

/** Apps and permissions are found by key: one document per key. */
export const catalogIndexes: readonly IndexSpec[] = [
  { collection: APP_RECORDS, name: 'key_unique', key: { key: 1 }, unique: true },
  { collection: PERMISSIONS, name: 'key_unique', key: { key: 1 }, unique: true },
];

/**
 * The ids of identity's apps and permissions. Every reference in identity's database names them by
 * id (roles, grants, sessions ...: owner, 2026-11-12), the code by key; this turns one into the
 * other without a query.
 */
export interface RbacCatalog {
  /** The app's id; throws when the release steps have not written the app yet */
  appId(app: AppId): ObjectId;
  /** The app of an id; throws for an id that is not one of identity's apps */
  appOf(id: ObjectId): AppId;
  permissionId(key: string): ObjectId | undefined;
  permissionKey(id: ObjectId): string | undefined;
}

interface Loaded {
  appIds: Map<string, ObjectId>;
  apps: Map<string, AppId>;
  permissionIds: Map<string, ObjectId>;
  permissionKeys: Map<string, string>;
}

// the rbac sync writes them at every release and never changes an id, so a process reads them once
// per database (and again after its own release step wrote them)
const loaded = new WeakMap<object, Promise<Loaded>>();

async function load(mongo: Mongo): Promise<Loaded> {
  const apps = await mongo.db
    .collection<AppRecord>(APP_RECORDS)
    .find({}, { projection: { key: 1 }, comment: 'full read: the 11 apps, once per process' })
    .toArray();
  const permissionRecords = await mongo.db
    .collection<PermissionRecord>(PERMISSIONS)
    .find(
      {},
      { projection: { key: 1 }, comment: 'full read: the permission catalogue, once per process' },
    )
    .toArray();
  return {
    appIds: new Map(apps.map((app) => [app.key, app._id])),
    apps: new Map(apps.map((app) => [app._id.toHexString(), app.key])),
    permissionIds: new Map(permissionRecords.map((record) => [record.key, record._id])),
    permissionKeys: new Map(
      permissionRecords.map((record) => [record._id.toHexString(), record.key]),
    ),
  };
}

function loadOnce(mongo: Mongo): Promise<Loaded> {
  let pending = loaded.get(mongo.db);
  if (!pending) {
    pending = load(mongo);
    loaded.set(mongo.db, pending);
    // a failed read is not kept: the next call tries again
    pending.catch(() => {
      if (loaded.get(mongo.db) === pending) loaded.delete(mongo.db);
    });
  }
  return pending;
}

/** The catalogue of `mongo`'s database, read once per process. */
export async function rbacCatalog(mongo: Mongo): Promise<RbacCatalog> {
  const ids = await loadOnce(mongo);
  return {
    appId(app) {
      const id = ids.appIds.get(app);
      if (!id) throw new Error(`App ${app} is not in identity's database: run db:release first.`);
      return id;
    },
    appOf(id) {
      const app = ids.apps.get(id.toHexString());
      if (!app) throw new Error(`App id ${id.toHexString()} is not one of identity's apps.`);
      return app;
    },
    permissionId: (key) => ids.permissionIds.get(key),
    permissionKey: (id) => ids.permissionKeys.get(id.toHexString()),
  };
}

/** Forgets what was read for `mongo`'s database: the rbac sync just wrote it. */
export function forgetRbacCatalog(mongo: Mongo): void {
  loaded.delete(mongo.db);
}
