CREATE TABLE "user_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"size" integer NOT NULL,
	"type" text NOT NULL,
	"used_in" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_images_userId_idx" ON "user_images" USING btree ("user_id");