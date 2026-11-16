-- DSAI uses a server-owned data path (Express/tRPC with a protected PostgreSQL connection).
-- The application users are stored in public.users with integer IDs and Manus OAuth
-- openId values; they are not Supabase Auth UUID identities. Therefore auth.uid()-based
-- per-user policies would be incorrect and could create a false sense of isolation.
--
-- All public tables remain inaccessible to the Supabase Data API client roles.
-- These explicit deny policies document and enforce that boundary if table privileges
-- are ever granted accidentally. The backend's postgres/service_role connection has
-- BYPASSRLS and continues to use the existing authenticated server API.
--
-- Do not add client-facing SELECT/INSERT/UPDATE/DELETE policies until a trusted,
-- verified mapping from Supabase Auth subject to DSAI user ID is implemented and tested.

CREATE POLICY dsai_server_only_deny_direct_client_access ON public.access_cases
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.agent_traces
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.ai_provider_rate_limits
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.benchmark_runs
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.billing_webhook_events
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.changelog_entries
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.creative_requests
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.data_lifecycle_events
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.deletion_requests
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.dsai_r2_usage_counters
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.file_assets
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.generated_images
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.image_generation_daily_users
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.image_generation_usage
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.integration_connectors
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.lead_activities
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.lead_records
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.oauth_test_runs
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.performance_snapshots
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.release_gate_checks
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.search_analytics
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_pro_entitlements
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_pro_usage_counters
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_scholarship_applications
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_scholarship_programs
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.users
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.waitlist_signups
  AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
