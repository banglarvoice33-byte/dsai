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
    "name": "LLM ও Chat AI",
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
        "purpose": "নিজের কাজে GPT মডেল ব্যবহার",
        "officialUrl": "https://platform.openai.com/"
      },
      {
        "id": "claude",
        "name": "Claude (Anthropic)",
        "purpose": "দীর্ঘ লেখা, বিশ্লেষণ, coding ও document work",
        "officialUrl": "https://claude.ai/"
      },
      {
        "id": "kimi",
        "name": "Kimi (Moonshot AI)",
        "purpose": "দীর্ঘ নথি, PDF, স্লাইড ও গবেষণার কাজে সহায়তা",
        "officialUrl": "https://www.kimi.com/"
      },
      {
        "id": "deepseek",
        "name": "DeepSeek",
        "purpose": "Reasoning, coding, research ও general chat",
        "officialUrl": "https://chat.deepseek.com/"
      },
      {
        "id": "meta-ai",
        "name": "Meta AI",
        "purpose": "Everyday assistant, visual Q&A ও social-app assistance",
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
        "purpose": "বিভিন্ন AI মডেল দিয়ে লেখা ও বিশ্লেষণ",
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
        "purpose": "Multilingual ও coding model",
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
        "purpose": "দ্রুত AI সহায়তা",
        "officialUrl": "https://developers.cloudflare.com/workers-ai/"
      },
      {
        "id": "huggingface",
        "name": "Hugging Face",
        "purpose": "বিভিন্ন উন্মুক্ত AI মডেল ব্যবহার ও পরীক্ষা",
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
        "purpose": "উন্মুক্ত AI মডেল দিয়ে লেখা ও বিশ্লেষণ",
        "officialUrl": "https://www.together.ai/"
      },
      {
        "id": "fireworks",
        "name": "Fireworks AI",
        "purpose": "দ্রুত AI উত্তর ও সহায়তা",
        "officialUrl": "https://fireworks.ai/"
      }
    ]
  },
  {
    "id": "agents",
    "name": "AI Agent ও Agent Builder",
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
        "purpose": "Autonomous research, multi-step tasks ও finished deliverables",
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
        "purpose": "একাধিক AI সহকারী দিয়ে বড় কাজ সম্পন্ন",
        "officialUrl": "https://www.crewai.com/"
      },
      {
        "id": "autogen",
        "name": "Microsoft AutoGen",
        "purpose": "একাধিক AI সহকারীর সঙ্গে কথোপকথন",
        "officialUrl": "https://microsoft.github.io/autogen/"
      },
      {
        "id": "dify",
        "name": "Dify",
        "purpose": "নিজের প্রয়োজনের AI সহকারী ও কাজের ধাপ তৈরি",
        "officialUrl": "https://dify.ai/"
      },
      {
        "id": "flowise",
        "name": "Flowise",
        "purpose": "Visual AI flow builder",
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
        "purpose": "AI-সহায়তায় অ্যাপ তৈরি",
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
        "purpose": "বিভিন্ন কাজ সম্পন্নে AI সহায়তা",
        "officialUrl": "https://openai.github.io/openai-agents-python/"
      }
    ]
  },
  {
    "id": "image-design",
    "name": "Image ও Design AI",
    "description": "ছবি তৈরি, সম্পাদনা ও নকশার কাজ।",
    "providers": [
      {
        "id": "canva",
        "name": "Canva",
        "purpose": "Poster, social media graphics, presentation ও document design",
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
        "purpose": "AI image creation, stickers, cards ও image editing",
        "officialUrl": "https://designer.microsoft.com/"
      },
      {
        "id": "gemini-image",
        "name": "Google Gemini Image",
        "purpose": "Image generation ও editing",
        "officialUrl": "https://gemini.google.com/"
      },
      {
        "id": "flux",
        "name": "Black Forest Labs FLUX",
        "purpose": "Image generation models",
        "officialUrl": "https://bfl.ai/"
      },
      {
        "id": "stability",
        "name": "Stability AI",
        "purpose": "Image generation ও editing",
        "officialUrl": "https://stability.ai/"
      },
      {
        "id": "ideogram",
        "name": "Ideogram",
        "purpose": "Typography-aware image generation",
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
        "purpose": "Creative image generation",
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
        "purpose": "বিভিন্ন ধরনের AI সৃজনশীল কাজ",
        "officialUrl": "https://replicate.com/"
      },
      {
        "id": "hf-image",
        "name": "Hugging Face",
        "purpose": "Open image models",
        "officialUrl": "https://huggingface.co/"
      },
      {
        "id": "cf-image",
        "name": "Cloudflare Workers AI",
        "purpose": "Edge image models",
        "officialUrl": "https://developers.cloudflare.com/workers-ai/"
      }
    ]
  },
  {
    "id": "video",
    "name": "Video Generation AI",
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
    "name": "Voice, Speech ও Audio AI",
    "description": "বাংলা কথা লেখা হিসেবে পাওয়া, লেখা থেকে কণ্ঠ তৈরি ও ভয়েসওভার।",
    "providers": [
      {
        "id": "gemini-tts",
        "name": "Google Gemini TTS",
        "purpose": "Text-to-speech",
        "officialUrl": "https://ai.google.dev/gemini-api/docs/speech-generation"
      },
      {
        "id": "google-stt",
        "name": "Google Cloud Speech-to-Text",
        "purpose": "Speech transcription",
        "officialUrl": "https://cloud.google.com/speech-to-text"
      },
      {
        "id": "elevenlabs",
        "name": "ElevenLabs",
        "purpose": "Voice synthesis",
        "officialUrl": "https://elevenlabs.io/"
      },
      {
        "id": "assemblyai",
        "name": "AssemblyAI",
        "purpose": "Speech transcription",
        "officialUrl": "https://www.assemblyai.com/"
      },
      {
        "id": "groq-whisper",
        "name": "Groq Whisper",
        "purpose": "Fast speech transcription",
        "officialUrl": "https://console.groq.com/docs/speech-to-text"
      },
      {
        "id": "openai-audio",
        "name": "OpenAI Audio API",
        "purpose": "Speech/audio tasks",
        "officialUrl": "https://platform.openai.com/docs/guides/audio"
      },
      {
        "id": "azure-speech",
        "name": "Azure AI Speech",
        "purpose": "Speech-to-text ও text-to-speech",
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
        "purpose": "Speech recognition",
        "officialUrl": "https://deepgram.com/"
      },
      {
        "id": "fish-audio",
        "name": "Fish Audio",
        "purpose": "Voice-over, multilingual text-to-speech ও voice design",
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
    "name": "Music ও Sound Generation AI",
    "description": "বাংলা নির্দেশনায় গান, সুর, আবহসংগীত ও শব্দ তৈরি।",
    "providers": [
      {
        "id": "suno",
        "name": "Suno",
        "purpose": "Prompt থেকে গান, lyrics, vocal ও instrumental তৈরি",
        "officialUrl": "https://suno.com/pricing"
      },
      {
        "id": "udio",
        "name": "Udio",
        "purpose": "AI song generation, extend, remix ও editing",
        "officialUrl": "https://udio.com/pricing"
      },
      {
        "id": "musicgen",
        "name": "Meta MusicGen (AudioCraft)",
        "purpose": "Text-to-music ও melody-conditioned music generation",
        "officialUrl": "https://github.com/facebookresearch/audiocraft"
      },
      {
        "id": "mureka",
        "name": "Mureka",
        "purpose": "বাংলা lyrics/prompt দিয়ে গান, vocal ও instrumental তৈরি",
        "officialUrl": "https://www.mureka.ai/subscribe"
      }
    ]
  },
  {
    "id": "website-builders",
    "name": "Website ও App Builder AI",
    "description": "সহজ নির্দেশনায় ওয়েবসাইট ও অ্যাপ তৈরি।",
    "providers": [
      {
        "id": "bolt-new",
        "name": "Bolt.new",
        "purpose": "Prompt থেকে full-stack website ও app তৈরি এবং publish",
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
        "purpose": "AI-assisted coding, app prototyping ও hosting",
        "officialUrl": "https://replit.com/"
      },
      {
        "id": "v0",
        "name": "v0 by Vercel",
        "purpose": "UI generation, React app creation ও Vercel deploy",
        "officialUrl": "https://v0.app/pricing"
      }
    ]
  },
  {
    "id": "hosting-deployment",
    "name": "Hosting ও Deployment Platforms",
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
    "name": "Coding ও Development AI",
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
        "purpose": "AI code editor",
        "officialUrl": "https://cursor.com/"
      },
      {
        "id": "windsurf",
        "name": "Windsurf",
        "purpose": "AI code editor",
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
        "purpose": "Terminal pair programmer",
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
    "name": "Research ও Search AI",
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
        "purpose": "AI presentation, document ও webpage তৈরি",
        "officialUrl": "https://gamma.app/"
      },
      {
        "id": "felo",
        "name": "Felo AI (Japan)",
        "purpose": "Multilingual AI search, source-based research ও file analysis",
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
        "purpose": "Semantic web search",
        "officialUrl": "https://exa.ai/"
      },
      {
        "id": "brave",
        "name": "Brave Search API",
        "purpose": "Web search index",
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
        "purpose": "Web crawling ও extraction",
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
        "purpose": "Grounded model responses",
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
        "purpose": "Search discovery",
        "officialUrl": "https://duckduckgo.com/"
      }
    ]
  },
  {
    "id": "automation",
    "name": "Automation ও Workflow",
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
        "purpose": "Visual automation",
        "officialUrl": "https://www.make.com/"
      },
      {
        "id": "zapier",
        "name": "Zapier",
        "purpose": "No-code automation",
        "officialUrl": "https://zapier.com/"
      },
      {
        "id": "dify-workflow",
        "name": "Dify Workflow",
        "purpose": "AI দিয়ে কাজের ধাপ তৈরি ও পরিচালনা",
        "officialUrl": "https://docs.dify.ai/"
      },
      {
        "id": "flowise-workflow",
        "name": "Flowise",
        "purpose": "AI সহায়তায় কাজের ধাপ তৈরি",
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
    "name": "Document AI ও OCR",
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
        "purpose": "Document extraction",
        "officialUrl": "https://cloud.google.com/document-ai"
      },
      {
        "id": "azure-docintel",
        "name": "Azure Document Intelligence",
        "purpose": "Forms ও document extraction",
        "officialUrl": "https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence"
      },
      {
        "id": "textract",
        "name": "AWS Textract",
        "purpose": "Tables ও forms",
        "officialUrl": "https://aws.amazon.com/textract/"
      },
      {
        "id": "tika",
        "name": "Apache Tika",
        "purpose": "File text/metadata extraction",
        "officialUrl": "https://tika.apache.org/"
      },
      {
        "id": "unstructured",
        "name": "Unstructured",
        "purpose": "Document ingestion ও chunking",
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
        "purpose": "Intelligent document processing",
        "officialUrl": "https://nanonets.com/"
      },
      {
        "id": "ocr-space",
        "name": "OCR.space",
        "purpose": "ছবি ও PDF থেকে লেখা বের করা",
        "officialUrl": "https://ocr.space/"
      }
    ]
  },
  {
    "id": "translation",
    "name": "Translation ও Language AI",
    "description": "বাংলা ও অন্যান্য ভাষার লেখা ও কথার অনুবাদ।",
    "providers": [
      {
        "id": "google-translate",
        "name": "Google Translate API",
        "purpose": "Machine translation",
        "officialUrl": "https://cloud.google.com/translate"
      },
      {
        "id": "deepl",
        "name": "DeepL",
        "purpose": "Neural translation",
        "officialUrl": "https://www.deepl.com/"
      },
      {
        "id": "amazon-translate",
        "name": "Amazon Translate",
        "purpose": "Cloud translation",
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
        "purpose": "Offline translation",
        "officialUrl": "https://github.com/argosopentech/argos-translate"
      },
      {
        "id": "nllb",
        "name": "Meta NLLB",
        "purpose": "Open multilingual translation model",
        "officialUrl": "https://github.com/facebookresearch/fairseq/tree/nllb"
      },
      {
        "id": "seamless",
        "name": "Meta SeamlessM4T",
        "purpose": "Speech/text translation",
        "officialUrl": "https://ai.meta.com/research/seamless-communication/"
      },
      {
        "id": "azure-language",
        "name": "Azure AI Language",
        "purpose": "Language analysis",
        "officialUrl": "https://azure.microsoft.com/en-us/products/ai-services/ai-language"
      },
      {
        "id": "modernmt",
        "name": "ModernMT",
        "purpose": "Adaptive translation",
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
    "name": "Vector Search ও Knowledge Base",
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
        "purpose": "Hybrid search",
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
