// server/routes/upload.ts
import type { Express } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { User } from "@shared/schema";
import { authenticate } from "./admin-routes";

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function registerUploadRoutes(app: Express) {
  app.post("/api/upload-url", authenticate, async (req: any, res) => {
    try {
      const { fileName, fileType, fileSize } = req.body;
      if (!fileName || !fileType || !fileSize) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const fileId = randomUUID();
      const key = `uploads/${fileId}-${fileName}`;

      // Pre-signed URL
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        ContentType: fileType,
        //   ContentLength: fileSize,
      });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 1000 }); // 60s expiry

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      res.json({ uploadUrl, key, fileUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
}
