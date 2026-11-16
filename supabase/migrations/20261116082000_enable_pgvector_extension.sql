-- DSAI Phase 2: enable pgvector in the existing Supabase PostgreSQL project.
-- No user tables or data are changed by this migration.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

COMMENT ON EXTENSION vector IS
  'DSAI vector data type and similarity operators for future document knowledge retrieval.';
