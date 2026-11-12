import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, ChevronRight, Globe2, HelpCircle, LockKeyhole, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";

type HelpItem = { title: string; answer: string; keywords: string; href?: string; label: string };

const helpItems: HelpItem[] = [
  { title: "DSAI কীভাবে ব্যবহার করব?", answer: "প্রয়োজনের পথ বেছে নিন, প্রশ্ন বা brief লিখুন, তারপর draft ও next step review করুন। UAA এবং Creative queue-তে human review ছাড়া high-risk action submit হয় না।", keywords: "how use dsai ব্যবহার শুরু workspace", href: "/workspace", label: "ওয়ার্কস্পেস" },
  { title: "API key কোথায় দেব?", answer: "API key browser, chat, public form বা Git repository-তে দেবেন না। Provider connector চালু হলে operator server-side secret manager-এ রাখবেন।", keywords: "api key secret নিরাপত্তা provider", href: "/learn", label: "API safety" },
  { title: "৩ সেকেন্ডের agent কি live?", answer: "না। `/platform`-এ দেখানোটি configured provider-এর best-effort first-response target; calendar booking, messaging ও CRM adapter এখনো credentials, consent, webhook এবং staging gate-এর অপেক���q�^