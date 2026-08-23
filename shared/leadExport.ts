export type LeadExportData = {
  marketId: string;
  targetCountry: string;
  targetLanguage: string;
  industry: string;
  businessStage: string;
  leadGoal: string;
  audience: string;
  workingRegion: string;
  tone: string;
  channel: string;
  sourceLanguage: string;
  brief: string;
  subject: string;
  greeting: string;
  body: string;
  callToAction: string;
  optOutLine: string;
  qualityNote: string;
};

export const sanitizeExcelCell = (value: unknown) => {
  const text = String(value ?? "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
};

export const buildLeadExportRows = (data: LeadExportData): string[][] => [
  ["DSAI draft export", "Draft only — no message sent"],
  ["Target country", data.targetCountry], ["Target language", data.targetLanguage], ["Market", data.marketId],
  ["Industry", data.industry], ["Business stage", data.businessStage], ["Lead goal", data.leadGoal], ["Audience", data.audience],
  ["Working region", data.workingRegion], ["Tone", data.tone], ["Channel", data.channel], ["Source language", data.sourceLanguage],
  ["Brief", data.brief], ["Subject", data.subject], ["Greeting", data.greeting], ["Body", data.body],
  ["Call to action", data.callToAction], ["Opt-out line", data.optOutLine], ["Quality note", data.qualityNote],
  ["Human review required", "Yes"], ["Outbound send allowed", "No"],
].map(([key, value]) => [sanitizeExcelCell(key), sanitizeExcelCell(value)]);
