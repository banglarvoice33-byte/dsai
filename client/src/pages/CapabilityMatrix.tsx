import SimpleInfoPage from "@/components/SimpleInfoPage";
export default function CapabilityMatrix() {
  return <SimpleInfoPage
    eyebrow="আপনার কাজ, আপনার ভাষায়"
    title="কাজ এগিয়ে নিতে যা যা পাবেন।"
    description="প্রয়োজন অনুযায়ী একটি সুবিধা বেছে নিন। গুরুত্বপূর্ণ ফলাফল নিজে যাচাই করে ব্যবহার করুন।"
    cards={[
      { title: "প্রশ্ন ও উত্তর", body: "বাংলায় প্রশ্ন করুন, ব্যাখ্যা নিন, লেখা সংক্ষিপ্ত করুন বা খসড়া তৈরি করুন।", href: "/workspace" },
      { title: "এআই সেবা খুঁজুন", body: "লেখা, ছবি, ভিডিও, কণ্ঠ, কোড ও গবেষণার জন্য সেবা খুঁজে নিন।", href: "/ai-hub" },
      { title: "ছবি তৈরি", body: "আপনার ধারণা সহজ ভাষায় লিখে ছবি তৈরির সুবিধা ব্যবহার করুন।", href: "/creative-studio" },
      { title: "তথ্য ও নথি বুঝুন", body: "ফর্ম বা নির্দেশনা বুঝতে সহায়তা নিন এবং প্রয়োজনীয় বিষয় গুছিয়ে নিন।", href: "/learn" },
      { title: "কাজের পরিকল্পনা", body: "কাজের ধাপ, করণীয় তালিকা এবং পরবর্তী পদক্ষেপের খসড়া তৈরি করুন।", href: "/workspace" },
    ]}
  />;
}
