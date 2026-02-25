-- Remove status column and recreate with enum
-- Note: Existing status values will be lost (all rows become 'pending')

DO $$ BEGIN
  CREATE TYPE "public"."demo_submission_status" AS ENUM(
    'pending',
    'accepted',
    'rejected',
    'awaiting_payment',
    'active'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "demo_submissions" DROP COLUMN IF EXISTS "status";

ALTER TABLE "demo_submissions"
  ADD COLUMN "status" "public"."demo_submission_status" NOT NULL DEFAULT 'pending';
