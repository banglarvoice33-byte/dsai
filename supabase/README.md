# Supabase migration boundary

This directory contains the PostgreSQL baseline generated from the DSAI Drizzle schema.

Apply it only to a disposable/staging Supabase project after reviewing the SQL and confirming that the project is empty or has an approved data migration plan. Do not run it against an existing production database without a backup, restore rehearsal, and explicit cutover plan.

The application still uses Drizzle for schema ownership. `drizzle.config.ts` and `drizzle/` are the source-of-truth migration workflow; this copy is provided for Supabase CLI/operator review. No Supabase credentials are stored in this repository.
