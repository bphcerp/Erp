CREATE TABLE IF NOT EXISTS "phdDocuments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"formName" varchar(255) NOT NULL,
	"applicationType" varchar(100) NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "phd" ALTER COLUMN "qualifying_area_1" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "phd_courses" ALTER COLUMN "course_names" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "phd_courses" ALTER COLUMN "course_grades" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "phd_courses" ALTER COLUMN "course_units" SET DEFAULT '{}'::integer[];--> statement-breakpoint
ALTER TABLE "phd" ADD COLUMN "number_of_qe_application" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "phd" ADD COLUMN "qualification_date" timestamp with time zone DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "phd_courses" ADD COLUMN "course_ids" text[] DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "phd_config" ADD CONSTRAINT "phd_config_key_unique" UNIQUE("key");