-- The app user has no CREATE privilege on the database. Creating a context therefore goes through
-- this SECURITY DEFINER function (owned by the admin/migration user), which validates the name
-- (USAGE goes to the calling session user) and can create nothing but a `ctx_*` schema. EXECUTE is granted to the app user by
-- scripts/db-grant-app-user.mjs (`yarn db:grants`, run automatically after `yarn db:migrate`).
CREATE FUNCTION public.create_context_schema(schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF schema_name !~ '^ctx_[a-z0-9_]{1,50}$' THEN
    RAISE EXCEPTION 'Invalid context schema name: %', schema_name;
  END IF;

  EXECUTE format('CREATE SCHEMA %I', schema_name);
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', schema_name, session_user);
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_context_schema(text) FROM PUBLIC;
