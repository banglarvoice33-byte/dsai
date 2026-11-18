import SimpleInfoPage from "@/components/SimpleInfoPage";
export default function Method() {
  return <SimpleInfoPage
    eyebrow="সহজ চারটি ধাপ"
    title="ভাবনা থেকে কাজের পরবর্তী ধাপ।"
    description="আপনার প্রয়োজন বলুন, তথ্য গুছিয়ে নিন, খসড়া পর্যালোচনা করুন এবং নিজের সিদ্ধান্তে এগিয়ে যান।"
    cards={[
      { title: "আপনার প্রয়োজন বলুন", body: "কী করতে চান তা সহজ ভাষায় লিখুন এবং প্রয়োজনীয় প্রেক্ষাপট যোগ করুন।", href: "/workspace" },
      { title: "তথ্য বুঝে নিন", body: "প্রশ্ন করুন, ব্যাখ্যা নিন এবং দরকারি তথ্য আলাদা করুন।", href: "/workspace" },
      { title: "খসড়া তৈরি করুন", body: "উত্তর, করণীয় তালিকা বা পরবর্তী কাজের খসড়া তৈরি করে সম্পাদনা করুন।", href: "/workspace" },
      { title: "পর্যালোচনা করে এগোন", body: "গুরুত্বপূর্ণ তথ্য যাচাই করে নিজের সিদ্ধান্তে পরবর্তী পদক্ষেপ নিন।", href: "/governance" },
    ]}
  />;
}
