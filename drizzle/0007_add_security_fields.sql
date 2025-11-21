-- Add security-related fields to users table
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN "verification_token" text;
ALTER TABLE "users" ADD COLUMN "verification_token_expiry" timestamp;
ALTER TABLE "users" ADD COLUMN "login_attempts" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "locked_until" timestamp;
