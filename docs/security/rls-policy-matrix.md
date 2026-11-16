# DSAI public-schema RLS policy matrix

**Policy model:** server-owned / deny direct Data API access  
**Database project:** `wleytsrflhboyevhigiu` (Banglar-voice)  
**Migration:** `20261116000913_dsai_explicit_server_only_rls_policies.sql`

## Why these are deny policies, not `auth.uid() = user_id`

The live schema stores DSAI's integer identity in `public.users.id` and a string `openId`. The backend verifies Supabase Auth access tokens and maps the verified UUID to `openId = 'supabase:' || auth.uid()` before resolving the integer DSAI user ID. The Express/tRPC backend then uses its protected PostgreSQL connection. A direct predicate such as `auth.uid() = userId` is still type/domain-incompatible; a future browser Data API path would need a carefully reviewed SQL mapping helper and table-specific owner policies. No browser Data API path is currently required.

Catalog inspection found no direct table DML grants to `anon` or `authenticated` before the policy migration. The migration itself adds explicit `USING (false)` / `WITH CHECK (false)` policies as defense-in-depth; it does not revoke privileges or grant the backend/service role access. This migration adds explicit RLS policies so the deny-by-default intent is visible in the policy catalog and remains a defense-in-depth barrier if client grants are accidentally introduced.

## Applied policy

Every table below has one **RESTRICTIVE** policy named `dsai_server_only_deny_direct_client_access`. The initial policy was permissive; the follow-up migration drops and recreates it as restrictive.

- Policy type: `RESTRICTIVE` (combined with other policies using `AND`)
- Commands: `ALL`
- Roles: `anon`, `authenticated`
- `USING (false)`
- `WITH CHECK (false)`

PostgreSQL requires at least one permissive policy to grant access. With no permissive policies present, direct client access remains default-denied; if a permissive policy is added later, this restrictive `false` guard still blocks it.

This intentionally denies direct Supabase Data API reads and writes for both client roles. The server's trusted database role has `BYPASSRLS` and continues to use the existing backend authorization layer. Do not expose `service_role`, database credentials, or server secrets to browsers.

## Table coverage

| Public table | Direct client policy |
| --- | --- |
| `access_cases` | deny all |
| `agent_traces` | deny all |
| `ai_provider_rate_limits` | deny all |
| `benchmark_runs` | deny all |
| `billing_webhook_events` | deny all |
| `changelog_entries` | deny all |
| `creative_requests` | deny all |
| `data_lifecycle_events` | deny all |
| `deletion_requests` | deny all |
| `dsai_r2_usage_counters` | deny all |
| `file_assets` | deny all |
| `generated_images` | deny all |
| `image_generation_daily_users` | deny all |
| `image_generation_usage` | deny all |
| `integration_connectors` | deny all |
| `lead_activities` | deny all |
| `lead_records` | deny all |
| `oauth_test_runs` | deny all |
| `performance_snapshots` | deny all |
| `release_gate_checks` | deny all |
| `search_analytics` | deny all |
| `student_pro_entitlements` | deny all |
| `student_pro_usage_counters` | deny all |
| `student_scholarship_applications` | deny all |
| `student_scholarship_programs` | deny all |
| `users` | deny all |
| `waitlist_signups` | deny all |

## Verification performed after applying migration

- Public tables: 27
- RLS enabled: 27
- Tables with an explicit policy: 27
- Tables with the expected restrictive deny policy: 27
- Restrictive policies: 27
- Permissive policies: 0
- Policies with both `qual=false` and `with_check=false`: 27
- Latest migration applied: `20261116003434`
- `anon` roles with direct DML table privileges: 0 (verified via `information_schema.role_table_grants`)
- `authenticated` roles with direct DML table privileges: 0 (verified via `information_schema.role_table_grants`)
- Migration SQL: policy creation only; no `GRANT` or `REVOKE` statements
- Security Advisor `rls_enabled_no_policy`: no longer reported
- Remaining Security Advisor warning: leaked-password protection disabled (separate Auth configuration item)

## Future change requirements

If direct Supabase client access is ever needed, do not replace these policies with blanket authenticated access. First implement a trusted mapping from the verified Supabase Auth subject to the DSAI user identity, define table-by-table ownership and role requirements, test cross-user isolation (including UPDATE `USING` and `WITH CHECK`), then deliberately replace the relevant deny policy and add explicit grants. Server-only tables (webhook events, rate limits, quotas, traces, audit and operational data) should remain inaccessible to client roles.
