import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { publicUrlForKey } from "../server/objectStorage";
import {
  personalInfo,
  carouselImages,
  pastTalks,
  research,
  students,
  events,
} from "../shared/schema";

/**
 * One-time migration: uploads every file currently in the local
 * `uploads/` folder to S3 (or an S3-compatible service), then rewrites
 * any `/uploads/...` URLs stored in the database to point at the new
 * object storage location.
 *
 * Usage:
 *   tsx scripts/migrate-uploads-to-s3.ts            # dry run (default)
 *   tsx scripts/migrate-uploads-to-s3.ts --apply     # actually upload + update DB
 *
 * Requires S3_BUCKET (and related S3_* vars) to be set in the
 * environment — see .env.example.
 */

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const DRY_RUN = !process.argv.includes("--apply");

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || "auto";
const S3_ENDPOINT = process.env.S3_ENDPOINT;

if (!S3_BUCKET) {
  console.error(
    "S3_BUCKET must be set to run this migration. See .env.example for the S3_* variables.",
  );
  process.exit(1);
}

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: !!S3_ENDPOINT,
  credentials:
    process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }
      : undefined,
});

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function uploadAll(): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>(); // old "/uploads/xxx" -> new public URL

  let files: string[] = [];
  try {
    files = await walk(UPLOAD_DIR);
  } catch {
    console.log(`No local uploads/ directory found at ${UPLOAD_DIR}; nothing to migrate.`);
    return urlMap;
  }

  console.log(`Found ${files.length} local file(s) under uploads/.\n`);

  for (const filePath of files) {
    const relPath = path.relative(UPLOAD_DIR, filePath).split(path.sep).join("/");
    const oldUrl = `/uploads/${relPath}`;
    const newUrl = publicUrlForKey(relPath);

    if (DRY_RUN) {
      console.log(`[dry-run] would upload ${oldUrl} -> ${newUrl}`);
    } else {
      const body = await fs.readFile(filePath);
      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: relPath,
          Body: body,
        }),
      );
      console.log(`uploaded  ${oldUrl} -> ${newUrl}`);
    }

    urlMap.set(oldUrl, newUrl);
  }

  return urlMap;
}

// Tables/columns that may contain a "/uploads/..." URL produced by
// ObjectStorageService. Add new entries here if the schema grows more
// upload-backed fields.
const URL_COLUMN_TARGETS = [
  { table: personalInfo, idCol: personalInfo.id, columns: ["photoUrl"] as const, label: "personal_info" },
  { table: carouselImages, idCol: carouselImages.id, columns: ["imageUrl", "pdfUrl"] as const, label: "carousel_images" },
  { table: pastTalks, idCol: pastTalks.id, columns: ["pdfUrl"] as const, label: "past_talks" },
  { table: research, idCol: research.id, columns: ["pdfUrl", "thumbnailUrl"] as const, label: "research" },
  { table: students, idCol: students.id, columns: ["photoUrl"] as const, label: "students" },
  { table: events, idCol: events.id, columns: ["imageUrl"] as const, label: "events" },
];

async function rewriteDatabaseUrls(urlMap: Map<string, string>) {
  console.log("\nScanning database rows for /uploads/ references...\n");

  for (const { table, idCol, columns, label } of URL_COLUMN_TARGETS) {
    const rows = await db.select().from(table as any);

    for (const row of rows as any[]) {
      const updates: Record<string, string> = {};

      for (const col of columns) {
        const value = row[col];
        if (typeof value === "string" && urlMap.has(value)) {
          updates[col] = urlMap.get(value)!;
        }
      }

      if (Object.keys(updates).length === 0) continue;

      if (DRY_RUN) {
        console.log(`[dry-run] would update ${label} ${row.id}:`, updates);
      } else {
        await db
          .update(table as any)
          .set(updates as any)
          .where(eq(idCol as any, row.id));
        console.log(`updated   ${label} ${row.id}:`, updates);
      }
    }
  }
}

async function main() {
  console.log(
    `Migrating local uploads to S3 bucket "${S3_BUCKET}"${DRY_RUN ? " (DRY RUN — pass --apply to write changes)" : ""}\n`,
  );

  const urlMap = await uploadAll();

  if (urlMap.size === 0) {
    console.log("Nothing to migrate.");
    process.exit(0);
  }

  await rewriteDatabaseUrls(urlMap);

  console.log(
    DRY_RUN
      ? "\nDry run complete. Re-run with --apply to actually upload files and update the database."
      : "\nMigration complete. Verify the site renders images/PDFs correctly, then it's safe to delete the local uploads/ folder.",
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
