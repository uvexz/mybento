CREATE TABLE "card_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" uuid NOT NULL,
	"clicked_at" timestamp DEFAULT now(),
	"user_agent" text,
	"referer" text
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "clicks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "background_image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_color" text;--> statement-breakpoint
ALTER TABLE "card_clicks" ADD CONSTRAINT "card_clicks_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;