import { randomBytes } from "crypto";
import { db } from "./db";
import { radioSessions } from "@shared/schema";
import { and, gt, lt, ne, sql } from "drizzle-orm";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// import { log } from "./vite";

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate token expiration date (24 hours from now)
 */
export function getTokenExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  return expirationDate;
}

export async function isTimeSlotAvailable(
  start: Date,
  end: Date,
  excludeSessionId?: string
) {
  const overlappingSessions = await db
    .select()
    .from(radioSessions)
    .where(
      and(
        lt(radioSessions.scheduledStart, end), // existing.start < newEnd
        gt(radioSessions.scheduledEnd, start), // existing.end > newStart
        excludeSessionId ? ne(radioSessions.id, excludeSessionId) : undefined
      )
    );

  return overlappingSessions.length === 0;
}

export function getSignedUrl(key: string) {
  if (!key) return null;
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Expires: 3600, // 1 hour
  });
}
