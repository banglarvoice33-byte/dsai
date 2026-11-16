-- Fail closed at the database boundary while the application release is pending.
-- A checksum/signature-only status must never be mistaken for malware-clean.
-- This is defense-in-depth; the application still owns authenticated scan orchestration.
ALTER TABLE public.file_assets
  ADD CONSTRAINT file_assets_disallow_unscanned_validated_status
  CHECK ("scanStatus" <> 'validated');
