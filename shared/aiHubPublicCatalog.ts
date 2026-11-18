/** Public, UI-safe AI directory. Internal integration and eligibility metadata intentionally live elsewhere. */
export type AIHubCategoryId = "llm-chat" | "agents" | "image-design" | "video" | "voice-speech" | "music-audio" | "website-builders" | "hosting-deployment" | "coding" | "research-search" | "automation" | "document-ocr" | "translation" | "vector-knowledge";

export interface AIHubPublicProvider {
  id: string;
  name: string;
  purpose: string;
  officialUrl?: string;
}

export interface AIHubPublicCategory {
  id: AIHubCategoryId;
  name: string;
  description: string;
  providers: AIHubPublicProvider[];
}

export const DSAI_AI_HUB_CATEGORIES: AIHubPublicCategory[] = [
  {
    "id": "llm-chat",
    "name": "কথোপকথন ও লেখা",
    "description": "বাংলায় কথা বলা, লেখা, পড়া, বিশ্লেষণ ও প্রশ্নের উত্তর।",
    "providers": [
      {
        "id": "chatgpt",
        "name": "ChatGPT (OpenAI)",
        "purpose": "সাধারণ কথোপকথন, বাংলা লেখা, ফাইল বিশ্লেষণ, ওয়েব সার্চ, ছবি ও ভয়েস",
        "officialUrl": "https://chatgpt.com/"
      },
      {
        "id": "openai-platform",
        "name": "OpenAI Platform",
        "purpose": "নিজের কাজে উন্নত কৃত্রিম বুদ্ধিমত্তার মডেল ব্যবহার",
        "officialUrl": "https://platform.openai.com/"
      },
      {
        "id": "claude",
        "name": "Claude (Anthropic)",
        "purpose": "দীর্ঘ লেখা বোঝা, বিশ্লেষণ, কোড লেখা ও নথি নিয়ে কাজ",
        "officialUrl": "https://claude.ai/"
      },
      {
        "id": "kimi",
        "name": "Kimi (Moonshot AI)",
        "purpose": "দীর্ঘ নথি, পিডিএফ, স্লাইড ও গবেষণায় সহায়তা",
        "officialUrl": "https://www.kimi.com/"
      },
      {
        "id": "deepseek",
        "name": "DeepSeek",
        "purpose": "জটিল প্রশ্নের উত্তর, কোড লেখা, গবেষণা ও সাধারণ কথোপকথন",
        "officialUrl": "https://chat.deepseek.com/"
      },
      {
        "id": "meta-ai",
        "name": "Meta AI",
        "purpose": "দৈনন্দিন প্রশ্নের উত্তর, ছবি বুঝে সহায়তা ও সামাজিক যোগাযোগে সাহায্য",
        "officialUrl": "https://www.meta.ai/"
      },
      {
        "id": "qwen-chat",
        "name": "Qwen Chat (Alibaba)",
        "purpose": "বহুভাষিক কথোপকথন, যুক্তি ও কোডের কাজে সহায়তা",
        "officialUrl": "https://chat.qwen.ai/"
      },
      {
        "id": "agnes-ai",
        "name": "Agnes AI",
        "purpose": "লেখা, ছবি, ভিডিও ও সৃজনশীল কাজে সহায়তা",
        "officialUrl": "https://agnes-ai.com/"
      },
      {
        "id": "doubao",
        "name": "Doubao (ByteDance)",
        "purpose": "চ্যাট, কণ্ঠ, ছবি ও দৈনন্দিন কাজে সহায়তা",
        "officialUrl": "https://www.doubao.com/chat"
      },
      {
        "id": "gemini",
        "name": "Google Gemini",
        "purpose": "বাংলা কথোপকথন ও নানা কাজে সহায়তা",
        "officialUrl": "https://gemini.google.com/"
      },
      {
        "id": "openrouter",
        "name": "OpenRouter",
        "purpose": "বিভিন্ন কৃত্রিম বুদ্ধিমত্তার মডেল দিয়ে লেখা ও বিশ্লেষণ",
        "officialUrl": "https://openrouter.ai/"
      },
      {
        "id": "groq",
        "name": "Groq",
        "purpose": "দ্রুত উত্তর তৈরি",
        "officialUrl": "https://groq.com/"
      },
      {
        "id": "mistral",
        "name": "Mistral AI",
        "purpose": "বহু ভাষায় কাজ ও কোড লেখায় সহায়তা",
        "officialUrl": "https://mistral.ai/"
      },
      {
        "id": "cerebras",
        "name": "Cerebras",
        "purpose": "দ্রুত উত্তর তৈরি",
        "officialUrl": "https://www.cerebras.ai/"
      },
      {
        "id": "cloudflare-workers-ai",
        "name": "Cloudflare Workers AI",
        "purpose": "দ্রুত বুদ্ধিমান সহায়তা",
        "officialUrl": "https://developers.cloudflare.com/workers-ai/"
      },
      {
        "id": "huggingface",
        "name": "Hugging Face",
        "purpose": "বিভিন্ন উন্মুক্ত কৃত্রিম বুদ্ধিমত্তার মডেল ব্যবহার ও পরীক্ষা",
        "officialUrl": "https://huggingface.co/"
      },
      {
        "id": "nvidia-nim",
        "name": "NVIDIA NIM",
        "purpose": "দ্রুত মডেল দিয়ে কাজ",
        "officialUrl": "https://www.nvidia.com/en-us/ai/"
      },
      {
        "id": "together",
        "name": "Together AI",
        "purpose": "উন্মুক্ত মডেল দিয়ে লেখা ও বিশ্লেষণ",
        "officialUrl": "https://www.together.ai/"
      },
      {
        "id": "fireworks",
        "name": "Fireworks AI",
        "purpose": "দ্রুত উত্তর ও সহায়তা",
        "officialUrl": "https://fireworks.ai/"
      }
    ]
  },
  {
    "id": "agents",
    "name": "কাজের সহকারী",
    "description": "একাধিক ধাপের কাজ পরিকল্পনা ও সম্পন্ন করতে সহায়তা।",
    "providers": [
      {
        "id": "genspark",
        "name": "Genspark",
        "purpose": "গবেষণা, স্লাইড ও কাজের ফলাফল তৈরি",
        "officialUrl": "https://www.genspark.ai/"
      },
      {
        "id": "manus",
        "name": "Manus",
        "purpose": "গবেষণা থেকে শুরু করে কয়েক ধাপের কাজ ও চূড়ান্ত ফলাফল তৈরি",
        "officialUrl": "https://manus.im/"
      },
      {
        "id": "langgraph",
        "name": "LangGraph",
        "purpose": "জটিল কাজের ধাপ সাজিয়ে সম্পন্ন করা",
        "officialUrl": "https://www.langchain.com/langgraph"
      },
      {
        "id": "crewai",
        "name": "CrewAI",
        "purpose": "একাধিক সহকারী দিয়ে বড় কাজ সম্পন্ন",
        "officialUrl": "https://www.crewai.com/"
      },
      {
        "id": "autogen",
        "name": "Microsoft AutoGen",
        "purpose": "একাধিক সহকারীর সঙ্গে কাজের আলোচনা",
        "officialUrl": "https://microsoft.github.io/autogen/"
      },
      {
        "id": "dify",
        "name": "Dify",
        "purpose": "নিজের প্রয়োজনমতো সহকারী ও কাজের ধাপ তৈরি",
        "officialUrl": "https://dify.ai/"
      },
      {
        "id": "flowise",
        "name": "Flowise",
        "purpose": "ধাপে ধাপে কাজ সাজিয়ে সহকারী তৈরি",
        "officialUrl": "https://flowiseai.com/"
      },
      {
        "id": "n8n-agent",
        "name": "n8n AI",
        "purpose": "বিভিন্ন অনলাইন কাজ স্বয়ংক্রিয়ভাবে করা",
        "officialUrl": "https://n8n.io/"
      },
      {
        "id": "vercel-ai-sdk",
        "name": "Vercel AI",
        "purpose": "সহায়তা নিয়ে অ্যাপ তৈরি",
        "officialUrl": "https://ai-sdk.dev/"
      },
      {
        "id": "vercel-eve",
        "name": "Vercel eve",
        "purpose": "স্বয়ংক্রিয় সহকারী দিয়ে বহু ধাপের কাজ করা",
        "officialUrl": "https://vercel.com/docs/agents"
      },
      {
        "id": "llamaindex",
        "name": "LlamaIndex",
        "purpose": "নথি থেকে তথ্য খুঁজে উত্তর তৈরি",
        "officialUrl": "https://www.llamaindex.ai/"
      },
      {
        "id": "openai-agents",
        "name": "OpenAI Agents",
        "purpose": "বিভিন্ন কাজ সম্পন্নে বুদ্ধিমান সহায়তা",
        "officialUrl": "https://openai.github.io/openai-agents-python/"
      }
    ]
  },
  {
    "id": "image-design",
    "name": "ছবি ও নকশা",
    "description": "ছবি তৈরি, সম্পাদনা ও নকশার কাজ।",
    "providers": [
      {
        "id": "canva",
        "name": "Canva",
        "purpose": "পোস্টার, সামাজিক যোগাযোগমাধ্যমের ছবি, উপস্থাপনা ও নথির নকশা",
        "officialUrl": "https://www.canva.com/"
      },
      {
        "id": "adobe-firefly",
        "name": "Adobe Firefly",
        "purpose": "ছবি সম্পাদনা, ভিডিও ও সৃজনশীল কনটেন্ট তৈরি",
        "officialUrl": "https://firefly.adobe.com/"
      },
      {
        "id": "microsoft-designer",
        "name": "Microsoft Designer",
        "purpose": "ছবি তৈরি ও সম্পাদনা, স্টিকার ও কার্ড বানানো",
        "officialUrl": "https://designer.microsoft.com/"
      },
      {
        "id": "gemini-image",
        "name": "Google Gemini Image",
        "purpose": "নতুন ছবি তৈরি ও সম্পাদনা",
        "officialUrl": "https://gemini.google.com/"
      },
      {
        "id": "flux",
        "name": "Black Forest Labs FLUX",
        "purpose": "বিভিন্ন ধরনের ছবি তৈরি",
        "officialUrl": "https://bfl.ai/"
      },
      {
        "id": "stability",
        "name": "Stability AI",
        "purpose": "নতুন ছবি তৈরি ও সম্পাদনা",
        "officialUrl": "https://stability.ai/"
      },
      {
        "id": "ideogram",
        "name": "Ideogram",
        "purpose": "লেখাসহ সুন্দর ছবি তৈরি",
        "officialUrl": "https://ideogram.ai/"
      },
      {
        "id": "recraft",
        "name": "Recraft",
        "purpose": "লোগো, নকশা ও মানসম্মত ছবি তৈরি",
        "officialUrl": "https://www.recraft.ai/"
      },
      {
        "id": "leonardo",
        "name": "Leonardo AI",
        "purpose": "সৃজনশীল ছবি তৈরি",
        "officialUrl": "https://leonardo.ai/"
      },
      {
        "id": "fal",
        "name": "fal.ai",
        "purpose": "ছবি, ভিডিও ও অডিও তৈরি",
        "officialUrl": "https://fal.ai/"
      },
      {
        "id": "replicate",
        "name": "Replicate",
        "purpose": "বিভিন্ন ধরনের সৃজনশীল কাজ",
        "officialUrl": "https://replicate.com/"
      },
      {
        "id": "hf-image",
        "name": "Hugging Face",
        "purpose": "উন্মুক্ত মডেল দিয়ে ছবি তৈরি",
        "officialUrl": "https://huggingface.co/"
      },
      {
        "id": "cf-image",
        "name": "Cloudflare Workers AI",
        "purpose": "দ্রুত ছবি তৈরির সুবিধা",
        "officialUrl": "https://developers.cloudflare.com/workers-ai/"
      }
    ]
  },
  {
    "id": "video",
    "name": "ভিডিও তৈরি",
    "description": "ভিডিও তৈরি, সম্পাদনা ও ছোট ক্লিপ বানানো।",
    "providers": [
      {
        "id": "veo",
        "name": "Google Veo",
        "purpose": "লেখা বা ছবি থেকে ভিডিও তৈরি",
        "officialUrl": "https://deepmind.google/models/veo/"
      },
      {
        "id": "runway",
        "name": "Runway",
        "purpose": "ভিডিও তৈরি ও সম্পাদনা",
        "officialUrl": "https://runwayml.com/"
      },
      {
        "id": "kling",
        "name": "Kling AI",
        "purpose": "লেখা বা ছবি থেকে ভিডিও তৈরি",
        "officialUrl": "https://klingai.com/"
      },
      {
        "id": "luma",
        "name": "Luma Dream Machine",
        "purpose": "ভিডিও তৈরি",
        "officialUrl": "https://lumalabs.ai/dream-machine"
      },
      {
        "id": "pika",
        "name": "Pika",
        "purpose": "সৃজনশীল ভিডিও তৈরি",
        "officialUrl": "https://pika.art/"
      },
      {
        "id": "hailuo",
        "name": "MiniMax Hailuo",
        "purpose": "ভিডিও তৈরি ও সম্পাদনা",
        "officialUrl": "https://hailuoai.video/"
      },
      {
        "id": "pixverse",
        "name": "PixVerse",
        "purpose": "ছোট ভিডিও তৈরি",
        "officialUrl": "https://pixverse.ai/"
      },
      {
        "id": "fal-video",
        "name": "fal.ai",
        "purpose": "ভিডিও তৈরি ও সম্পাদনা",
        "officialUrl": "https://fal.ai/"
      },
      {
        "id": "replicate-video",
        "name": "Replicate",
        "purpose": "বিভিন্ন ধরনের ভিডিও তৈরি",
        "officialUrl": "https://replicate.com/"
      },
      {
        "id": "magichour",
        "name": "Magic Hour",
        "purpose": "ভিডিও তৈরি ও সম্পাদনা",
        "officialUrl": "https://magichour.ai/"
      },
      {
        "id": "google-vids",
        "name": "Google Vids (Veo)",
        "purpose": "ভিডিও ক্লিপ তৈরি ও সম্পাদনা",
        "officialUrl": "https://workspace.google.com/products/vids/"
      },
      {
        "id": "wan-video",
        "name": "Wan 2.2 (Alibaba)",
        "purpose": "লেখা বা ছবি থেকে ভিডিও তৈরি",
        "officialUrl": "https://github.com/Wan-Video/Wan2.2"
      }
    ]
  },
  {
    "id": "voice-speech",
    "name": "কণ্ঠ ও কথার সেবা",
    "description": "বাংলা কথা লেখা হিসেবে পাওয়া, লেখা থেকে কণ্ঠ তৈরি ও ভয়েসওভার।",
    "providers": [
      {
        "id": "gemini-tts",
        "name": "Google Gemini TTS",
        "purpose": "লেখা থেকে কণ্ঠ তৈরি",
        "officialUrl": "https://ai.google.dev/gemini-api/docs/speech-generation"
      },
      {
        "id": "google-stt",
        "name": "Google Cloud Speech-to-Text",
        "purpose": "কথাকে লেখায় রূপান্তর",
        "officialUrl": "https://cloud.google.com/speech-to-text"
      },
      {
        "id": "elevenlabs",
        "name": "ElevenLabs",
        "purpose": "কৃত্রিম কণ্ঠ তৈরি",
        "officialUrl": "https://elevenlabs.io/"
      },
      {
        "id": "assemblyai",
        "name": "AssemblyAI",
        "purpose": "কথাকে লেখায় রূপান্তর",
        "officialUrl": "https://www.assemblyai.com/"
      },
      {
        "id": "groq-whisper",
        "name": "Groq Whisper",
        "purpose": "দ্রুত কথাকে লেখায় রূপান্তর",
        "officialUrl": "https://console.groq.com/docs/speech-to-text"
      },
      {
        "id": "openai-audio",
        "name": "OpenAI Audio API",
        "purpose": "কথা ও শব্দ নিয়ে কাজ",
        "officialUrl": "https://platform.openai.com/docs/guides/audio"
      },
      {
        "id": "azure-speech",
        "name": "Azure AI Speech",
        "purpose": "কথাকে লেখা ও লেখাকে কণ্ঠে রূপান্তর",
        "officialUrl": "https://azure.microsoft.com/en-us/products/ai-services/ai-speech"
      },
      {
        "id": "coqui",
        "name": "Coqui TTS",
        "purpose": "লেখাকে স্বাভাবিক কণ্ঠে রূপান্তর",
        "officialUrl": "https://github.com/coqui-ai/TTS"
      },
      {
        "id": "deepgram",
        "name": "Deepgram",
        "purpose": "কথা শনাক্ত করা",
        "officialUrl": "https://deepgram.com/"
      },
      {
        "id": "fish-audio",
        "name": "Fish Audio",
        "purpose": "বিভিন্ন ভাষায় কণ্ঠ তৈরি, কণ্ঠে বর্ণনা ও কণ্ঠের ধরন নির্বাচন",
        "officialUrl": "https://fish.audio/plan/"
      },
      {
        "id": "google-cloud-tts",
        "name": "Google Cloud Text-to-Speech",
        "purpose": "বাংলা লেখা থেকে স্বাভাবিক কণ্ঠ ও ভয়েসওভার",
        "officialUrl": "https://cloud.google.com/text-to-speech"
      }
    ]
  },
  {
    "id": "music-audio",
    "name": "গান ও শব্দ তৈরি",
    "description": "বাংলা নির্দেশনায় গান, সুর, আবহসংগীত ও শব্দ তৈরি।",
    "providers": [
      {
        "id": "suno",
        "name": "Suno",
        "purpose": "নির্দেশনা থেকে গান, গানের কথা, কণ্ঠ ও বাদ্যযন্ত্রের সুর তৈরি",
        "officialUrl": "https://suno.com/pricing"
      },
      {
        "id": "udio",
        "name": "Udio",
        "purpose": "গান তৈরি, বাড়ানো, নতুনভাবে সাজানো ও সম্পাদনা",
        "officialUrl": "https://udio.com/pricing"
      },
      {
        "id": "musicgen",
        "name": "Meta MusicGen (AudioCraft)",
        "purpose": "লেখা বা সুরের নির্দেশনা থেকে সংগীত তৈরি",
        "officialUrl": "https://github.com/facebookresearch/audiocraft"
      },
      {
        "id": "mureka",
        "name": "Mureka",
        "purpose": "বাংলা গানের কথা বা নির্দেশনা থেকে কণ্ঠ ও বাদ্যযন্ত্রসহ গান তৈরি",
        "officialUrl": "https://www.mureka.ai/subscribe"
      }
    ]
  },
  {
    "id": "website-builders",
    "name": "ওয়েবসাইট ও অ্যাপ তৈরি",
    "description": "সহজ নির্দেশনায় ওয়েবসাইট ও অ্যাপ তৈরি।",
    "providers": [
      {
        "id": "bolt-new",
        "name": "Bolt.new",
        "purpose": "নির্দেশনা থেকে সম্পূর্ণ ওয়েবসাইট ও অ্যাপ তৈরি এবং প্রকাশ",
        "officialUrl": "https://bolt.new/pricing"
      },
      {
        "id": "lovable",
        "name": "Lovable",
        "purpose": "নির্দেশনা থেকে ওয়েব অ্যাপ ও নমুনা তৈরি",
        "officialUrl": "https://lovable.dev/"
      },
      {
        "id": "replit",
        "name": "Replit",
        "purpose": "কোড লেখা, অ্যাপের প্রাথমিক সংস্করণ তৈরি ও অনলাইনে চালু করা",
        "officialUrl": "https://replit.com/"
      },
      {
        "id": "v0",
        "name": "v0 by Vercel",
        "purpose": "ওয়েবসাইটের পর্দার নকশা ও অ্যাপ তৈরি করে অনলাইনে প্রকাশ",
        "officialUrl": "https://v0.app/pricing"
      }
    ]
  },
  {
    "id": "hosting-deployment",
    "name": "ওয়েবসাইট প্রকাশ",
    "description": "ওয়েবসাইট প্রকাশ ও অনলাইনে চালু রাখা।",
    "providers": [
      {
        "id": "netlify",
        "name": "Netlify",
        "purpose": "ওয়েবসাইট প্রকাশ ও অনলাইনে চালু রাখা",
        "officialUrl": "https://www.netlify.com/pricing/"
      },
      {
        "id": "cloudflare-pages",
        "name": "Cloudflare Pages",
        "purpose": "ওয়েবসাইট প্রকাশ ও দ্রুত পৌঁছে দেওয়া",
        "officialUrl": "https://developers.cloudflare.com/pages/platform/limits/"
      }
    ]
  },
  {
    "id": "coding",
    "name": "কোডিং ও সফটওয়্যার তৈরি",
    "description": "কোড লেখা, বোঝা, ভুল খুঁজে ঠিক করা ও সফটওয়্যার তৈরি।",
    "providers": [
      {
        "id": "copilot",
        "name": "GitHub Copilot",
        "purpose": "কোড লেখা ও বোঝার সহায়তা",
        "officialUrl": "https://github.com/features/copilot"
      },
      {
        "id": "cursor",
        "name": "Cursor",
        "purpose": "কোড লেখার সহায়ক সম্পাদক",
        "officialUrl": "https://cursor.com/"
      },
      {
        "id": "windsurf",
        "name": "Windsurf",
        "purpose": "কোড লেখার সহায়ক সম্পাদক",
        "officialUrl": "https://windsurf.com/"
      },
      {
        "id": "gemini-code",
        "name": "Gemini Code Assist",
        "purpose": "কোড লেখা ও উন্নত করার সহায়তা",
        "officialUrl": "https://codeassist.google/"
      },
      {
        "id": "cline",
        "name": "Cline",
        "purpose": "কোড লিখতে ও পরিবর্তন করতে সহায়তা",
        "officialUrl": "https://cline.bot/"
      },
      {
        "id": "roo",
        "name": "Roo Code",
        "purpose": "কোড লিখতে ও পরিবর্তন করতে সহায়তা",
        "officialUrl": "https://roocode.com/"
      },
      {
        "id": "aider",
        "name": "Aider",
        "purpose": "কোড লেখার সময় ধাপে ধাপে সহায়তা",
        "officialUrl": "https://aider.chat/"
      },
      {
        "id": "continue",
        "name": "Continue",
        "purpose": "কোড লেখা ও সম্পাদনায় সহায়তা",
        "officialUrl": "https://www.continue.dev/"
      },
      {
        "id": "openhands",
        "name": "OpenHands",
        "purpose": "সফটওয়্যার তৈরির কাজে সহায়তা",
        "officialUrl": "https://openhands.dev/"
      },
      {
        "id": "kilo",
        "name": "Kilo Code",
        "purpose": "কোড লেখা, পরীক্ষা ও উন্নত করা",
        "officialUrl": "https://kilocode.ai/"
      }
    ]
  },
  {
    "id": "research-search",
    "name": "গবেষণা ও তথ্য খোঁজা",
    "description": "ওয়েবে তথ্য খোঁজা, উৎস দেখা ও গবেষণার সারাংশ তৈরি।",
    "providers": [
      {
        "id": "notebooklm",
        "name": "Google NotebookLM",
        "purpose": "নিজের নথি থেকে তথ্য, সারাংশ ও পড়ার সহায়ক তৈরি",
        "officialUrl": "https://notebooklm.google.com/"
      },
      {
        "id": "gamma",
        "name": "Gamma",
        "purpose": "উপস্থাপনা, নথি ও ওয়েবপেজ তৈরি",
        "officialUrl": "https://gamma.app/"
      },
      {
        "id": "felo",
        "name": "Felo AI (Japan)",
        "purpose": "বিভিন্ন ভাষায় তথ্য খোঁজা, উৎস যাচাই ও নথি বিশ্লেষণ",
        "officialUrl": "https://felo.ai/en/pricing"
      },
      {
        "id": "perplexity",
        "name": "Perplexity",
        "purpose": "প্রশ্নের উত্তর ও তথ্য অনুসন্ধান",
        "officialUrl": "https://www.perplexity.ai/"
      },
      {
        "id": "tavily",
        "name": "Tavily",
        "purpose": "ওয়েবে প্রয়োজনীয় তথ্য খুঁজে পাওয়া",
        "officialUrl": "https://tavily.com/"
      },
      {
        "id": "exa",
        "name": "Exa",
        "purpose": "অর্থ বুঝে ওয়েব থেকে তথ্য খোঁজা",
        "officialUrl": "https://exa.ai/"
      },
      {
        "id": "brave",
        "name": "Brave Search API",
        "purpose": "ওয়েবের তথ্যভান্ডার থেকে খোঁজা",
        "officialUrl": "https://brave.com/search/api/"
      },
      {
        "id": "serpapi",
        "name": "SerpApi",
        "purpose": "ওয়েবে প্রয়োজনীয় তথ্য খোঁজা",
        "officialUrl": "https://serpapi.com/"
      },
      {
        "id": "firecrawl",
        "name": "Firecrawl",
        "purpose": "ওয়েবসাইট থেকে তথ্য সংগ্রহ ও বের করা",
        "officialUrl": "https://www.firecrawl.dev/"
      },
      {
        "id": "jina",
        "name": "Jina AI",
        "purpose": "নথি পড়া, তথ্য খোঁজা ও সাজানো",
        "officialUrl": "https://jina.ai/"
      },
      {
        "id": "google-grounding",
        "name": "Google Search Grounding",
        "purpose": "বিশ্বস্ত উৎসের তথ্যসহ উত্তর তৈরি",
        "officialUrl": "https://ai.google.dev/gemini-api/docs/google-search"
      },
      {
        "id": "you",
        "name": "You.com",
        "purpose": "তথ্য অনুসন্ধান ও গবেষণা",
        "officialUrl": "https://you.com/"
      },
      {
        "id": "duckduckgo",
        "name": "DuckDuckGo",
        "purpose": "প্রয়োজনীয় তথ্য খুঁজে বের করা",
        "officialUrl": "https://duckduckgo.com/"
      }
    ]
  },
  {
    "id": "automation",
    "name": "স্বয়ংক্রিয় কাজ",
    "description": "বারবার করতে হয় এমন কাজ স্বয়ংক্রিয়ভাবে সম্পন্ন করা।",
    "providers": [
      {
        "id": "n8n",
        "name": "n8n",
        "purpose": "দৈনন্দিন কাজ স্বয়ংক্রিয় করা",
        "officialUrl": "https://n8n.io/"
      },
      {
        "id": "activepieces",
        "name": "Activepieces",
        "purpose": "বিভিন্ন সেবা যুক্ত করে কাজ সহজ করা",
        "officialUrl": "https://www.activepieces.com/"
      },
      {
        "id": "node-red",
        "name": "Node-RED",
        "purpose": "বিভিন্ন কাজ সহজে স্বয়ংক্রিয় করা",
        "officialUrl": "https://nodered.org/"
      },
      {
        "id": "windmill",
        "name": "Windmill",
        "purpose": "নিয়মিত কাজ সহজে চালানো",
        "officialUrl": "https://www.windmill.dev/"
      },
      {
        "id": "pipedream",
        "name": "Pipedream",
        "purpose": "অনলাইন কাজ স্বয়ংক্রিয় করা",
        "officialUrl": "https://pipedream.com/"
      },
      {
        "id": "make",
        "name": "Make",
        "purpose": "ধাপে ধাপে কাজ সাজিয়ে স্বয়ংক্রিয় করা",
        "officialUrl": "https://www.make.com/"
      },
      {
        "id": "zapier",
        "name": "Zapier",
        "purpose": "কোড না লিখে কাজ স্বয়ংক্রিয় করা",
        "officialUrl": "https://zapier.com/"
      },
      {
        "id": "dify-workflow",
        "name": "Dify Workflow",
        "purpose": "সহায়তায় কাজের ধাপ তৈরি ও পরিচালনা",
        "officialUrl": "https://docs.dify.ai/"
      },
      {
        "id": "flowise-workflow",
        "name": "Flowise",
        "purpose": "সহায়তায় কাজের ধাপ তৈরি",
        "officialUrl": "https://docs.flowiseai.com/"
      },
      {
        "id": "kestra",
        "name": "Kestra",
        "purpose": "নির্দিষ্ট সময়ে কাজ স্বয়ংক্রিয়ভাবে চালানো",
        "officialUrl": "https://kestra.io/"
      }
    ]
  },
  {
    "id": "document-ocr",
    "name": "নথি থেকে তথ্য বের করা",
    "description": "ছবি ও নথি থেকে লেখা, টেবিল ও প্রয়োজনীয় তথ্য বের করা।",
    "providers": [
      {
        "id": "tesseract",
        "name": "Tesseract OCR",
        "purpose": "ছবি থেকে লেখা পড়া",
        "officialUrl": "https://github.com/tesseract-ocr/tesseract"
      },
      {
        "id": "paddleocr",
        "name": "PaddleOCR",
        "purpose": "নথি ও ছবির লেখা পড়া",
        "officialUrl": "https://www.paddleocr.ai/"
      },
      {
        "id": "google-docai",
        "name": "Google Document AI",
        "purpose": "নথি থেকে প্রয়োজনীয় তথ্য বের করা",
        "officialUrl": "https://cloud.google.com/document-ai"
      },
      {
        "id": "azure-docintel",
        "name": "Azure Document Intelligence",
        "purpose": "ফরম ও নথি থেকে প্রয়োজনীয় তথ্য বের করা",
        "officialUrl": "https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence"
      },
      {
        "id": "textract",
        "name": "AWS Textract",
        "purpose": "সারণি ও ফরম থেকে তথ্য বের করা",
        "officialUrl": "https://aws.amazon.com/textract/"
      },
      {
        "id": "tika",
        "name": "Apache Tika",
        "purpose": "ফাইল থেকে লেখা ও পরিচিতিমূলক তথ্য বের করা",
        "officialUrl": "https://tika.apache.org/"
      },
      {
        "id": "unstructured",
        "name": "Unstructured",
        "purpose": "নথি গ্রহণ করে প্রয়োজনীয় অংশে সাজানো",
        "officialUrl": "https://unstructured.io/"
      },
      {
        "id": "abbyy",
        "name": "ABBYY",
        "purpose": "নথি থেকে লেখা ও তথ্য বের করা",
        "officialUrl": "https://www.abbyy.com/"
      },
      {
        "id": "nanonets",
        "name": "Nanonets",
        "purpose": "নথি বুঝে প্রয়োজনীয় তথ্য সাজানো",
        "officialUrl": "https://nanonets.com/"
      },
      {
        "id": "ocr-space",
        "name": "OCR.space",
        "purpose": "ছবি ও পিডিএফ থেকে লেখা বের করা",
        "officialUrl": "https://ocr.space/"
      }
    ]
  },
  {
    "id": "translation",
    "name": "অনুবাদ",
    "description": "বাংলা ও অন্যান্য ভাষার লেখা ও কথার অনুবাদ।",
    "providers": [
      {
        "id": "google-translate",
        "name": "Google Translate API",
        "purpose": "এক ভাষা থেকে অন্য ভাষায় অনুবাদ",
        "officialUrl": "https://cloud.google.com/translate"
      },
      {
        "id": "deepl",
        "name": "DeepL",
        "purpose": "উন্নত কৃত্রিম বুদ্ধিমত্তা দিয়ে অনুবাদ",
        "officialUrl": "https://www.deepl.com/"
      },
      {
        "id": "amazon-translate",
        "name": "Amazon Translate",
        "purpose": "অনলাইনে লেখা অনুবাদ",
        "officialUrl": "https://aws.amazon.com/translate/"
      },
      {
        "id": "libretranslate",
        "name": "LibreTranslate",
        "purpose": "বিভিন্ন ভাষায় লেখা অনুবাদ",
        "officialUrl": "https://libretranslate.com/"
      },
      {
        "id": "argos",
        "name": "Argos Translate",
        "purpose": "ইন্টারনেট ছাড়াই অনুবাদ",
        "officialUrl": "https://github.com/argosopentech/argos-translate"
      },
      {
        "id": "nllb",
        "name": "Meta NLLB",
        "purpose": "উন্মুক্ত মডেল দিয়ে বিভিন্ন ভাষায় অনুবাদ",
        "officialUrl": "https://github.com/facebookresearch/fairseq/tree/nllb"
      },
      {
        "id": "seamless",
        "name": "Meta SeamlessM4T",
        "purpose": "কথা ও লেখা অনুবাদ",
        "officialUrl": "https://ai.meta.com/research/seamless-communication/"
      },
      {
        "id": "azure-language",
        "name": "Azure AI Language",
        "purpose": "ভাষা ও লেখার বিশ্লেষণ",
        "officialUrl": "https://azure.microsoft.com/en-us/products/ai-services/ai-language"
      },
      {
        "id": "modernmt",
        "name": "ModernMT",
        "purpose": "লেখার ধরন বুঝে অনুবাদ",
        "officialUrl": "https://www.modernmt.com/"
      },
      {
        "id": "microsoft-translator",
        "name": "Microsoft Translator",
        "purpose": "বিভিন্ন ভাষায় লেখা ও কথার অনুবাদ",
        "officialUrl": "https://www.microsoft.com/en-us/translator/"
      }
    ]
  },
  {
    "id": "vector-knowledge",
    "name": "নথি ও তথ্য খোঁজা",
    "description": "নথি ও তথ্যের ভেতর থেকে প্রয়োজনীয় বিষয় খুঁজে পাওয়া।",
    "providers": [
      {
        "id": "pgvector",
        "name": "PostgreSQL pgvector",
        "purpose": "নিজের নথি থেকে মিল থাকা তথ্য খুঁজে পাওয়া",
        "officialUrl": "https://github.com/pgvector/pgvector"
      },
      {
        "id": "qdrant",
        "name": "Qdrant",
        "purpose": "নথির ভেতর থেকে প্রয়োজনীয় তথ্য খোঁজা",
        "officialUrl": "https://qdrant.tech/"
      },
      {
        "id": "chroma",
        "name": "Chroma",
        "purpose": "তথ্য সংরক্ষণ ও খুঁজে পাওয়া",
        "officialUrl": "https://www.trychroma.com/"
      },
      {
        "id": "weaviate",
        "name": "Weaviate",
        "purpose": "নথি ও তথ্য থেকে উত্তর খোঁজা",
        "officialUrl": "https://weaviate.io/"
      },
      {
        "id": "milvus",
        "name": "Milvus",
        "purpose": "বড় নথি থেকে তথ্য খোঁজা",
        "officialUrl": "https://milvus.io/"
      },
      {
        "id": "pinecone",
        "name": "Pinecone",
        "purpose": "নথি থেকে প্রয়োজনীয় তথ্য খুঁজে পাওয়া",
        "officialUrl": "https://www.pinecone.io/"
      },
      {
        "id": "meilisearch",
        "name": "Meilisearch",
        "purpose": "একাধিক পদ্ধতিতে তথ্য খোঁজা",
        "officialUrl": "https://www.meilisearch.com/"
      },
      {
        "id": "typesense",
        "name": "Typesense",
        "purpose": "দ্রুত তথ্য খোঁজা",
        "officialUrl": "https://typesense.org/"
      },
      {
        "id": "elasticsearch",
        "name": "Elasticsearch",
        "purpose": "নথি ও তথ্য অনুসন্ধান",
        "officialUrl": "https://www.elastic.co/elasticsearch"
      },
      {
        "id": "vespa",
        "name": "Vespa",
        "purpose": "বড় তথ্যভান্ডার থেকে প্রয়োজনীয় তথ্য খোঁজা",
        "officialUrl": "https://vespa.ai/"
      }
    ]
  }
];

/** Add transparent referral attribution without exposing provider implementation metadata. */
export function buildProviderReferralUrl(
  provider: Pick<AIHubPublicProvider, "id" | "officialUrl">,
): string | undefined {
  if (!provider.officialUrl) return undefined;
  try {
    const url = new URL(provider.officialUrl);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    url.searchParams.set("utm_source", "dsai");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "ai_hub");
    url.searchParams.set("utm_content", provider.id);
    return url.toString();
  } catch {
    return undefined;
  }
}
