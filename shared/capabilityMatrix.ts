export type CapabilityStatus = "implemented" | "foundation" | "preview" | "provider-gated" | "roadmap";
export type Sector = "government" | "private" | "cross-sector";

export type ServiceCapability = {
  id: string;
  sector: Sector;
  department: string;
  service: string;
  supportedInputs: string[];
  outputs: string[];
  status: CapabilityStatus;
  qualityLevel: "controlled-alpha" | "foundation" | "preview-only" | "not-live";
  evidence: string[];
  specializationGap: string;
  humanGate: string;
};

export const DSAI_CAPABILITY_MATRIX: ServiceCapability[] = [
  { id: "gov-forms", sector: "government", department: "Public Access", service: "Notice, form, application, and service explanation", supportedInputs: ["PDF metadata", "user-provided text", "Bengali/Banglish/English brief"], outputs: ["plain-language summary", "checklist", "draft Work Packet"], status: "implemented", qualityLevel: "controlled-alpha", evidence: ["access case schema", "Bengali routing benchmark", "human review boundary"], specializationGap: "OCR and signed document intake are not live.", humanGate: "Human review for legal, medical, immigration, or official submission decisions." },
  { id: "gov-records", sector: "government", department: "Records & Evidence", service: "Source-aware records and evidence preparation", supportedInputs: ["source URLs", "text", "redacted file metadata"], outputs: ["evidence bundle", "claim-gap report", "citation-ready draft"], status: "foundation", qualityLevel: "foundation", evidence: ["Pramanika agent contract", "provenance fields", "release gates"], specializationGap: "Retention schedule mapping and agency-specific records controls require operator configuration.", humanGate: "Records officer or subject-matter reviewer approves consequential claims." },
  { id: "gov-scholarship", sector: "government", department: "Scholarship & Public Programs", service: "Application metadata, review queue, and bounded entitlement", supportedInputs: ["application metadata", "institution evidence reference hash"], outputs: ["review decision", "quota ledger", "audit metadata"], status: "implemented", qualityLevel: "controlled-alpha", evidence: ["100-seat scholarship schema", "review procedures", "usage counters"], specializationGap: "Identity, institution, and anti-fraud providers are not fully connected.", humanGate: "Manual reviewer approval and operator-owned entitlement policy." },
  { id: "private-ops", sector: "private", department: "Business Operations", service: "Lead intake, workflow decomposition, and reviewable Work Packets", supportedInputs: ["Bengali/Banglish/English request", "source links", "CRM/calendar metadata"], outputs: ["action plan", "Work Packet", "approval queue"], status: "implemented", qualityLevel: "controlled-alpha", evidence: ["lead planner", "durable traces", "preview-first integration prototype"], specializationGap: "External CRM/calendar writes remain provider-gated.", humanGate: "Explicit user approval before external create, update, send, or book." },
  { id: "private-multilingual-leads", sector: "private", department: "Business Operations", service: "Universal multilingual business lead drafting", supportedInputs: ["Any-language brief", "target country/language", "industry and business context", "audience, tone, and channel"], outputs: ["localized draft", "opt-out line", "quality note", "fallback provenance"], status: "implemented", qualityLevel: "controlled-alpha", evidence: ["/lead-composer route", "40-market catalog", "structured draft contract", "consent and no-send guard"], specializationGap: "Translation quality, local compliance, recipient consent, and external delivery require human/provider validation.", humanGate: "Explicit consent to draft and human review before any use; automatic outreach is disabled." },
  { id: "private-creative", sector: "private", department: "Creative Studio", service: "Image/video brief planning and source-rights review", supportedInputs: ["text brief", "owned reference asset metadata", "duration and aspect constraints"], outputs: ["provider-ready plan", "storyboard", "provenance manifest"], status: "preview", qualityLevel: "preview-only", evidence: ["independent creative agents", "quality/safety contracts", "cost policy"], specializationGap: "Live media adapter, worker, moderation, storage, billing, and signed provenance are not live.", humanGate: "Human approval before commercial, public, audio, likeness, or reference-asset release." },
  { id: "cross-file", sector: "cross-sector", department: "Secure File Services", service: "Quarantine, scan, retention, deletion evidence, and export metadata", supportedInputs: ["PDF", "DOCX", "XLSX", "PPTX", "image", "audio/video metadata"], outputs: ["scan verdict", "retention event", "deletion tombstone", "audit export"], status: "foundation", qualityLevel: "foundation", evidence: ["file asset schema", "fail-closed scan contracts", "lifecycle audit table"], specializationGap: "Real scanner, object storage deletion, OCR, and large-file pipeline require providers.", humanGate: "Operator resolves scanner failure, infected verdict, deletion uncertainty, or retention exception." },
];
