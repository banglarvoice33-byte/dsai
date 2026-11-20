export type GovernmentServiceCategory = "jobs" | "tender" | "business" | "land" | "transport" | "pension" | "education" | "office" | "tax" | "legal" | "healthcare";

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
  aliases?: string[];
  guidanceUrl?: string;
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
    officialUrl: "https://bidaquickserv.org/",
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
    officialUrl: "https://portal.nothi.gov.bd/index.html",
    workflow: "document",
    preparation: ["নথির বিষয়, প্রাপক ও reference number লিখুন", "সংযুক্তির তালিকা ও তারিখ মিলিয়ে নিন", "দাপ্তরিক অনুমোদন ও স্বাক্ষরের নিয়ম অনুসরণ করুন"],
    boundary: "ব্যক্তিগত D-Nothi account বা সরকারি দপ্তরের অনুমতি ছাড়া DSAI কোনো নথি দাখিল করতে পারে না।"
  },

  {
    id: "boesl",
    title: "বিদেশে সরকারি চাকরি ও BOESL আবেদন",
    agency: "Bangladesh Overseas Employment and Services Ltd. (BOESL)",
    category: "jobs",
    categoryLabel: "বিদেশে চাকরি",
    description: "সরকারি overseas recruitment notice, BRMS registration, job application ও আবেদনের status দেখুন।",
    officialUrl: "https://brms.boesl.gov.bd/",
    workflow: "jobs",
    preparation: ["শুধু BOESL-এর সর্বশেষ নিয়োগ বিজ্ঞপ্তি ও job offer যাচাই করুন", "পাসপোর্ট, পরিচয়, দক্ষতা ও অভিজ্ঞতার নথি প্রস্তুত রাখুন", "কোনো দালালকে টাকা দেওয়ার আগে BOESL-এর official notice ও service charge মিলিয়ে নিন"],
    boundary: "BRMS-এ account, application ও status নিজে সম্পন্ন করবেন। DSAI চাকরি, ভিসা বা বিদেশযাত্রার নিশ্চয়তা দেয় না।"
  },
  {
    id: "ibas",
    title: "iBAS++ সরকারি আর্থিক ও পেনশন সেবা",
    agency: "অর্থ বিভাগ, অর্থ মন্ত্রণালয়",
    category: "office",
    categoryLabel: "দাপ্তরিক",
    description: "সরকারি বেতন, পেনশন EFT, A-Challan, challan verification ও অন্যান্য iBAS++ e-Service-এর সরকারি প্রবেশপথ।",
    officialUrl: "https://ibas.finance.gov.bd/portal",
    workflow: "government",
    preparation: ["আপনি কর্মচারী, পেনশনভোগী নাকি নাগরিক—প্রযোজ্য সেবা নির্ধারণ করুন", "নিজের দপ্তর বা কর্তৃপক্ষের দেওয়া account ও reference তথ্য প্রস্তুত রাখুন", "চালান বা পেনশন সংক্রান্ত তথ্য সরকারি পোর্টালে মিলিয়ে নিন"],
    boundary: "ব্যক্তিগত সরকারি account, বেতন, পেনশন বা চালান পরিবর্তন/অনুমোদন DSAI করতে পারে না।"
  },
  {
    id: "police-clearance",
    title: "অনলাইন পুলিশ ক্লিয়ারেন্স",
    agency: "বাংলাদেশ পুলিশ",
    category: "office",
    categoryLabel: "নাগরিক সেবা",
    description: "পুলিশ ক্লিয়ারেন্স সার্টিফিকেটের online registration, application ও status-এর সরকারি পোর্টাল।",
    officialUrl: "https://pcc.police.gov.bd/",
    workflow: "government",
    preparation: ["পাসপোর্টের মেয়াদ ও ঠিকানা-সংক্রান্ত শর্ত পড়ুন", "পাসপোর্ট, NID/জন্মনিবন্ধন ও ঠিকানার প্রমাণ প্রস্তুত রাখুন", "চালান/ফি ও আবেদন-সংক্রান্ত সর্বশেষ নির্দেশনা official portal-এ যাচাই করুন"],
    boundary: "পরিচয় যাচাই, আবেদন, ফি ও পুলিশ verification বাংলাদেশ পুলিশের ব্যবস্থাতেই হবে। DSAI clearance certificate ইস্যু করে না।"
  },
  {
    id: "etin",
    title: "e-TIN নিবন্ধন ও TIN সার্টিফিকেট",
    agency: "জাতীয় রাজস্ব বোর্ড (NBR)",
    category: "tax",
    categoryLabel: "কর",
    description: "ব্যক্তি বা প্রতিষ্ঠানের e-TIN নিবন্ধন, TIN তথ্য ও সার্টিফিকেট ব্যবস্থাপনার সরকারি পোর্টাল।",
    officialUrl: "https://secure.incometax.gov.bd/TINHome",
    workflow: "government",
    aliases: ["tin", "e-tin", "etin", "tin certificate", "টিন", "ই-টিন", "টিন সার্টিফিকেট", "টিন নিবন্ধন", "টিন সনদ"],
    guidanceUrl: "https://nbr.gov.bd/faq/income-tax-faq/eng",
    preparation: ["প্রাপ্তবয়স্ক ব্যক্তির ক্ষেত্রে NID অনুযায়ী নাম, বৈধ NID নম্বর ও জন্মতারিখ প্রস্তুত রাখুন", "অপ্রাপ্তবয়স্কের ক্ষেত্রে অভিভাবকের নাম, অভিভাবকের TIN এবং আবেদনকারীর পাসপোর্ট-সাইজ ছবি লাগতে পারে", "বিদেশি বা NID-বিহীন বাংলাদেশির ক্ষেত্রে পাসপোর্ট নম্বর ও ইস্যুর তারিখ, ভিসা নম্বর ও ইস্যুর তারিখ এবং ছবি লাগতে পারে", "কোম্পানির ক্ষেত্রে নিবন্ধিত নাম, নিবন্ধন নম্বর ও নিবন্ধনের তারিখ প্রস্তুত রাখুন; ফার্মের ক্ষেত্রে নিবন্ধনের ধরন অনুযায়ী ফার্ম বা অংশীদারদের তথ্য লাগতে পারে", "সরকারি পোর্টালে নিজের করদাতা-শ্রেণি নির্বাচন করে সর্বশেষ নির্দেশনা অনুসরণ করুন; তথ্য জমা দেওয়ার আগে নিজে মিলিয়ে নিন"],
    boundary: "DSAI সরকারি NBR পোর্টালের বিকল্প নয়। পরিচয় যাচাই, OTP, অ্যাকাউন্ট, আবেদন জমা এবং চূড়ান্ত সার্টিফিকেট ইস্যু NBR পোর্টালেই হবে। DSAI কেবল প্রস্তুতি ও নির্দেশনায় সহায়তা করে।"
  },
  {
    id: "etax",
    title: "e-Tax ও অনলাইন আয়কর রিটার্ন",
    agency: "জাতীয় রাজস্ব বোর্ড (NBR)",
    category: "tax",
    categoryLabel: "কর",
    description: "e-TIN-ভিত্তিক e-Return registration, return preparation, tax payment ও submission-এর সরকারি পোর্টাল।",
    officialUrl: "https://etaxnbr.gov.bd/",
    workflow: "government",
    preparation: ["TIN, আয়, বিনিয়োগ, সম্পদ ও কর-সংক্রান্ত প্রমাণপত্র গুছিয়ে নিন", "প্রযোজ্য করবর্ষ ও রিটার্নের ধরন যাচাই করুন", "চূড়ান্ত হিসাব ও payment-এর আগে NBR নির্দেশনা বা কর-পেশাজীবীর পরামর্শ নিন"],
    boundary: "DSAI খসড়া ও checklist-এ সহায়তা করতে পারে; কর নির্ধারণ, রিটার্ন জমা বা অর্থ প্রদান করে না।"
  },
  {
    id: "e-family-court",
    title: "e-Family Court ও বিচারিক e-Services",
    agency: "বাংলাদেশ বিচার বিভাগ",
    category: "legal",
    categoryLabel: "আদালত",
    description: "e-Family Court, e-Causelist, Case Management System ও বিচারিক e-Service-এ যাওয়ার সরকারি প্রবেশপথ।",
    officialUrl: "https://efamilycourt.judiciary.gov.bd/login",
    workflow: "government",
    preparation: ["মামলার নম্বর, আদালত, পক্ষের নাম ও তারিখ আলাদা করে লিখুন", "আবেদন, আদেশ ও সংযুক্ত নথি তারিখ অনুযায়ী সাজান", "প্রযোজ্য আদালত ও সেবার availability সরকারি বিচার বিভাগীয় পোর্টালে যাচাই করুন"],
    boundary: "মামলা দায়ের, শুনানি, আইনি পরামর্শ ও বিচারিক সিদ্ধান্ত আদালত/আইনজীবীর মাধ্যমে হবে। DSAI রায় লিখে বা মামলা পরিচালনা করে না।"
  },
  {
    id: "bmu-outpatient",
    title: "হাসপাতাল OPD টিকিট ও অ্যাপয়েন্টমেন্ট",
    agency: "Bangladesh Medical University (BMU)",
    category: "healthcare",
    categoryLabel: "স্বাস্থ্য",
    description: "BMU-এর official website থেকে বহির্বিভাগের online ticket ও appointment নির্দেশনা খুঁজুন।",
    officialUrl: "https://bmu.ac.bd/",
    workflow: "government",
    preparation: ["বিভাগ, চিকিৎসক ও appointment-এর সময় official website-এ যাচাই করুন", "আগের prescription ও প্রয়োজনীয় medical document প্রস্তুত রাখুন", "ticket payment ও print নির্দেশনা হাসপাতালের official system-এ অনুসরণ করুন"],
    boundary: "DSAI চিকিৎসা নির্ণয়, চিকিৎসকের appointment নিশ্চিত বা payment গ্রহণ করে না। জরুরি অবস্থায় সরাসরি জরুরি চিকিৎসা নিন।"
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


const normalizeServiceQuery = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/[–—]/g, "-").replace(/[^\w\u0980-\u09FF-]+/g, " ").trim().replace(/\s+/g, " ");

export function findGovernmentServiceForPrompt(prompt: string): GovernmentService | undefined {
  const query = normalizeServiceQuery(prompt);
  if (!query) return undefined;
  return governmentServices.find(service =>
    (service.aliases ?? []).some(alias => {
      const normalizedAlias = normalizeServiceQuery(alias);
      return normalizedAlias.length >= 2 && (` ${query} `).includes(` ${normalizedAlias} `);
    })
  );
}

export function buildGovernmentServiceGuidance(service: GovernmentService): string {
  const steps = service.preparation.map((item, index) => `${index + 1}. ${item}`).join("\n");
  return [
    `আপনার অনুরোধ অনুযায়ী **${service.title}** সেবাটি প্রাসঙ্গিক।`,
    `দায়িত্বপ্রাপ্ত সংস্থা: ${service.agency}`,
    `সরকারি পোর্টাল: ${service.officialUrl}`,
    ...(service.guidanceUrl ? [`NBR-এর সরকারি নির্দেশনা: ${service.guidanceUrl}`] : []),
    "শুরু করার আগে:",
    steps,
    `DSAI-এর সীমা: ${service.boundary}`,
    "সরকারি পোর্টালে দেখানো সর্বশেষ নিয়ম, ফি ও যোগ্যতা অনুসরণ করুন। কোনো OTP বা পাসওয়ার্ড এখানে শেয়ার করবেন না।"
  ].join("\n\n");
}
