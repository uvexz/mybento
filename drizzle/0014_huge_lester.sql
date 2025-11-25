CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"avatar_url" text,
	"background_image" text,
	"profile_color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "page_id" uuid;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD COLUMN "max_pages" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pages_userId_idx" ON "pages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pages_userId_slug_idx" ON "pages" USING btree ("user_id","slug");--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;