-- Add mastodon_data column to cards table for Mastodon profile information
ALTER TABLE "cards" ADD COLUMN "mastodon_data" text;
