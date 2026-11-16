-- Cover the file_asset_id foreign key used for joins and cascaded deletes.
-- Keeps the private document knowledge lookup/delete path indexed.
BEGIN;
CREATE INDEX IF NOT EXISTS document_knowledge_documents_file_asset_idx
  ON private.document_knowledge_documents (file_asset_id);
COMMIT;
