-- Persistent, user-owned lead CRM. All writes remain server-side.
-- Draft-generation consent is not contact consent; new rows default to unknown.
CREATE TABLE IF NOT EXISTS public.lead_records (
  id serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title varchar(240) NOT NULL,
  company varchar(180),
  "contactName" varchar(160),
  email varchar(320),
  phone varchar(40),
  website varchar(500),
  source varchar(120) NOT NULL DEFAULT 'user-entered',
  "sourceUrl" varchar(1000),
  "sourceEvidence" text,
  country varchar(80),
  language varchar(80),
  industry varchar(80),
  notes text,
  "draftSubject" varchar(240),
  "draftBody" text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','contacted','interested','converted','lost')),
  "consentStatus" text NOT NULL DEFAULT 'unknown' CHECK ("consentStatus" IN ('unknown','granted','withdrawn','not_required')),
  "consentSource" varchar(240),
  "consentCapturedAt" timestamp,
  "nextFollowUpAt" timestamp,
  "archivedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_records_owner_created_idx
  ON public.lead_records ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS lead_records_owner_status_created_idx
  ON public.lead_records ("userId", status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS lead_records_owner_followup_idx
  ON public.lead_records ("userId", "nextFollowUpAt");

CREATE TABLE IF NOT EXISTS public.lead_activities (
  id serial PRIMARY KEY,
  "leadId" integer NOT NULL REFERENCES public.lead_records(id) ON DELETE CASCADE,
  "userId" integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "activityType" text NOT NULL CHECK ("activityType" IN ('created','note','status_changed','follow_up_scheduled','consent_updated')),
  summary varchar(500) NOT NULL,
  details text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_activities_lead_created_idx
  ON public.lead_activities ("leadId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS lead_activities_owner_created_idx
  ON public.lead_activities ("userId", "createdAt" DESC);

ALTER TABLE public.lead_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lead_records FROM anon, authenticated;
REVOKE ALL ON TABLE public.lead_activities FROM anon, authenticated;
GRANT ALL ON TABLE public.lead_records TO service_role;
GRANT ALL ON TABLE public.lead_activities TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.lead_records_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.lead_activities_id_seq TO service_role;
