# Deploying to Railway

Concrete, click-by-click steps for deploying this app on Railway with
your existing local data. This slots into **Phase 2** of the overall
plan in `DEPLOYMENT.md` — read that first for the full local-testing →
staging → DNS-cutover → retirement picture; this file just fills in
the Railway-specific details.

## 0. Before you start

- Finish Phase 0/1 in `DEPLOYMENT.md`: the app runs correctly locally,
  and you have a fresh backup:

  ```bash
  npm run db:backup                              # -> ./backups/webquan-<timestamp>.backup
  tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
  ```

- Install the Railway CLI (used below to run one-off commands like
  `db:push` against the hosted database without pasting connection
  strings around):

  ```bash
  npm i -g @railway/cli
  railway login
  ```

## 1. Create the project and deploy the app

1. [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo** → select this repository and branch.
2. Railway auto-detects Node.js via Nixpacks. It reads `package.json`,
   runs `npm run build` during the build step, and `npm start` to run
   the service — both already configured correctly in this repo, so
   no Dockerfile or `railway.json` is needed.
3. In the new service's **Settings → Networking**, click **Generate
   Domain** to get a `*.up.railway.app` URL you can test against
   before wiring up the real domain.
4. In your local clone: `railway link` and select this project, so
   the CLI commands below know which project to target.

## 2. Add PostgreSQL

1. On the project canvas: **+ New → Database → Add PostgreSQL**.
2. This provisions a Postgres service exposing (on its own Variables
   tab) `DATABASE_URL` (private `postgres.railway.internal` hostname —
   free, no egress charges) and `DATABASE_PUBLIC_URL` (via the TCP
   proxy, for connecting from your laptop — this does count as network
   egress, so use it for one-off admin tasks, not routinely).

## 3. Configure your app service's environment variables

On your **web service** (not the Postgres one) → **Variables** tab:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Click **Add Reference Variable** → select `DATABASE_URL` from the Postgres service | Renders as `${{Postgres.DATABASE_URL}}`; stays in sync if Railway ever rotates credentials |
| `SESSION_SECRET` | Output of `openssl rand -base64 32` | |
| `NODE_ENV` | `production` | |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | only if you plan to run `scripts/init-admin.ts` | not needed if you're restoring an existing `users` row from your backup |

Do **not** set `PORT` — Railway injects its own `PORT` value into the
container at runtime, and this app already reads `process.env.PORT`.

**A note on SSL and Railway's Postgres:** you may see advice elsewhere
that Railway's default Postgres image (SSL disabled) breaks apps that
force SSL in production, requiring `PGSSL=false` or a special
SSL-enabled Postgres image. That specific failure mode is real for
some drivers/ORMs (e.g. ones using `sslmode=require` in the connection
string, which hard-fails if the server declines SSL), but **this app
uses `node-postgres`'s `ssl: {...}` object form**, which behaves like
`sslmode=prefer` — it attempts SSL and transparently falls back to a
plain connection if the server doesn't support it, rather than
erroring. Verified directly against a non-SSL local Postgres with
`NODE_ENV=production` set and no override: it connects fine. So you
generally don't need to set `PGSSL` at all on Railway. If you ever do
hit a connection error here, set `PGSSL=false` to skip the SSL
negotiation attempt entirely as a troubleshooting step.

Save the variables — Railway redeploys the service automatically.

## 4. Move your existing data in

```bash
# Applies shared/schema.ts to the Railway database (runs locally,
# with the Railway service's env vars injected via the CLI):
railway run npm run db:push

# Restore your local backup. Get DATABASE_PUBLIC_URL from the
# Postgres service's Variables tab (enable "TCP Proxy" under that
# service's Settings -> Networking first, if it isn't already):
npm run db:restore -- ./backups/webquan-<timestamp>.backup "<DATABASE_PUBLIC_URL>"
```

Verify it worked by hitting `https://<your-railway-domain>/api/research` (or `/api/personal-info`) once the service has redeployed — you should see your real restored content, not empty arrays.

## 5. Handle the uploads folder — pick one

**Option A — Cloudflare R2 (recommended):** avoids needing a Railway
volume at all, and is already built into this app.

1. Create a free R2 bucket (10 GB free, no egress fees) in the
   Cloudflare dashboard.
2. Add the `S3_*` variables to your Railway web service (see
   `.env.example` for the full list: `S3_BUCKET`, `S3_REGION`,
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`,
   `S3_PUBLIC_URL_BASE`).
3. Migrate your existing local files and rewrite the matching database
   URLs, run against the Railway database via the CLI:

   ```bash
   railway run npm run migrate:uploads             # dry run first
   railway run npm run migrate:uploads -- --apply  # then actually do it
   ```

**Option B — Railway volume:** if you'd rather keep everything inside
Railway and skip creating an R2 account:

1. Web service → **Settings → Volumes → New Volume**.
2. Mount path: `/app/uploads` — Railway builds your app into `/app`,
   and this code writes to the relative path `./uploads`, so the
   volume has to be mounted at `/app/uploads` for the paths to line
   up. Volumes attach when the container *starts*, not at build time,
   so no code changes are needed.
3. Copy your archived `uploads-backup-*.tar.gz` onto the volume — the
   most reliable way is `railway ssh` into the running service and
   extract it there, since Railway doesn't have a general-purpose file
   upload UI for volumes.

## 6. Point your domain at Railway

1. Web service → **Settings → Networking → Custom Domain** → enter
   `zhiyuquan.net` (and/or `www.zhiyuquan.net`).
2. Railway shows you the exact DNS record to add (a CNAME target like
   `xxxx.up.railway.app` for subdomains; apex/root domain support
   depends on your DNS provider — Railway's dashboard will tell you
   which record type to use for your specific case).
3. Add that record at your domain registrar/DNS provider. Railway
   auto-provisions a TLS certificate once DNS resolves, which can take
   anywhere from a few minutes to a few hours.
4. **Don't touch your live `zhiyuquan.net` DNS until you've fully
   verified the app on its `*.up.railway.app` URL first** — see Phase
   3 in `DEPLOYMENT.md` for the full cutover and rollback plan.

## 7. Verify

Run through the same smoke test as Phase 0 in `DEPLOYMENT.md` — every
public page, login, and at least one editor save — against the
Railway URL before cutting DNS over.

## Cost expectations

Railway has no ongoing free tier (only a one-time trial credit for new
accounts). For a personal, low-traffic site this typically lands
around $5-15/month total (web service + Postgres, both billed on the
same usage meter), depending on how much RAM/CPU you assign and
whether you're paying for a volume as well. Set a spend cap under
**Project Settings → Usage Limits** so you're not surprised by a
usage spike.
