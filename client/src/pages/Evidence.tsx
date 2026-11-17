import SimpleInfoPage from "@/components/SimpleInfoPage";
export default function Evidence() {
  return <SimpleInfoPage
    eyebrow="আপনার কাজে সহায়তা"
    title="একটি সহজ জায়গায় প্রয়োজনীয় সুবিধা।"
    description="আপনার কাজের ধরন অনুযায়ী একটি সুবিধা বেছে নিন। কোনো সুবিধা সাময়িকভাবে পাওয়া না গেলে পর্দায় জানানো হবে।"
    cards={[
      { title: "বাংলা এআই সহকারী", body: "প্রশ্নের উত্তর, ব্যাখ্যা, সারাংশ এবং লেখার খসড়া তৈরি করতে সাহায্য নিন।", href: "/workspace" },
      { title: "এআই সেবার তালিকা", body: "আপনার প্রয়োজন অনুযায়ী বিভিন্ন এআই ওয়েবসাইট ও টুল খুঁজে নিন।", href: "/ai-hub" },
      { title: "ছবি তৈরি", body: "নিজের ভাবনা লিখে ছবি তৈরির সুবিধা ব্যবহার করে দেখুন।", href: "/creative-studio" },
      { title: "কাজের প্রস্তুতি", body: "জটিল বিষয় বুঝুন, তথ্য গুছিয়ে নিন এবং পরবর্তী কাজের খসড়া তৈরি করুন।", href: "/capabilities" },
    ]}
  />;
}
