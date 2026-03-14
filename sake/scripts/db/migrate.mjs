import path from 'node:path';
import { createClient } from '@libsql/client';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { resolveLibsqlConfig } from '../../src/lib/server/config/infrastructure.shared.js';

async function main() {
	const libsql = resolveLibsqlConfig(process.env);
	const client = createClient({
		url: libsql.url,
		...(libsql.authToken ? { authToken: libsql.authToken } : {})
	});
	const migrationsFolder = path.resolve(process.cwd(), 'drizzle');
	const migrations = readMigrationFiles({ migrationsFolder });

	await client.execute(`
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			hash text NOT NULL,
			created_at numeric
		)
	`);

	const lastApplied = await client.execute(
		'SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1'
	);
	const lastRow = lastApplied.rows[0];
	const lastCreatedAt = lastRow ? Number(lastRow.created_at) : null;

	for (const migration of migrations) {
		if (lastCreatedAt !== null && lastCreatedAt >= migration.folderMillis) {
			continue;
		}

		for (const statement of migration.sql) {
			const trimmed = statement.trim();
			if (!trimmed) {
				continue;
			}
			await client.execute(trimmed);
		}

		await client.execute({
			sql: 'INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)',
			args: [migration.hash, migration.folderMillis]
		});
	}

	console.log('[ok] migrations applied successfully!');
}

main().catch((error) => {
	console.error(error instanceof Error ? error.stack ?? error.message : String(error));
	process.exit(1);
});
