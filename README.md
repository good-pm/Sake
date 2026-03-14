# Sake

Sake is a small personal reading stack built around a Svelte web app and a KOReader plugin.

The idea is simple: keep your library in one place, sync reading progress between devices, and make the KOReader workflow less annoying.

## What is in this repo?

- `sake/` - the main web app and API (`Svelte 5` + `SvelteKit`)
- `koreaderPlugins/` - the KOReader plugins used by Sake

## Features

- Personal reading hub for managing books, metadata, shelves, ratings, and reading state
- KOReader integration for syncing books, progress, and plugin updates across devices
- Provider-based search with direct download or import into your library
- Local account auth plus device API keys for secure browser and device access
- Self-hostable stack with libSQL and S3-compatible storage
- Built to keep your library, progress, and KOReader workflow in one place

## Usage

### Managed infra example (Turso + R2)

Create `sake/.env`:

```env
LIBSQL_URL=libsql://your-database-name.turso.io
LIBSQL_AUTH_TOKEN=your-turso-auth-token

S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=<your-preferred-buckent-name>
S3_ACCESS_KEY_ID=your-r2-access-key-id
S3_SECRET_ACCESS_KEY=your-r2-secret-access-key
S3_FORCE_PATH_STYLE=false

ACTIVATED_PROVIDERS=openlibrary,gutenberg
VITE_ALLOWED_HOSTS=
```

Then start the app:

```bash
cd sake
bun install
bun run db:migrate
bun run dev
```

If you are not starting through Docker Compose, run `bun run db:migrate` once before the first boot and again after future schema changes.

Open `http://localhost:5173` and create the first local account on first boot.

### Fully self-hosted example

For the included Docker reference stack, create a repo-root `.env`:

```env
LIBSQL_URL=file:/data/sake.db
LIBSQL_AUTH_TOKEN=

S3_ENDPOINT=http://seaweedfs:8333
S3_REGION=us-east-1
S3_BUCKET=sake
S3_ACCESS_KEY_ID=sakeadmin
S3_SECRET_ACCESS_KEY=sakeadminsecret
S3_FORCE_PATH_STYLE=true
```

Then start everything from the repository root:

```bash
docker compose -f docker-compose.selfhost.yaml up --build
```

This brings up Sake with a local file-backed libSQL database and SeaweedFS as the S3-compatible object store.

The Docker stack runs migrations for you as part of startup.

## A few images

### Webapp
<img src="./docs/img/library.png" alt="Library" width="700">
<img src="./docs/img/detail.png" alt="Detail" width="700">
<img src="./docs/img/progress.png" alt="Progress" width="700">
<img src="./docs/img/search.png" alt="Search" width="700">

### KOReader Plugin
<img src="./docs/img/SakeDownload.png" alt="KOReader Menu" width="350">
<img src="./docs/img/SakeMenu.png" alt="KOReader Download" width="350">

## Notes

- Database migrations live in `sake/` and are managed with Drizzle.
- KOReader plugin releases are served by the `sake` app, while plugin artifacts are stored in S3-compatible object storage.
- API route lookup is available in the app at `/api/_routes` and `/api/docs`.
- A self-host reference stack is available at `docker-compose.selfhost.yaml`.

## License

This repository is licensed under `AGPL-3.0-only`.
See `LICENSE` for the full text.
