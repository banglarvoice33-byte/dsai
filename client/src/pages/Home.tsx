/*
 * DSAI design reminder: Bengali-first editorial layouts, a distinctive signal palette,
 * calm trust-building interactions, and no claims of crypto mining, guaranteed income,
 * unlimited generation, or professional replacement.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  CircleHelp,
  FileText,
  Globe2,
  Headphones,
  LockKeyhole,
  Mail,
  Menu,
  Moon,
  Sun,
  PenLine,
  Play,
  ShieldCheck,
  Search,
  Sparkles,
  Twitter,
  WalletCards,
  X,
  Youtube,
} from "lucide-react";

const emblem = "/icons/dsai-mark.svg";

const socialItems = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "LinkedIn", Icon: Linkedin },
  { label: "YouTube", Icon: Youtube },
  { label: "X", Icon: Twitter },
];

const homepageCopy = {
  bn: {
    nav: ["পথচিত্র", "কাজের ক্ষেত্র", "শিখুন", "ডেভেলপার", "ওয়ার্কস্পেস", "স্কলারশিপ", "প্ল্যাটফর্ম", "পদ্ধতি", "প্রমাণ", "গোপনীয়তা", "চেঞ্জলগ", "বিশ্বাস", "অধিকার ও নীতি", "Client response agent"],
    heroEyebrow: "Acce���q�^