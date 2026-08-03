import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || "auto";
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL_BASE;

/**
 * Handles uploaded file storage.
 *
 * Defaults to writing files to the local `uploads/` folder (served via
 * `/uploads/*` static middleware in server/index.ts), which works fine
 * as long as the deployment target has a persistent disk mounted at the
 * app's working directory.
 *
 * If S3_BUCKET is set, uploads instead go to S3 (or any S3-compatible
 * service such as Cloudflare R2, Backblaze B2, or MinIO), which is
 * recommended for hosts with ephemeral/non-persistent disks. See
 * scripts/migrate-uploads-to-s3.ts to migrate files that were already
 * saved locally.
 */
export class ObjectStorageService {
  private uploadDir: string;
  private s3Client?: S3Client;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");

    if (S3_BUCKET) {
      this.s3Client = new S3Client({
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
    }
  }

  get usingObjectStorage(): boolean {
    return !!this.s3Client;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const key = `${folder}/${filename}`;

    if (this.s3Client && S3_BUCKET) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return publicUrlForKey(key);
    }

    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, filename);

    await mkdir(folderPath, { recursive: true });
    await writeFile(filePath, file.buffer);

    return `/uploads/${folder}/${filename}`;
  }
}

export function publicUrlForKey(key: string): string {
  if (S3_PUBLIC_URL_BASE) {
    return `${S3_PUBLIC_URL_BASE.replace(/\/$/, "")}/${key}`;
  }
  if (S3_ENDPOINT) {
    return `${S3_ENDPOINT.replace(/\/$/, "")}/${S3_BUCKET}/${key}`;
  }
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}
