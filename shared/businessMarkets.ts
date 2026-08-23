export type BusinessMarket = {
  id: string;
  country: string;
  region: string;
  defaultLanguage: string;
  locale: string;
  currency: string;
  timeZone: string;
  formality: "formal" | "neutral" | "warm";
};

// Product defaults only: users can override language and cultural tone before drafting.
export const BUSINESS_MARKETS: BusinessMarket[] = [
  { id: "us", country: "United States", region: "North America", defaultLanguage: "English (US)", locale: "en-US", currency: "USD", timeZone: "America/New_York", formality: "neutral" },
  { id: "ca", country: "Canada", region: "North America", defaultLanguage: "English (Canada)", locale: "en-CA", currency: "CAD", timeZone: "America/Toronto", formality: "neutral" },
  { id: "uk", country: "United Kingdom", region: "Europe", defaultLanguage: "English (UK)", locale: "en-GB", currency: "GBP", timeZone: "Europe/London", formality: "formal" },
  { id: "au", country: "Australia", region: "Oceania", defaultLanguage: "English (Australia)", locale: "en-AU", currency: "AUD", timeZone: "Australia/Sydney", formality: "neutral" },
  { id: "nz", country: "New Zealand", region: "Oceania", defaultLanguage: "English (New Zealand)", locale: "en-NZ", currency: "NZD", timeZone: "Pacific/Auckland", formality: "warm" },
  { id: "de", country: "Germany", region: "Europe", defaultLanguage: "German", locale: "de-DE", currency: "EUR", timeZone: "Europe/Berlin", formality: "formal" },
  { id: "fr", country: "France", region: "Europe", defaultLanguage: "French", locale: "fr-FR", currency: "EUR", timeZone: "Europe/Paris", formality: "formal" },
  { id: "it", country: "Italy", region: "Europe", defaultLanguage: "Italian", locale: "it-IT", currency: "EUR", timeZone: "Europe/Rome", formality: "warm" },
  { id: "es", country: "Spain", region: "Europe", defaultLanguage: "Spanish (Spain)", locale: "es-ES", currency: "EUR", timeZone: "Europe/Madrid", formality: "warm" },
  { id: "pt", country: "Portugal", region: "Europe", defaultLanguage: "Portuguese (Portugal)", locale: "pt-PT", currency: "EUR", timeZone: "Europe/Lisbon", formality: "formal" },
  { id: "nl", country: "Netherlands", region: "Europe", defaultLanguage: "Dutch", locale: "nl-NL", currency: "EUR", timeZone: "Europe/Amsterdam", formality: "neutral" },
  { id: "be", country: "Belgium", region: "Europe", defaultLanguage: "Dutch or French", locale: "nl-BE", currency: "EUR", timeZone: "Europe/Brussels", formality: "formal" },
  { id: "ch", country: "Switzerland", region: "Europe", defaultLanguage: "German, French or Italian", locale: "de-CH", currency: "CHF", timeZone: "Europe/Zurich", formality: "formal" },
  { id: "se", country: "Sweden", region: "Europe", defaultLanguage: "Swedish", locale: "sv-SE", currency: "SEK", timeZone: "Europe/Stockholm", formality: "neutral" },
  { id: "no", country: "Norway", region: "Europe", defaultLanguage: "Norwegian", locale: "nb-NO", currency: "NOK", timeZone: "Europe/Oslo", formality: "neutral" },
  { id: "dk", country: "Denmark", region: "Europe", defaultLanguage: "Danish", locale: "da-DK", currency: "DKK", timeZone: "Europe/Copenhagen", formality: "neutral" },
  { id: "ie", country: "Ireland", region: "Europe", defaultLanguage: "English (Ireland)", locale: "en-IE", currency: "EUR", timeZone: "Europe/Dublin", formality: "warm" },
  { id: "pl", country: "Poland", region: "Europe", defaultLanguage: "Polish", locale: "pl-PL", currency: "PLN", timeZone: "Europe/Warsaw", formality: "formal" },
  { id: "at", country: "Austria", region: "Europe", defaultLanguage: "German", locale: "de-AT", currency: "EUR", timeZone: "Europe/Vienna", formality: "formal" },
  { id: "jp", country: "Japan", region: "Asia", defaultLanguage: "Japanese", locale: "ja-JP", currency: "JPY", timeZone: "Asia/Tokyo", formality: "formal" },
  { id: "kr", country: "South Korea", region: "Asia", defaultLanguage: "Korean", locale: "ko-KR", currency: "KRW", timeZone: "Asia/Seoul", formality: "formal" },
  { id: "cn", country: "China", region: "Asia", defaultLanguage: "Simplified Chinese", locale: "zh-CN", currency: "CNY", timeZone: "Asia/Shanghai", formality: "formal" },
  { id: "sg", country: "Singapore", region: "Asia", defaultLanguage: "English (Singapore)", locale: "en-SG", currency: "SGD", timeZone: "Asia/Singapore", formality: "formal" },
  { id: "my", country: "Malaysia", region: "Asia", defaultLanguage: "Malay or English", locale: "ms-MY", currency: "MYR", timeZone: "Asia/Kuala_Lumpur", formality: "warm" },
  { id: "ae", country: "United Arab Emirates", region: "Middle East", defaultLanguage: "Arabic or English", locale: "ar-AE", currency: "AED", timeZone: "Asia/Dubai", formality: "formal" },
  { id: "sa", country: "Saudi Arabia", region: "Middle East", defaultLanguage: "Arabic", locale: "ar-SA", currency: "SAR", timeZone: "Asia/Riyadh", formality: "formal" },
  { id: "qa", country: "Qatar", region: "Middle East", defaultLanguage: "Arabic or English", locale: "ar-QA", currency: "QAR", timeZone: "Asia/Qatar", formality: "formal" },
  { id: "kw", country: "Kuwait", region: "Middle East", defaultLanguage: "Arabic or English", locale: "ar-KW", currency: "KWD", timeZone: "Asia/Kuwait", formality: "formal" },
  { id: "in", country: "India", region: "South Asia", defaultLanguage: "English or Hindi", locale: "en-IN", currency: "INR", timeZone: "Asia/Kolkata", formality: "warm" },
  { id: "bd", country: "Bangladesh", region: "South Asia", defaultLanguage: "Bengali", locale: "bn-BD", currency: "BDT", timeZone: "Asia/Dhaka", formality: "warm" },
  { id: "pk", country: "Pakistan", region: "South Asia", defaultLanguage: "Urdu or English", locale: "ur-PK", currency: "PKR", timeZone: "Asia/Karachi", formality: "formal" },
  { id: "lk", country: "Sri Lanka", region: "South Asia", defaultLanguage: "Sinhala, Tamil or English", locale: "en-LK", currency: "LKR", timeZone: "Asia/Colombo", formality: "warm" },
  { id: "za", country: "South Africa", region: "Africa", defaultLanguage: "English", locale: "en-ZA", currency: "ZAR", timeZone: "Africa/Johannesburg", formality: "neutral" },
  { id: "ng", country: "Nigeria", region: "Africa", defaultLanguage: "English", locale: "en-NG", currency: "NGN", timeZone: "Africa/Lagos", formality: "warm" },
  { id: "ke", country: "Kenya", region: "Africa", defaultLanguage: "English or Swahili", locale: "en-KE", currency: "KES", timeZone: "Africa/Nairobi", formality: "warm" },
  { id: "br", country: "Brazil", region: "Latin America", defaultLanguage: "Portuguese (Brazil)", locale: "pt-BR", currency: "BRL", timeZone: "America/Sao_Paulo", formality: "warm" },
  { id: "mx", country: "Mexico", region: "Latin America", defaultLanguage: "Spanish (Mexico)", locale: "es-MX", currency: "MXN", timeZone: "America/Mexico_City", formality: "warm" },
  { id: "tr", country: "Türkiye", region: "Europe/Asia", defaultLanguage: "Turkish", locale: "tr-TR", currency: "TRY", timeZone: "Europe/Istanbul", formality: "formal" },
  { id: "id", country: "Indonesia", region: "Asia", defaultLanguage: "Indonesian", locale: "id-ID", currency: "IDR", timeZone: "Asia/Jakarta", formality: "warm" },
  { id: "ph", country: "Philippines", region: "Asia", defaultLanguage: "English or Filipino", locale: "en-PH", currency: "PHP", timeZone: "Asia/Manila", formality: "warm" },
];

export const BUSINESS_INDUSTRIES = ["Education", "Technology", "Healthcare", "Professional services", "Retail", "Hospitality", "Finance", "Real estate", "Nonprofit", "Other"] as const;
export const BUSINESS_STAGES = ["New idea", "Early business", "Growing business", "Established organization", "Enterprise team"] as const;
export const LEAD_GOALS = ["Introduction", "Partnership", "Sales conversation", "Service inquiry", "Event invitation", "Recruitment"] as const;
