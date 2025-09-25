import { randomBytes } from "crypto";
import { db } from "./db";
import { radioSessions } from "@shared/schema";
import { and, gt, lt, ne, sql } from "drizzle-orm";
import AWS from "aws-sdk";
import Stripe from "stripe";

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

export const formatCountry = (
  c: Stripe.CountrySpec,
  detailed: boolean = false // only include detailed fields when true
) => {
  const formatter = new Intl.DisplayNames(["en"], { type: "region" });

  const base = {
    code: c.id,
    name: formatter.of(c.id) || c.id,
    supportedPaymentMethods: c.supported_payment_methods,
    defaultCurrency: c.default_currency,
  };

  if (detailed) {
    return {
      ...base,
      supportedPaymentCurrencies: c.supported_payment_currencies,
      supportedTransferCountries: c.supported_transfer_countries,
    };
  }

  return base;
};

export function getStripeAccountStatus(account: Stripe.Account) {
  let status: "none" | "pending" | "complete" | "rejected" = "pending";
  let rejectReason: string | null = null;

  if (account.requirements?.disabled_reason) {
    status = "rejected";
    rejectReason = account.requirements.disabled_reason;
  } else if (
    account.details_submitted &&
    account.charges_enabled &&
    account.payouts_enabled
  ) {
    status = "complete";
  } else {
    status = "pending";
  }

  return { status, rejectReason };
}
