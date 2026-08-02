import { Response } from "express";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export class ObjectStorageService {
  private uploadDir: string;
  
  constructor() {
    // Store uploads in a local 'uploads' folder
    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, filename);
    
    // Create directory if it doesn't exist
    await mkdir(folderPath, { recursive: true });
    
    // Save file to local filesystem
    await writeFile(filePath, file.buffer);
    
    // Return relative URL path
    return `/uploads/${folder}/${filename}`;
  }
}