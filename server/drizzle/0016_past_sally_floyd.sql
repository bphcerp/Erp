CREATE TABLE IF NOT EXISTS "conference_approval_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"purpose" integer,
	"content_title" integer,
	"event_name" integer,
	"venue" integer,
	"date" integer,
	"organized_by" integer,
	"mode_of_event" integer,
	"description" integer,
	"travel_reimbursement" integer,
	"registration_fee_reimbursement" integer,
	"daily_allowance_reimbursement" integer,
	"accomodation_reimbursement" integer,
	"other_reimbursement" integer,
	"letter_of_invitation" integer,
	"first_page_of_paper" integer,
	"reviewers_comments" integer,
	"details_of_event" integer,
	"other_documents" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "application_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"comments" text NOT NULL,
	"updated_as" text NOT NULL,
	"status" boolean NOT NULL,
	"application_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" "modules" NOT NULL,
	"user_email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "date_field_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"comments" text NOT NULL,
	"updated_as" text NOT NULL,
	"status" boolean NOT NULL,
	"date_field" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "date_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" "modules" NOT NULL,
	"user_email" text NOT NULL,
	"value" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "number_field_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"comments" text NOT NULL,
	"updated_as" text NOT NULL,
	"status" boolean NOT NULL,
	"number_field" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "number_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" "modules" NOT NULL,
	"user_email" text NOT NULL,
	"value" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_handout_requests" RENAME COLUMN "user_email" TO "application_id";--> statement-breakpoint
ALTER TABLE "course_handout_requests" DROP CONSTRAINT "course_handout_requests_user_email_users_email_fk";
--> statement-breakpoint
ALTER TABLE "course_handout_requests" ALTER COLUMN "application_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "phd" ADD COLUMN "suggested_dac_members" text[] DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "file_fields" ADD COLUMN "user_email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "text_fields" ADD COLUMN "user_email" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_purpose_text_fields_id_fk" FOREIGN KEY ("purpose") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_content_title_text_fields_id_fk" FOREIGN KEY ("content_title") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_event_name_text_fields_id_fk" FOREIGN KEY ("event_name") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_venue_text_fields_id_fk" FOREIGN KEY ("venue") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_date_date_fields_id_fk" FOREIGN KEY ("date") REFERENCES "public"."date_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_organized_by_text_fields_id_fk" FOREIGN KEY ("organized_by") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_mode_of_event_text_fields_id_fk" FOREIGN KEY ("mode_of_event") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_description_text_fields_id_fk" FOREIGN KEY ("description") REFERENCES "public"."text_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_travel_reimbursement_number_fields_id_fk" FOREIGN KEY ("travel_reimbursement") REFERENCES "public"."number_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_registration_fee_reimbursement_number_fields_id_fk" FOREIGN KEY ("registration_fee_reimbursement") REFERENCES "public"."number_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_daily_allowance_reimbursement_number_fields_id_fk" FOREIGN KEY ("daily_allowance_reimbursement") REFERENCES "public"."number_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_accomodation_reimbursement_number_fields_id_fk" FOREIGN KEY ("accomodation_reimbursement") REFERENCES "public"."number_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_other_reimbursement_number_fields_id_fk" FOREIGN KEY ("other_reimbursement") REFERENCES "public"."number_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_letter_of_invitation_file_fields_id_fk" FOREIGN KEY ("letter_of_invitation") REFERENCES "public"."file_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_first_page_of_paper_file_fields_id_fk" FOREIGN KEY ("first_page_of_paper") REFERENCES "public"."file_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_reviewers_comments_file_fields_id_fk" FOREIGN KEY ("reviewers_comments") REFERENCES "public"."file_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_details_of_event_file_fields_id_fk" FOREIGN KEY ("details_of_event") REFERENCES "public"."file_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conference_approval_applications" ADD CONSTRAINT "conference_approval_applications_other_documents_file_fields_id_fk" FOREIGN KEY ("other_documents") REFERENCES "public"."file_fields"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_status" ADD CONSTRAINT "application_status_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_status" ADD CONSTRAINT "application_status_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "date_field_status" ADD CONSTRAINT "date_field_status_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "date_field_status" ADD CONSTRAINT "date_field_status_date_field_date_fields_id_fk" FOREIGN KEY ("date_field") REFERENCES "public"."date_fields"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "date_fields" ADD CONSTRAINT "date_fields_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "number_field_status" ADD CONSTRAINT "number_field_status_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "number_field_status" ADD CONSTRAINT "number_field_status_number_field_number_fields_id_fk" FOREIGN KEY ("number_field") REFERENCES "public"."number_fields"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "number_fields" ADD CONSTRAINT "number_fields_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phd" ADD CONSTRAINT "phd_notional_supervisor_email_users_email_fk" FOREIGN KEY ("notional_supervisor_email") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phd" ADD CONSTRAINT "phd_supervisor_email_users_email_fk" FOREIGN KEY ("supervisor_email") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phd" ADD CONSTRAINT "phd_co_supervisor_email_users_email_fk" FOREIGN KEY ("co_supervisor_email") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phd" ADD CONSTRAINT "phd_co_supervisor_email_2_users_email_fk" FOREIGN KEY ("co_supervisor_email_2") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phd" ADD CONSTRAINT "phd_dac_1_email_users_email_fk" FOREIGN KEY ("dac_1_email") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phd" ADD CONSTRAINT "phd_dac_2_email_users_email_fk" FOREIGN KEY ("dac_2_email") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_fields" ADD CONSTRAINT "file_fields_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "text_fields" ADD CONSTRAINT "text_fields_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_handout_requests" ADD CONSTRAINT "course_handout_requests_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
