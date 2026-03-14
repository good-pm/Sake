import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { getLibsqlConfig } from '$lib/server/config/infrastructure';

import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle>;

let cachedDb: DrizzleDb | null = null;

export function getDrizzleDb(): DrizzleDb {
	if (!cachedDb) {
		const libsql = getLibsqlConfig();
		const client = createClient({
			url: libsql.url,
			...(libsql.authToken ? { authToken: libsql.authToken } : {})
		});

		cachedDb = drizzle(client, { schema });
	}

	return cachedDb;
}

export const drizzleDb = new Proxy({} as DrizzleDb, {
	get(_target, prop, receiver) {
		const db = getDrizzleDb() as unknown as Record<PropertyKey, unknown>;
		const value = Reflect.get(db, prop, receiver);
		return typeof value === 'function' ? value.bind(db) : value;
	}
});
