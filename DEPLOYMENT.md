# Deployment Plan: Retiring zhiyuquan.net → WebQuanUpdate

This document covers the full path from local development to fully
retiring the old site at `zhiyuquan.net` and running this codebase
(WebQuanUpdate) as the production site, **including migrating the
content that already exists in your local PostgreSQL database and
local `uploads/` folder.**

Deploy three things together — code, database data, and uploaded
files — they are not automatically bundled by `git push`:

| Artifact | Where it lives locally | Committed to git? |
|---|---|---|
| App code | this repo | Yes |
| Database data | local PostgreSQL (`DATABASE_URL`) | No — `.env` is gitignored, and the DB itself is never in git |
| Uploaded images/PDFs | `uploads/` folder | No — gitignored |

---

## Phase 0 — Local functional testing (do this first, before anything else)

Goal: prove the app works end-to-end against a throwaway local
database before touching any real data or infrastructure.

1. Install dependencies: `npm install`.
2. Provision a local PostgreSQL database and set `DATABASE_URL` in
   `.env` (copy `.env.example` → `.env` and fill in). Generate a real
   `SESSION_SECRET` with `openssl rand -base64 32`.
3. Apply the schema: `npm run db:push`.
4. Load sample data: `npm run seed` (or `npx tsx scripts/init-admin.ts`
   if you just want an admin user against otherwise-empty tables).
5. Run the app: `npm run dev`, then open `http://localhost:5000`.
6. Click through every public page (Home, Research, Teaching,
   Students, individual research/talk detail pages) and the editor
   (`/auth` → log in → each editor sub-page, including saving at least
   one change) to confirm nothing crashes and the API returns 2xx.
7. Run `npm run check` and fix/flag anything new before moving on.

This pass already surfaced and fixed several real bugs (see commits on
this branch): a broken type alias, past-talk lookups by ID being
silently broken, and a full-page crash on the Research listing page.
Repeat this phase any time you pull new changes before deploying.

---

## Phase 1 — Get your existing local data ready to move

You already have real content in a local Postgres database and in a
local `uploads/` folder. Before deploying anywhere, package that data
up so it can be restored elsewhere.

### 1a. Back up the database

```bash
# from the project root, with DATABASE_URL pointing at your local DB
npm run db:backup
# -> writes ./backups/webquan-<timestamp>.backup
```

This wraps `pg_dump -Fc` (custom/compressed format, restorable with
`pg_restore` into any Postgres version >= the one it was dumped from).
Keep this file somewhere safe outside of git (`backups/` is
gitignored) — it's your source of truth for the migration.

### 1b. Archive the uploads folder

```bash
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

Keep this alongside the database backup. You'll need it in Phase 3
regardless of whether you end up keeping local-disk storage or moving
to object storage.

### 1c. Sanity-check the backup before you need it

Restore the dump into a *throwaway* local database and confirm the
app runs correctly against the restored copy:

```bash
createdb webquan_restore_check
npm run db:restore -- ./backups/webquan-<timestamp>.backup postgresql://localhost:5432/webquan_restore_check
DATABASE_URL=postgresql://localhost:5432/webquan_restore_check npm run dev
```

If this works, your backup is good and the same restore procedure
will work against a hosted database in Phase 2.

---

## Phase 2 — Deploy to a temporary/staging environment

### Recommended stack for this project

**Render (web service) + Neon (Postgres) + Cloudflare R2 (uploads).**
This is $0/month to start (upgrade the Render web service to ~$7/month
later if you want to remove cold starts — see below), has no
credit-card-required signup on the free tiers, and lines up with the
SSL auto-config and S3-compatible storage already built into this
codebase.

- **Render, free web service**: deploys straight from this GitHub repo
  (`npm run build` / `npm start`, already configured), free HTTPS on a
  custom domain. The only real downside: free services spin down after
  15 minutes idle and take about a minute to cold-start on the next
  request. For a low-traffic personal site this is usually acceptable;
  if it bothers you, Render's Starter plan ($7/month) removes it.
- **Neon, free Postgres**: unlike Render's own free Postgres (which
  **auto-deletes your database 30 days after creation** — a real trap
  for something you intend to keep long-term), Neon's free tier is
  permanent, with no expiration or deletion risk. 0.5 GB storage and
  100 compute-hours/month is generous for a low-traffic personal
  site's text/metadata (images/PDFs live in R2, not the database).
  Point Render's `DATABASE_URL` at the Neon connection string; nothing
  else changes since it's still standard Postgres.
- **Cloudflare R2, free tier**: 10 GB storage, no egress fees, ever.
  This is exactly what `S3_BUCKET`/`S3_ENDPOINT` in `.env.example` are
  for — R2 speaks the S3 API, so the object-storage support already in
  `server/objectStorage.ts` works against it with zero code changes.
  This avoids the ephemeral-disk problem entirely rather than working
  around it with a persistent volume.

If you'd rather manage everything in one dashboard instead of three
accounts, **Railway** is a solid single-vendor alternative: web
service + Postgres + a persistent volume (for `uploads/`, mounted at
the app's working directory) all live under one project, at roughly
$5-15/month for a hobby-scale app. It doesn't have an ongoing free
tier (only a one-time trial credit for new accounts), so budget for
that if you go this route. **See `RAILWAY.md` for exact click-by-click
steps if you go with Railway**, including a Railway-specific SSL
gotcha with its default Postgres image. Fly.io is a better fit if you
specifically need global multi-region low latency, which a personal
academic site almost never does — it also currently has no free tier
and its cheapest managed Postgres option is comparatively expensive,
with the cheap self-managed option putting backups/maintenance on
you.

### Steps

1. **Push the code** to GitHub (already done for this repo) and
   connect the host to the `main` branch (or a dedicated `staging`
   branch — recommended so you can iterate without touching the
   branch that will eventually back production).
2. **Provision a managed Postgres database** on the host. It gives you
   a production-style `DATABASE_URL` (usually requires SSL — see the
   note below, already handled in code).
3. **Restore your data into it**:

   ```bash
   npm run db:restore -- ./backups/webquan-<timestamp>.backup "<hosted-database-url>"
   ```

   (`pg_restore --no-owner --no-acl --clean --if-exists`, wrapped for
   you — `--no-owner`/`--no-acl` matter because the roles and
   grant/revoke rules on your local machine won't exist on the hosted
   DB.)

4. **Set environment variables** on the host:

   ```
   DATABASE_URL=<hosted-database-url>
   SESSION_SECRET=<a long random value, e.g. openssl rand -base64 32>
   NODE_ENV=production
   ADMIN_USERNAME=admin        # only needed if you also run init-admin.ts
   ADMIN_PASSWORD=<set a real password, don't keep the seed default>
   ```

   Note on SSL: `server/db.ts` now automatically enables
   `ssl: { rejectUnauthorized: false }` when `NODE_ENV=production`
   (override with `PGSSL=true|false` if a given host needs the
   opposite). This is required by most managed Postgres providers and
   was previously missing — the app would have failed to connect to a
   hosted database without this fix.

5. **Handle the uploads folder** — pick one:

   - **Quick path (works with zero code changes):** mount a
     *persistent* disk/volume at the app's working directory so the
     runtime path is `<app working directory>/uploads`, then copy your
     archived `uploads/` folder onto it. Render, Fly.io, and Railway
     all support persistent volumes on paid plans — but note Render's
     **free** web services specifically do not support persistent
     disks (only paid ones do), so this path requires a paid plan on
     any of these three.
   - **Durable path (recommended for anything you'll keep long-term):**
     move uploads to S3 or an S3-compatible service. This is now
     built into the app (see below) — set the `S3_*` environment
     variables and run the migration script once.

6. **Build and start**:

   ```bash
   npm run build
   npm start
   ```

   (These are exactly the commands most hosts will run automatically
   from `package.json`; you generally won't run them by hand except to
   sanity-check a production build locally first with `NODE_ENV=production npm start`.)

7. **Smoke-test the staging URL** the same way you did in Phase 0: every
   public page, login, and at least one editor save.

### Durable uploads via S3-compatible storage (built-in, opt-in)

`server/objectStorage.ts` now supports S3 (AWS S3, Cloudflare R2,
Backblaze B2, MinIO, etc.) as a drop-in alternative to local disk:

1. Create a bucket on your provider of choice and, if it doesn't
   already default to it, configure public read access (or put a CDN
   in front of it) for the folders this app writes to
   (`images/`, `pdfs/`, `research/pdfs/`, `research/images/`).
2. Set these on your host (see `.env.example` for full details):

   ```
   S3_BUCKET=your-bucket-name
   S3_REGION=auto            # or e.g. us-east-1 for AWS
   S3_ACCESS_KEY_ID=...
   S3_SECRET_ACCESS_KEY=...
   S3_ENDPOINT=...           # only for non-AWS providers (R2, MinIO, etc.)
   S3_PUBLIC_URL_BASE=...    # e.g. https://pub-xxxx.r2.dev, if applicable
   ```

3. Once `S3_BUCKET` is set, **all new uploads** automatically go to
   object storage — no further code changes needed.
4. Migrate the files you already have locally, and rewrite the
   matching database URLs in one step:

   ```bash
   # Dry run first — prints what would happen, changes nothing:
   npm run migrate:uploads

   # Then actually upload + update the DB:
   npm run migrate:uploads -- --apply
   ```

   This walks your local `uploads/` folder, uploads each file to the
   bucket under the same relative path, and updates every
   `photoUrl`/`imageUrl`/`pdfUrl`/`thumbnailUrl` column that referenced
   the old `/uploads/...` path to point at the new object storage URL.
   Verify the site renders correctly afterward, then it's safe to
   delete the local `uploads/` folder.

---

## Phase 3 — Cut over the domain from zhiyuquan.net

Once staging has been verified with the real (migrated) data:

1. **Promote staging to production** on your chosen host (or spin up a
   separate production service from the same steps in Phase 2, using
   the same database — don't run two live databases with diverging
   data).
2. **Point your own domain at the new host** before touching DNS for
   `zhiyuquan.net`:
   - Add a custom domain (e.g. `www.zhiyuquan.net` and/or
     `zhiyuquan.net`) in the new host's dashboard; it will give you a
     CNAME/A record target and usually provision TLS automatically
     once DNS resolves.
   - Lower the DNS TTL on the existing `zhiyuquan.net` records (e.g. to
     300s) at least 24–48 hours ahead of the cutover so the eventual
     change propagates quickly.
3. **Cut over DNS**: update the `A`/`CNAME` records for `zhiyuquan.net`
   (and `www`) at your registrar/DNS provider to point at the new
   host. Keep the old host running in parallel for a rollback window.
4. **Verify** the live domain: confirm HTTPS/TLS is valid, all pages
   load, login works, and check server logs for errors under real
   traffic.
5. **Rollback plan**: if something is wrong, revert the DNS change
   back to the old host — this is why you keep the old site running
   during the cutover window rather than deleting it immediately.
6. **Monitor** for a few days (DNS caches can linger on some
   resolvers/ISPs even with a low TTL).

---

## Phase 4 — Retire the old site

Only after DNS has fully propagated and the new site has been stable
for a reasonable monitoring period:

1. Take a final backup/export of anything on the old
   `zhiyuquan.net` host that hasn't already been migrated (double
   check there's no content there that never made it into this app's
   database, e.g. old static pages or files).
2. Cancel/decommission the old hosting plan or server.
3. Set up a redirect at the DNS/registrar level if the old host is
   ever reachable by IP directly, or leave DNS pointed at the new host
   indefinitely (this is the normal end state — "retiring" the old
   site mostly means turning off the old hosting/server behind it,
   since the domain itself now simply points to the new deployment).
4. Restore normal DNS TTLs once things have been stable.

---

## Quick reference: scripts added for this migration

| Command | Purpose |
|---|---|
| `npm run db:backup` | `pg_dump` your current `DATABASE_URL` to a timestamped file in `./backups/` |
| `npm run db:restore -- <file> <target-url>` | `pg_restore` a backup into a target database (prompts for confirmation; drops/recreates existing objects) |
| `npm run migrate:uploads` | Dry-run preview of migrating local `uploads/` to S3-compatible storage |
| `npm run migrate:uploads -- --apply` | Actually upload files and rewrite DB URLs |
| `npm run db:push` | Apply `shared/schema.ts` to whatever `DATABASE_URL` currently points at |
| `npm run seed` | Load placeholder sample content (only for a fresh/empty database, e.g. local testing) |
