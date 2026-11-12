-- DSAI security baseline: deny direct anon/authenticated Supabase table access.
-- The DSAI server connects through its protected PostgreSQL connection and owns
-- the application data path. Add explicit policies only after Supabase Auth or
-- an equivalent identity mapping is implemented and tested.
ALTER TABLE "public"."access_cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."agent_traces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."benchmark_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."billing_webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."changelog_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."creative_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."data_lifecycle_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deletion_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."file_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."integration_connectors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."oauth_test_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."performance_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."release_gate_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_pro_entitlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_pro_usage_counters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_scholarship_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_scholarship_programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."waitlist_signups" ENABLE ROW LEVEL SECURITY;
