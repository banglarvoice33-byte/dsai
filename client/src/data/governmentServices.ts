export type GovernmentServiceCategory = "jobs" | "tender" | "business" | "land" | "transport" | "pension" | "education" | "office";

export type GovernmentService = {
  id: string;
  title: string;
  agency: string;
  category: GovernmentServiceCategory;
  categoryLabel: string;
  description: string;
  officialUrl: string;
  workflow: "government" | "jobs" | "document";
  preparation: string[];
  boundary: string;
};

/**
 * Curated official Bangladesh portals. These links are a navigation directory,
 * not an assertion that DSAI is integrated with or authorized to submit to them.
 * Recheck each portal's notices and requirements before acting.
 */
export const governmentServices: GovernmentService[] = [
  {
    id: "bpsc",
    title: "সরকারি চাকরি ও BPSC আবেদন",
    agency: "বাংলাদেশ সরকারি কর্ম কমিশন / Teletalk",
    category: "jobs",
    categoryLabel: "চাকরি",
    description: "BPSC-এর বিজ্ঞপ্তি, আবেদন, ফি ও প্রবেশপত্রের জন্য সরকারি আবেদন পোর্টাল।",
    officialUrl: "https://bpsc.teletalk.com.bd/",
    workflow: "jobs",
    preparation: ["সর্বশেষ নিয়োগ বিজ্ঞপ্তি ও পদের যোগ্যতা মিলিয়ে নিন", "শিক্ষাগত সনদ, NID, ছবি ও স্বাক্ষর প্রস্তুত রাখুন", "আবেদনের শেষ সময় ও ফি প্রদানের নির্দেশনা নোট করুন"],
    boundary: "আবেদন ও ফি Teletalk/BPSC পোর্টালেই সম্পন্ন হবে।"
  },
  {
    id: "bcc-recruitment",
    title: "সরকারি সংস্থার e-Recruitment",
    agency: "বাংলাদেশ কম্পিউটার কাউন্সিল (BCC)",
    category: "jobs",
    categoryLabel: "চাকরি",
    description: "BCC ও সংশ্লিষ্ট সংস্থার অনলাইন নিয়োগ বিজ্ঞপ্তি ও আবেদন।",
    officialUrl: "https://erecruitment.bcc.gov.bd/",
    workflow: "jobs",
    preparation: ["বিজ্ঞপ্তির পদ, গ্রেড ও যোগ্যতা যাচাই করুন", "শিক্ষাগত ও অভিজ্ঞতার প্রমাণপত্র প্রস্তুত রাখুন", "আবেদন ও পরীক্ষার নোটিশের তারিখ সংরক্ষণ করুন"],
    boundary: "এটি সব সরকারি চাকরির একক পোর্টাল নয়; বিজ্ঞপ্তিতে উল্লিখিত পোর্টাল অনুসরণ করুন।"
  },
  {
    id: "egp",
    title: "সরকারি টেন্ডার ও e-GP",
    agency: "Bangladesh Public Procurement Authority (BPPA)",
    category: "tender",
    categoryLabel: "টেন্ডার",
    description: "সরকারি e-Tender, Annual Procurement Plan, awarded contract ও procurement notice খুঁজুন।",
    officialUrl: "https://www.eprocure.gov.bd/",
    workflow: "government",
    preparation: ["Tender ID, Procuring Entity ও deadline নোট করুন", "যোগ্যতা, অভিজ্ঞতা, turnover, TIN/VAT ও লাইসেন্সের শর্ত আলাদা করুন", "Tender document, security ও submission instructions যাচাই করুন"],
    boundary: "দরপত্র জমা, tender security ও চূড়ান্ত submission কেবল e-GP-তে করবেন। DSAI কোনো bid জমা বা অনুমোদন করে না।"
  },
  {
    id: "rjsc",
    title: "কোম্পানি নিবন্ধন ও eBRS",
    agency: "Registrar of Joint Stock Companies and Firms (RJSC)",
    category: "business",
    categoryLabel: "ব্যবসা",
    description: "নামের ছাড়পত্র, কোম্পানি নিবন্ধন, আবেদন-অবস্থা ও ফি-সংক্রান্ত সরকারি সেবা।",
    officialUrl: "https://ebrs.rjsc.gov.bd/public/home",
    workflow: "government",
    preparation: ["প্রতিষ্ঠানের ধরন ও প্রস্তাবিত নাম ঠিক করুন", "পরিচালক/শেয়ারহোল্ডারদের পরিচয় ও সম্মতির নথি প্রস্তুত করুন", "MoA/AoA, ঠিকানা, মূলধন ও ফি-তালিকা যাচাই করুন"],
    boundary: "eBRS-এর সর্বশেষ notice ও eligibility দেখে তারপর আবেদন বা payment করুন।"
  },
  {
    id: "banglabiz",
    title: "BanglaBiz — ব্যবসার অনুমোদন",
    agency: "Invest Bangladesh",
    category: "business",
    categoryLabel: "ব্যবসা",
    description: "ব্যবসা শুরু, প্রয়োজনীয় অনুমোদন খোঁজা এবং বিভিন্ন সংস্থার সেবায় যাওয়ার সমন্বিত গেটওয়ে।",
    officialUrl: "https://banglabiz.gov.bd/",
    workflow: "government",
    preparation: ["ব্যবসার ধরন, অবস্থান ও কার্যক্রম নির্ধারণ করুন", "প্রযোজ্য লাইসেন্স ও অনুমোদনের তালিকা বের করুন", "প্রতিটি সংস্থার নিজস্ব নথি ও ফি যাচাই করুন"],
    boundary: "প্রতিটি অনুমোদনের চূড়ান্ত আবেদন সংশ্লিষ্ট সরকারি সিস্টেমে হবে।"
  },
  {
    id: "invest-bangladesh",
    title: "বিনিয়োগ ও OSS সেবা",
    agency: "Invest Bangladesh",
    category: "business",
    categoryLabel: "ব্যবসা",
    description: "বিনিয়োগকারী তথ্য, সেবা নির্দেশনা ও সরকারি One-Stop Service সম্পর্কে জানুন।",
    officialUrl: "https://investbangladesh.gov.bd/",
    workflow: "government",
    preparation: ["বিনিয়োগ প্রকল্প ও খাতের বিবরণ লিখুন", "প্রতিষ্ঠানের নিবন্ধন ও আর্থিক নথি প্রস্তুত করুন", "প্রযোজ্য অনুমোদন ও সময়সীমা সংশ্লিষ্ট OSS-এ যাচাই করুন"],
    boundary: "DSAI কেবল প্রস্তুতি ও নথি সংগঠনে সহায়তা করবে; সরকারি অনুমোদন দেবে না।"
  },
  {
    id: "land-mutation",
    title: "ভূমি নামজারি / e-Mutation",
    agency: "ভূমি মন্ত্রণালয়",
    category: "land",
    categoryLabel: "ভূমি",
    description: "নামজারি আবেদন, আবেদনের অবস্থা ও ভূমি-সংক্রান্ত অনলাইন নির্দেশনা।",
    officialUrl: "https://mutation.land.gov.bd/",
    workflow: "government",
    preparation: ["দলিল, খতিয়ান, দাগ ও জমির পরিমাণ একত্র করুন", "মালিকের নাম ও পরিচয়পত্রের তথ্য মিলিয়ে নিন", "অমিল বা বিরোধ থাকলে আইনজীবী/ভূমি অফিসে যাচাই করুন"],
    boundary: "AI নথির অমিল দেখাতে পারে, কিন্তু মালিকানা নির্ধারণ বা আইনি সিদ্ধান্ত দিতে পারে না।"
  },
  {
    id: "brta",
    title: "ড্রাইভিং লাইসেন্স ও BRTA সেবা",
    agency: "বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (BRTA)",
    category: "transport",
    categoryLabel: "পরিবহন",
    description: "লার্নার, স্মার্ট ড্রাইভিং লাইসেন্স, নবায়ন, ফি ক্যালকুলেটর ও যাচাই।",
    officialUrl: "https://bsp.brta.gov.bd/?lan=en",
    workflow: "government",
    preparation: ["লাইসেন্সের ধরন ও মেয়াদ যাচাই করুন", "NID, ছবি, মেডিকেল/প্রশিক্ষণ নথি প্রস্তুত রাখুন", "ফি ও appointment নির্দেশনা BRTA পোর্টালে মিলিয়ে নিন"],
    boundary: "আবেদন, বায়োমেট্রিক ও payment BRTA-র নিজস্ব ব্যবস্থায় হবে।"
  },
  {
    id: "pension",
    title: "সর্বজনীন পেনশন",
    agency: "জাতীয় পেনশন কর্তৃপক্ষ",
    category: "pension",
    categoryLabel: "পেনশন",
    description: "প্রবাস, প্রগতি, সুরক্ষা ও সমতা স্কিমের সরকারি তথ্য ও নিবন্ধন।",
    officialUrl: "https://upension.gov.bd/",
    workflow: "government",
    preparation: ["আপনার জন্য প্রযোজ্য স্কিম ও যোগ্যতা পড়ুন", "পরিচয়, ব্যাংক/MFS ও যোগাযোগের তথ্য প্রস্তুত করুন", "চাঁদা ও শর্ত সরাসরি সরকারি পোর্টালে যাচাই করুন"],
    boundary: "DSAI আর্থিক পরামর্শ বা সরকারি নিবন্ধন/চাঁদা গ্রহণ করে না।"
  },
  {
    id: "xi-admission",
    title: "একাদশ শ্রেণিতে ভর্তি",
    agency: "শিক্ষা মন্ত্রণালয় / শিক্ষা বোর্ডসমূহ",
    category: "education",
    categoryLabel: "শিক্ষা",
    description: "একাদশ শ্রেণির কেন্দ্রীয় অনলাইন আবেদন, পছন্দক্রম, ফলাফল ও migration notice।",
    officialUrl: "https://xiclassadmission.gov.bd/",
    workflow: "government",
    preparation: ["SSC/সমমানের ফল ও বোর্ডের তথ্য প্রস্তুত রাখুন", "কলেজের পছন্দক্রম ও আসন/যোগ্যতা যাচাই করুন", "চলতি ধাপের deadline ও confirmation fee নোট করুন"],
    boundary: "আবেদন, পছন্দক্রম ও confirmation fee সরকারি ভর্তি পোর্টালেই সম্পন্ন হবে।"
  },
  {
    id: "dnothi",
    title: "D-Nothi / দাপ্তরিক নথি",
    agency: "সরকারি দপ্তরসমূহ",
    category: "office",
    categoryLabel: "দাপ্তরিক",
    description: "সরকারি দাপ্তরিক নথি ও e-service portal-এ যাওয়ার সরকারি প্রবেশপথ।",
    officialUrl: "https://nothi.gov.bd/",
    workflow: "document",
    preparation: ["নথির বিষয়, প্রাপক ও reference number লিখুন", "সংযুক্তির তালিকা ও তারিখ মিলিয়ে নিন", "দাপ্তরিক অনুমোদন ও স্বাক্ষরের নিয়ম অনুসরণ করুন"],
    boundary: "ব্যক্তিগত D-Nothi account বা সরকারি দপ্তরের অনুমতি ছাড়া DSAI কোনো নথি দাখিল করতে পারে না।"
  },
  {
    id: "national-portal",
    title: "জাতীয় তথ্য বাতায়ন — সকল e-Services",
    agency: "বাংলাদেশ জাতীয় তথ্য বাতায়ন",
    category: "office",
    categoryLabel: "দাপ্তরিক",
    description: "সরকারি দপ্তর ও খাতভিত্তিক নাগরিক e-Service খুঁজে পাওয়ার সরকারি directory।",
    officialUrl: "https://bangladesh.gov.bd/views/all-eservices-in-bangladesh",
    workflow: "government",
    preparation: ["সেবার নাম ও দায়িত্বপ্রাপ্ত দপ্তর খুঁজুন", "সংশ্লিষ্ট দপ্তরের অফিসিয়াল domain নিশ্চিত করুন", "সর্বশেষ notice, ফি ও প্রয়োজনীয় নথি যাচাই করুন"],
    boundary: "অচেনা third-party link বা অননুমোদিত payment page ব্যবহার করবেন না।"
  }
];
