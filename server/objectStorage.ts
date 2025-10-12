import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectStorageService {
  private bucketName: string;
  
  constructor() {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) {
      throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
    }
    this.bucketName = bucketId;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const objectPath = `public/${folder}/${filename}`;
    
    const bucket = objectStorageClient.bucket(this.bucketName);
    const blob = bucket.file(objectPath);
    
    await blob.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make the file public
    await blob.makePublic();
    
    // Return the public URL
    return blob.publicUrl();
  }
}
