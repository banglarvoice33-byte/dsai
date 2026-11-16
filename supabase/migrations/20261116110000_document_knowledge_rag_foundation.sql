-- DSAI document knowledge foundation.
-- Embedding contract: Cloudflare Workers AI @cf/baai/bge-m3 returns 1,024 dimensions.
-- This migration creates storage/search primitives only; it does not claim OCR or ingestion is live.
BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.document_knowledge_documents (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_asset_id INTEGER NOT NULL REFERENCES public.file_assets(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  content_sha256 CHAR(64) NOT NULL,
  embedding_model TEXT NOT NULL DEFAULT '@cf/baai/bge-m3',
  embedding_dimension SMALLINT NOT NULL DEFAULT 1024 CHECK (embedding_dimension = 1024),
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'extracting', 'chunking', 'embedding', 'ready', 'failed', 'deleted')),
  chunk_count INTEGER NOT NULL DEFAULT 0 CHECK (chunk_count >= 0),
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, file_asset_id, content_sha256)
);

CREATE INDEX IF NOT EXISTS document_knowledge_documents_user_status_idx
  ON private.document_knowledge_documents (user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS private.document_knowledge_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES private.document_knowledge_documents(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  content TEXT NOT NULL CHECK (length(content) > 0),
  token_count INTEGER CHECK (token_count IS NULL OR token_count >= 0),
  embedding_model TEXT NOT NULL DEFAULT '@cf/baai/bge-m3',
  embedding extensions.vector(1024) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS document_knowledge_chunks_document_idx
  ON private.document_knowledge_chunks (document_id, chunk_index);
CREATE INDEX IF NOT EXISTS document_knowledge_chunks_user_idx
  ON private.document_knowledge_chunks (user_id, document_id);
CREATE INDEX IF NOT EXISTS document_knowledge_chunks_embedding_hnsw_idx
  ON private.document_knowledge_chunks
  USING hnsw (embedding extensions.vector_cosine_ops);

-- The private schema is deliberately not exposed to anon/authenticated API roles.
-- Backend service-role access is required for ingestion and search.
ALTER TABLE private.document_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.document_knowledge_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE private.document_knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.document_knowledge_chunks FORCE ROW LEVEL SECURITY;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
REVOKE ALL ON private.document_knowledge_documents FROM PUBLIC, anon, authenticated;
REVOKE ALL ON private.document_knowledge_chunks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON private.document_knowledge_documents TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON private.document_knowledge_chunks TO service_role;
GRANT USAGE, SELECT ON SEQUENCE private.document_knowledge_documents_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE private.document_knowledge_chunks_id_seq TO service_role;

CREATE OR REPLACE FUNCTION private.search_document_knowledge(
  p_user_id INTEGER,
  p_query_embedding extensions.vector(1024),
  p_match_count INTEGER DEFAULT 8,
  p_min_similarity REAL DEFAULT 0.25
)
RETURNS TABLE (
  document_id BIGINT,
  chunk_id BIGINT,
  file_asset_id INTEGER,
  original_name TEXT,
  chunk_content TEXT,
  similarity REAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    d.id AS document_id,
    c.id AS chunk_id,
    d.file_asset_id,
    d.original_name,
    c.content AS chunk_content,
    (1 - (c.embedding OPERATOR(extensions.<=>) p_query_embedding))::REAL AS similarity
  FROM private.document_knowledge_chunks AS c
  JOIN private.document_knowledge_documents AS d ON d.id = c.document_id
  WHERE c.user_id = p_user_id
    AND d.user_id = p_user_id
    AND d.status = 'ready'
    AND (1 - (c.embedding OPERATOR(extensions.<=>) p_query_embedding)) >= GREATEST(0, LEAST(1, p_min_similarity))
  ORDER BY c.embedding OPERATOR(extensions.<=>) p_query_embedding
  LIMIT GREATEST(1, LEAST(20, p_match_count));
$function$;

REVOKE ALL ON FUNCTION private.search_document_knowledge(INTEGER, extensions.vector(1024), INTEGER, REAL) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.search_document_knowledge(INTEGER, extensions.vector(1024), INTEGER, REAL) TO service_role;

COMMENT ON TABLE private.document_knowledge_documents IS
  'Private per-user document ingestion state for DSAI; only backend service_role may access.';
COMMENT ON TABLE private.document_knowledge_chunks IS
  'Private per-user text chunks with 1,024-dimensional @cf/baai/bge-m3 embeddings.';
COMMENT ON FUNCTION private.search_document_knowledge(INTEGER, extensions.vector(1024), INTEGER, REAL) IS
  'Backend-only cosine similarity search scoped to one DSAI user; returns ready-document chunks only.';

COMMIT;
