-- Preserve RLS semantics while evaluating auth.uid() once per statement.
-- Add the missing owner/time index so FK maintenance and owner-scoped history
-- queries do not require repeated full scans.

DROP POLICY IF EXISTS "own plan read" ON public.user_plans;
CREATE POLICY "own plan read"
  ON public.user_plans
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "own items read" ON public.saved_items;
CREATE POLICY "own items read"
  ON public.saved_items
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "own items delete" ON public.saved_items;
CREATE POLICY "own items delete"
  ON public.saved_items
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS ai_usage_logs_user_created_idx
  ON public.ai_usage_logs (user_id, created_at DESC);

COMMENT ON INDEX public.ai_usage_logs_user_created_idx IS
  'Supports user-scoped AI usage history and covers the ai_usage_logs.user_id foreign key.';
