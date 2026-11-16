-- Defense in depth: even if schema/table grants are changed later,
-- browser roles must never read or mutate private document-knowledge rows.
BEGIN;

CREATE POLICY document_knowledge_documents_deny_client
  ON private.document_knowledge_documents
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY document_knowledge_chunks_deny_client
  ON private.document_knowledge_chunks
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMIT;
