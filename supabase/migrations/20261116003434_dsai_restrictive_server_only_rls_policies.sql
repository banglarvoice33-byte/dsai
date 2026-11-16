-- Strengthen the original explicit server-only RLS policies.
-- PostgreSQL combines PERMISSIVE policies with OR; a future permissive allow policy
-- could otherwise override a PERMISSIVE USING(false) policy. RESTRICTIVE policies
-- are ANDed with every applicable permissive policy, so this guard remains deny-only
-- even if a future client-facing policy is accidentally added.
-- DSAI still uses integer public.users.id + Manus openId; no auth.uid() mapping exists.

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.access_cases;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.access_cases
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.agent_traces;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.agent_traces
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.ai_provider_rate_limits;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.ai_provider_rate_limits
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.benchmark_runs;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.benchmark_runs
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.billing_webhook_events;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.billing_webhook_events
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.changelog_entries;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.changelog_entries
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.creative_requests;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.creative_requests
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.data_lifecycle_events;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.data_lifecycle_events
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.deletion_requests;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.deletion_requests
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.dsai_r2_usage_counters;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.dsai_r2_usage_counters
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.file_assets;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.file_assets
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.generated_images;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.generated_images
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.image_generation_daily_users;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.image_generation_daily_users
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.image_generation_usage;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.image_generation_usage
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.integration_connectors;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.integration_connectors
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.lead_activities;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.lead_activities
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.lead_records;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.lead_records
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.oauth_test_runs;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.oauth_test_runs
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.performance_snapshots;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.performance_snapshots
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.release_gate_checks;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.release_gate_checks
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.search_analytics;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.search_analytics
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.student_pro_entitlements;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_pro_entitlements
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.student_pro_usage_counters;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_pro_usage_counters
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.student_scholarship_applications;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_scholarship_applications
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.student_scholarship_programs;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.student_scholarship_programs
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.users;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.users
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access ON public.waitlist_signups;
CREATE POLICY dsai_server_only_deny_direct_client_access ON public.waitlist_signups
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
