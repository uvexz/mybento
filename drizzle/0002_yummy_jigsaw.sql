CREATE TABLE "short_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"short_code" text NOT NULL,
	"original_url" text NOT NULL,
	"title" text,
	"clicks" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "short_links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;