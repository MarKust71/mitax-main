CREATE SCHEMA "dir";
--> statement-breakpoint
CREATE TYPE "dir"."bank" AS ENUM('ERSTE', 'BPS');--> statement-breakpoint
CREATE TABLE "dir"."bank_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_id" uuid NOT NULL,
	"import_batch_id" uuid NOT NULL,
	"bank" "dir"."bank" NOT NULL,
	"dedup_key" text NOT NULL,
	"account_number" text,
	"booking_date" date NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text NOT NULL,
	"counterparty_name" text,
	"counterparty_account" text,
	"title" text,
	"bank_reference" text,
	"is_oswiata" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone,
	"processed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bank_transactions_dedup_unique" UNIQUE("context_id","bank","dedup_key")
);
--> statement-breakpoint
CREATE TABLE "dir"."import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_id" uuid NOT NULL,
	"bank" "dir"."bank" NOT NULL,
	"file_name" text NOT NULL,
	"file_sha256" text NOT NULL,
	"imported_by" uuid NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"total_rows" integer NOT NULL,
	"inserted_rows" integer NOT NULL,
	"skipped_rows" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"user_email" text NOT NULL,
	"context_id" uuid,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contexts" ADD COLUMN "modules" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "dir"."bank_transactions" ADD CONSTRAINT "bank_transactions_context_id_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dir"."bank_transactions" ADD CONSTRAINT "bank_transactions_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "dir"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dir"."import_batches" ADD CONSTRAINT "import_batches_context_id_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_context_id_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bank_transactions_context_date_idx" ON "dir"."bank_transactions" USING btree ("context_id","booking_date");--> statement-breakpoint
CREATE INDEX "import_batches_context_idx" ON "dir"."import_batches" USING btree ("context_id","imported_at");--> statement-breakpoint
CREATE INDEX "audit_log_context_created_idx" ON "audit_log" USING btree ("context_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_user_created_idx" ON "audit_log" USING btree ("user_id","created_at");--> statement-breakpoint
-- The activity log is append-only: rows can be neither changed nor removed, not even by the app user.
CREATE FUNCTION public.audit_log_reject_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER audit_log_append_only
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW EXECUTE FUNCTION public.audit_log_reject_changes();
--> statement-breakpoint
CREATE TRIGGER audit_log_no_truncate
BEFORE TRUNCATE ON public.audit_log
FOR EACH STATEMENT EXECUTE FUNCTION public.audit_log_reject_changes();
