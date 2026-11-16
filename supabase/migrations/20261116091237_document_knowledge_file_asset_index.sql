-- Cover the file_asset_id foreign key used for joins and cascaded deletes.
-- Keeps the private document knowledge lookup/delete path indexed.
BEGIN;
-- The unique constraint already creates (document_id, chunk_index); remove its duplicate index.
DROP INDEX IF EXISTS private.document_knowledge_chunks_document_idx;
CREATE INDEX IF NOT EXISTS document_knowledge_documents_file_asset_idx
  ON private.document_knowledge_documents (file_asset_id);
COMMIT;
