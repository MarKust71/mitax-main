CREATE TABLE "dir"."own_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_id" uuid NOT NULL,
	"account_number" text NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "own_accounts_unique" UNIQUE("context_id","account_number")
);
--> statement-breakpoint
ALTER TABLE "dir"."own_accounts" ADD CONSTRAINT "own_accounts_context_id_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."contexts"("id") ON DELETE no action ON UPDATE no action;