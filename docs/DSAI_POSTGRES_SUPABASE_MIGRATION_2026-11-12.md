# DSAI PostgreSQL / Supabase Migration — Tranche 1

**Date:** 2026-11-12  
**Status:** Code pushed and baseline plus RLS hardening applied to the authorized Supabase project.  
**Scope:** MySQL/TiDB Drizzle runtime → PostgreSQL-compatible Drizzle runtime.

## Completed

- Replaced `drizzle-orm/mysql2` with `drizzle-orm/postgres-js`.
- Removed the `mysql2` dependency and added pinned `postgres@3.4.7`.
- Converted `drizzle/schema.ts` from MySQL core tables/types to PostgreSQL core tables/types.
- Preserved existing table names, column names, TypeScript unions, indexes and unique constraints.
- Converted auto-increment primary keys to PostgreSQL `serial` columns.
- Preserved current integer-backed boolean flags (`0/1`) to avoid an unsafe application-level type change.
- Replaced MySQL `onDuplicateKeyUpdate` with PostgreSQL `onConflictDoUpdate`.
- Replaced MySQL `insertId` and `affectedRows` assumptions with PostgreSQL `returning()` and returned-row checks.
- Changed Drizzle Kit dialect to `postgresql`.
- Updated production validation to accept `postgresql://` and reject `mysql://`.
- Updated Docker Compose to PostgreSQL 17.5 with a persistent named volume.
- Updated `.env.production.example`, Docker placeholder template, README, VPS setup helper and contract tests.
- Removed the obsolete former MySQL migration lineage after the PostgreSQL cutover; the active repository now contains only the PostgreSQL migration path.
- Generated a new PostgreSQL baseline at `drizzle/0000_narrow_morlocks.sql`.
- Copied the reviewed baseline for Supabase CLI/operator review at `supabase/migrations/20261112134500_initial_dsai_schema.sql`.

## Validation

- `pnpm check`: PASS
- `pnpm exec vitest run server/config.validation.test.ts server/fresh-vm.contract.test.ts`: PASS, 12 tests
- `pnpm test`: PASS, 50 files / 154 tests
- Credential scan of generated migration and Supabase directory: PASS
- External Supabase baseline migration apply: **PASS** on project `wleytsrflhboyevhigiu`
- Supabase RLS deny-by-default hardening: **PASS** on all 20 tables
- Live `/readyz`: **NOT VERIFIED**
- Data copy from an existing MySQL/TiDB database: **NOT RUN**
- Production cutover/rollback: **NOT RUN**

## Important compatibility notes

The current schema uses text columns with TypeScript-limited unions for former MySQL enums. This preserves application typing and keeps the first migration reversible, but it does not yet add PostgreSQL `CHECK` constraints or native PostgreSQL enum types. Native enum/check hardening should be a follow-up migration after staging data and query behavior are verified.

The current schema intentionally keeps several flag fields as integers because the application currently writes and reads `0/1`. Converting them to PostgreSQL `boolean` requires a coordinated application and data migration and should not be mixed into the first driver migration.

The generated baseline does not create foreign keys because the current source schema did not declare them. Adding referential constraints is a separate integrity-hardening tranche and must be preceded by orphan-row analysis for any migrated data.

## Supabase apply boundary

Do not apply the baseline to a non-empty production Supabase project without:

1. a verified database backup;
2. a staging project or disposable database;
3. an explicit MySQL/TiDB-to-PostgreSQL data mapping and row-count comparison;
4. a restore rehearsal;
5. a maintenance/cutover window;
6. a rollback plan;
7. a final `/readyz` and authenticated workflow test.

No Supabase credential, service-role key, or database URL is stored in this repository. The project reference is recorded only as deployment evidence.

## Recommended next tranche

1. Configure the protected production `DATABASE_URL` for the deployed Supabase project.
2. Run application smoke tests against real PostgreSQL: OAuth user upsert, waitlist upsert, search analytics conflict update, scholarship approval/usage transaction, lifecycle event creation and billing webhook idempotency.
3. Add explicit PostgreSQL `CHECK` constraints or native enums only after the smoke test passes.
4. Add narrowly scoped RLS policies only after the identity mapping is defined and tested; current RLS is intentionally deny-by-default.
5. Build a one-time, audited data migration tool only if legacy MySQL/TiDB data must be retained.
