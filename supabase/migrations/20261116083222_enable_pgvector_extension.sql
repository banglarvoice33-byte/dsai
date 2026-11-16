-- Enable pgvector in Supabase's extensions schema for private document embeddings.
BEGIN;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
COMMIT;
