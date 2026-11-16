/**
 * DSAI AI Hub provider directory.
 *
 * Important: entries in this catalog are discovery candidates, not claims that
 * an API is connected, free, or production-ready. Live readiness must be earned
 * by credential validation, provider terms review, API smoke tests and UAT.
 */
export type AIHubCategoryId =
  | "llm-chat"
  | "agents"
  | "image-design"
  | "video"
  | "voice-speech"
  | "coding"
  | "research-search"
  | "automation"
  | "document-ocr"
  | "translation"
  | "vector-knowledge";

export type IntegrationKind = "hosted-api" | "framework" | "hosted-app" | "self-hosted" | "search-api" | "database";

export interface AIHubProvider {
  id: string;
  name: string;
  kind: IntegrationKind;
  purpose: string;
  integrationNote: string;
}

export interface AIHubCategory {
  id: AIHubCategoryId;
  name: string;
  description: string;
  providers: AIHubProvider[];
}

const p = (id: string, name: string, kind: IntegrationKind, purpose: string, integrationNote: string): AIHubProvider =>
  ({ id, name, kind, purpose, integrationNote });

export const DSAI_AI_HUB_CATEGORIES: AIHubCategory[] = [
  {
    id: "llm-chat",
    name: "LLM ও Chat AI",
    description: "বাংলা কথোপকথন, reasoning, coding, summarization ও multimodal কাজ।",
    providers: [
      p("gemini", "Google Gemini", "hosted-api", "বাংলা ও multimodal model", "API key, model-level quota ও data terms যাচাই করতে হবে।"),
      p("openrouter", "OpenRouter", "hosted-api", "এক API-তে বহু model", "প্রতিটি model-এর price ও free-route eligibility আলাদা করে যাচাই করতে হবে।"),
      p("groq", "Groq", "hosted-api", "দ্রুত inference", "নির্বাচিত model ও account quota live test করতে হবে।"),
      p("mistral", "Mistral AI", "hosted-api", "Multilingual ও coding model", "API entitlement এবং বর্তমান pricing যাচাই করতে হবে।"),
      p("cerebras", "Cerebras", "hosted-api", "দ্রুত inference", "Model availability ও quota যাচাই করতে হবে।"),
      p("cloudflare-workers-ai", "Cloudflare Workers AI", "hosted-api", "Edge inference", "Account entitlement, Neurons allowance ও model support যাচাই করতে হবে।"),
      p("huggingface", "Hugging Face", "hosted-api", "Open model inference", "Inference provider ও rate limit modelভেদে আলাদা।"),
      p("nvidia-nim", "NVIDIA NIM", "hosted-api", "Optimized inference microservices", "NIM deployment ও hosting cost যাচাই করতে হবে।"),
      p("together", "Together AI", "hosted-api", "Open model inference", "Free credit/paid quota আলাদা করে যাচাই করতে হবে।"),
      p("fireworks", "Fireworks AI", "hosted-api", "Model serving", "বর্তমান account pricing ও rate limit যাচাই করতে হবে।"),
    ],
  },
  {
    id: "agents",
    name: "AI Agent ও Agent Builder",
    description: "Tool use, multi-step reasoning, agent orchestration ও human approval workflow।",
    providers: [
      p("langgraph", "LangGraph", "framework", "Stateful agent orchestration", "লাইব্রেরি/framework; model API ও runtime আলাদা লাগবে।"),
      p("crewai", "CrewAI", "framework", "Multi-agent task coordination", "Framework; hosted API ধরে নেওয়া যাবে না।"),
      p("autogen", "Microsoft AutoGen", "framework", "Multi-agent conversation", "Framework; deployment ও model billing আলাদা।"),
      p("dify", "Dify", "self-hosted", "Visual LLM app ও workflow", "Self-host/API edition এবং hosting cost যাচাই করতে হবে।"),
      p("flowise", "Flowise", "self-hosted", "Visual AI flow builder", "Self-host/API; secured deployment প্রয়োজন।"),
      p("n8n-agent", "n8n AI", "self-hosted", "Tool ও workflow automation", "Self-host বা hosted plan; node/license terms যাচাই করতে হবে।"),
      p("vercel-ai-sdk", "Vercel AI SDK", "framework", "Application-side model integration", "SDK, নিজে model provider নয়।"),
      p("vercel-eve", "Vercel eve", "framework", "Agent runtime", "Availability ও production support যাচাই করতে হবে।"),
      p("llamaindex", "LlamaIndex", "framework", "RAG ও data agents", "Framework; model/vector services আলাদা।"),
      p("openai-agents", "OpenAI Agents SDK", "framework", "Tool-enabled agent orchestration", "SDK; model API ও pricing আলাদা।"),
    ],
  },
  {
    id: "image-design",
    name: "Image ও Design AI",
    description: "Text-to-image, image editing, design assets ও visual generation।",
    providers: [
      p("gemini-image", "Google Gemini Image", "hosted-api", "Image generation ও editing", "Model availability, policy ও pricing যাচাই করতে হবে।"),
      p("flux", "Black Forest Labs FLUX", "hosted-api", "Image generation models", "Direct API ও hosted partner terms আলাদা।"),
      p("stability", "Stability AI", "hosted-api", "Image generation ও editing", "API credit/pricing যাচাই করতে হবে।"),
      p("ideogram", "Ideogram", "hosted-api", "Typography-aware image generation", "API access ও quota যাচাই করতে হবে।"),
      p("recraft", "Recraft", "hosted-api", "Vector ও design generation", "Free access/credit সীমা এবং commercial terms যাচাই করতে হবে।"),
      p("leonardo", "Leonardo AI", "hosted-api", "Creative image generation", "API access entitlement আলাদা করে যাচাই করতে হবে।"),
      p("fal", "fal.ai", "hosted-api", "Hosted model inference", "প্রতি model-এর cost ও queue policy যাচাই করতে হবে।"),
      p("replicate", "Replicate", "hosted-api", "Model API marketplace", "সাধারণত usage-based; free credit ধরে নেওয়া যাবে না।"),
      p("hf-image", "Hugging Face", "hosted-api", "Open image models", "Provider availability ও rate limits যাচাই করতে হবে।"),
      p("cf-image", "Cloudflare Workers AI", "hosted-api", "Edge image models", "Supported model ও quota live test করতে হবে।"),
    ],
  },
  {
    id: "video",
    name: "Video Generation AI",
    description: "Text/image-to-video, editing ও short-form video workflow।",
    providers: [
      p("veo", "Google Veo", "hosted-api", "Generative video", "API eligibility, pricing ও quota যাচাই করতে হবে।"),
      p("runway", "Runway", "hosted-api", "Video generation/editing", "API access ও paid usage terms যাচাই করতে হবে।"),
      p("kling", "Kling AI", "hosted-api", "Text/image-to-video", "Official API access ও region terms যাচাই করতে হবে।"),
      p("luma", "Luma Dream Machine", "hosted-api", "Video generation", "API entitlement ও price যাচাই করতে হবে।"),
      p("pika", "Pika", "hosted-api", "Generative video", "Public API availability নিশ্চিত না করে integration দাবি নয়।"),
      p("hailuo", "MiniMax Hailuo", "hosted-api", "Video generation", "Official API, quota ও geography যাচাই করতে হবে।"),
      p("pixverse", "PixVerse", "hosted-api", "Short video generation", "API access ও commercial terms যাচাই করতে হবে।"),
      p("fal-video", "fal.ai", "hosted-api", "Hosted video model inference", "প্রতি model-এর cost, duration ও queue যাচাই করতে হবে।"),
      p("replicate-video", "Replicate", "hosted-api", "Hosted video models", "Usage-based pricing; free web UI মানে free API নয়।"),
      p("magichour", "Magic Hour", "hosted-api", "Video creation tools", "API access ও pricing যাচাই করতে হবে।"),
    ],
  },
  {
    id: "voice-speech",
    name: "Voice, Speech ও Audio AI",
    description: "বাংলা STT/TTS, speaker, accent, transcription ও audio generation।",
    providers: [
      p("gemini-tts", "Google Gemini TTS", "hosted-api", "Text-to-speech", "বাংলা voice support ও model quota benchmark করতে হবে।"),
      p("google-stt", "Google Cloud Speech-to-Text", "hosted-api", "Speech transcription", "বাংলা locale, billing ও recognition quality যাচাই করতে হবে।"),
      p("elevenlabs", "ElevenLabs", "hosted-api", "Voice synthesis", "বাংলা voice/API quota ও consent policy যাচাই করতে হবে।"),
      p("assemblyai", "AssemblyAI", "hosted-api", "Speech transcription", "বাংলা language support ও pricing যাচাই করতে হবে।"),
      p("groq-whisper", "Groq Whisper", "hosted-api", "Fast speech transcription", "Model availability ও quota যাচাই করতে হবে।"),
      p("openai-audio", "OpenAI Audio API", "hosted-api", "Speech/audio tasks", "Paid billing ধরে নিতে হবে যতক্ষণ free quota যাচাই না হয়।"),
      p("azure-speech", "Azure AI Speech", "hosted-api", "Speech-to-text ও text-to-speech", "বাংলা locale, free grant ও region যাচাই করতে হবে।"),
      p("playht", "PlayHT", "hosted-api", "Voice generation", "API access ও বর্তমান plan যাচাই করতে হবে।"),
      p("coqui", "Coqui TTS", "self-hosted", "Open-source TTS runtime", "Model license, compute ও Bangla voice quality যাচাই করতে হবে।"),
      p("deepgram", "Deepgram", "hosted-api", "Speech recognition", "বাংলা model support ও trial বনাম recurring free tier আলাদা করতে হবে।"),
    ],
  },
  {
    id: "coding",
    name: "Coding ও Development AI",
    description: "Code completion, repository agents, debugging ও developer workflow।",
    providers: [
      p("copilot", "GitHub Copilot", "hosted-app", "IDE code assistance", "Product subscription; public API integration নয়।"),
      p("cursor", "Cursor", "hosted-app", "AI code editor", "Desktop product; API availability আলাদা যাচাইযোগ্য।"),
      p("windsurf", "Windsurf", "hosted-app", "AI code editor", "Product plan; server API ধরে নেওয়া যাবে না।"),
      p("gemini-code", "Gemini Code Assist", "hosted-app", "IDE coding assistant", "Developer product; API key integration আলাদা।"),
      p("cline", "Cline", "framework", "IDE agent extension", "Extension; user-supplied provider credentials লাগতে পারে।"),
      p("roo", "Roo Code", "framework", "IDE agent extension", "Extension; model provider আলাদা।"),
      p("aider", "Aider", "framework", "Terminal pair programmer", "Open-source CLI; configured model API প্রয়োজন।"),
      p("continue", "Continue", "framework", "IDE assistant framework", "IDE extension; provider adapter প্রয়োজন।"),
      p("openhands", "OpenHands", "self-hosted", "Software engineering agent", "Sandboxed runtime, compute ও security hardening প্রয়োজন।"),
      p("kilo", "Kilo Code", "framework", "IDE coding agent", "Extension; provider/API configuration আলাদা।"),
    ],
  },
  {
    id: "research-search",
    name: "Research ও Search AI",
    description: "Web search, retrieval, source extraction, grounding ও research synthesis।",
    providers: [
      p("perplexity", "Perplexity", "hosted-api", "Answer/research API", "API access ও search pricing যাচাই করতে হবে।"),
      p("tavily", "Tavily", "search-api", "Agent-oriented web search", "Free allowance বনাম paid quota যাচাই করতে হবে।"),
      p("exa", "Exa", "search-api", "Semantic web search", "API quota ও commercial terms যাচাই করতে হবে।"),
      p("brave", "Brave Search API", "search-api", "Web search index", "Free allowance ও request limits যাচাই করতে হবে।"),
      p("serpapi", "SerpApi", "search-api", "Search engine results API", "Trial credit recurring free tier নয়।"),
      p("firecrawl", "Firecrawl", "search-api", "Web crawling ও extraction", "Self-hosted/hosted plan আলাদা।"),
      p("jina", "Jina AI", "search-api", "Reader, embeddings ও reranking", "প্রতি endpoint-এর quota ও price যাচাই করতে হবে।"),
      p("google-grounding", "Google Search Grounding", "hosted-api", "Grounded model responses", "Model-specific grounding billing/quota যাচাই করতে হবে।"),
      p("you", "You.com", "search-api", "Search/research API", "API access ও plan entitlement যাচাই করতে হবে।"),
      p("duckduckgo", "DuckDuckGo", "search-api", "Search discovery", "Official supported API scope সীমিত; scraping নয়।"),
    ],
  },
  {
    id: "automation",
    name: "Automation ও Workflow",
    description: "Event-driven automation, scheduled jobs, connectors ও human approvals।",
    providers: [
      p("n8n", "n8n", "self-hosted", "Workflow automation", "Self-hosted community use ও license terms যাচাই করতে হবে।"),
      p("activepieces", "Activepieces", "self-hosted", "Open workflow automation", "Self-host/API edition এবং hosting যাচাই করতে হবে।"),
      p("node-red", "Node-RED", "self-hosted", "Flow-based integration", "Self-hosted runtime ও security hardening প্রয়োজন।"),
      p("windmill", "Windmill", "self-hosted", "Scripts ও workflows", "Self-hosted/hosted limits আলাদা।"),
      p("pipedream", "Pipedream", "hosted-api", "Developer workflow platform", "Free credits ও execution quota যাচাই করতে হবে।"),
      p("make", "Make", "hosted-app", "Visual automation", "Free operations limit ও API access যাচাই করতে হবে।"),
      p("zapier", "Zapier", "hosted-app", "No-code automation", "Free task limit; platform API access আলাদা।"),
      p("dify-workflow", "Dify Workflow", "self-hosted", "LLM workflow orchestration", "Self-hosting, connectors ও license review প্রয়োজন।"),
      p("flowise-workflow", "Flowise", "self-hosted", "Visual AI workflow", "Self-host/API and access control hardening প্রয়োজন।"),
      p("kestra", "Kestra", "self-hosted", "Orchestration ও scheduled workflow", "Self-hosted runtime, worker isolation ও secrets প্রয়োজন।"),
    ],
  },
  {
    id: "document-ocr",
    name: "Document AI ও OCR",
    description: "বাংলা OCR, PDF/DOCX extraction, forms, tables ও document parsing।",
    providers: [
      p("tesseract", "Tesseract OCR", "self-hosted", "Open-source OCR", "Bangla trained data ও quality benchmark প্রয়োজন।"),
      p("paddleocr", "PaddleOCR", "self-hosted", "OCR ও document recognition", "Bangla model/weights ও compute যাচাই করতে হবে।"),
      p("google-docai", "Google Document AI", "hosted-api", "Document extraction", "API billing ও free trial আলাদা যাচাই করতে হবে।"),
      p("azure-docintel", "Azure Document Intelligence", "hosted-api", "Forms ও document extraction", "Free tier, region ও Bengali support যাচাই করতে হবে।"),
      p("textract", "AWS Textract", "hosted-api", "Tables ও forms", "Free trial window বনাম recurring price আলাদা।"),
      p("tika", "Apache Tika", "self-hosted", "File text/metadata extraction", "OCR engine নয়; OCR pipeline-এর সঙ্গে যুক্ত করতে হবে।"),
      p("unstructured", "Unstructured", "self-hosted", "Document ingestion ও chunking", "Open-source core বনাম hosted API আলাদা।"),
      p("abbyy", "ABBYY", "hosted-api", "Enterprise OCR", "Commercial license/API pricing যাচাই করতে হবে।"),
      p("nanonets", "Nanonets", "hosted-api", "Intelligent document processing", "API access ও paid terms যাচাই করতে হবে।"),
      p("ocr-space", "OCR.space", "hosted-api", "OCR API", "Free request cap ও data retention policy যাচাই করতে হবে।"),
    ],
  },
  {
    id: "translation",
    name: "Translation ও Language AI",
    description: "বাংলা↔English translation, transliteration, language detection ও speech translation।",
    providers: [
      p("google-translate", "Google Translate API", "hosted-api", "Machine translation", "Paid billing; free quota ধরে নেওয়া যাবে না।"),
      p("deepl", "DeepL", "hosted-api", "Neural translation", "Bangla language coverage ও API plan যাচাই করতে হবে।"),
      p("amazon-translate", "Amazon Translate", "hosted-api", "Cloud translation", "Free tier window ও supported language যাচাই করতে হবে।"),
      p("libretranslate", "LibreTranslate", "self-hosted", "Open translation API", "নিজস্ব hosting/model availability প্রয়োজন।"),
      p("argos", "Argos Translate", "self-hosted", "Offline translation", "Bangla language pair availability benchmark করতে হবে।"),
      p("nllb", "Meta NLLB", "self-hosted", "Open multilingual translation model", "Model license, hardware ও Bangla quality যাচাই করতে হবে।"),
      p("seamless", "Meta SeamlessM4T", "self-hosted", "Speech/text translation", "Model license, hardware ও Bengali support benchmark করতে হবে।"),
      p("azure-language", "Azure AI Language", "hosted-api", "Language analysis", "Translator service থেকে আলাদা; feature support যাচাই করতে হবে।"),
      p("modernmt", "ModernMT", "hosted-api", "Adaptive translation", "Bangla availability ও API price যাচাই করতে হবে।"),
      p("microsoft-translator", "Microsoft Translator", "hosted-api", "Translation API", "Azure subscription, quota ও locale support যাচাই করতে হবে।"),
    ],
  },
  {
    id: "vector-knowledge",
    name: "Vector Search ও Knowledge Base",
    description: "RAG, semantic search, embeddings, document memory ও retrieval।",
    providers: [
      p("pgvector", "PostgreSQL pgvector", "database", "Vector search in existing Postgres", "Supabase PostgreSQL-এ pgvector 0.8.2 extension উপলভ্য; installation migration pending, পরে model-specific embedding ও vector index যোগ হবে।"),
      p("qdrant", "Qdrant", "self-hosted", "Vector database", "Self-hosted বা cloud quota আলাদা।"),
      p("chroma", "Chroma", "self-hosted", "Developer vector store", "Local/self-hosted deployment প্রয়োজন।"),
      p("weaviate", "Weaviate", "self-hosted", "Vector search engine", "Cloud plan ও self-hosted আলাদা।"),
      p("milvus", "Milvus", "self-hosted", "Scalable vector database", "Compute/storage operation প্রয়োজন।"),
      p("pinecone", "Pinecone", "hosted-api", "Managed vector database", "Free plan/limits ও storage pricing যাচাই করতে হবে।"),
      p("meilisearch", "Meilisearch", "self-hosted", "Hybrid search", "Vector feature ও hosting tier যাচাই করতে হবে।"),
      p("typesense", "Typesense", "self-hosted", "Search and vector retrieval", "Self-hosted/cloud feature parity যাচাই করতে হবে।"),
      p("elasticsearch", "Elasticsearch", "self-hosted", "Search ও vector retrieval", "License, cluster cost ও vector features যাচাই করতে হবে।"),
      p("vespa", "Vespa", "self-hosted", "Large-scale retrieval/ranking", "Operational complexity ও hosting প্রয়োজন।"),
    ],
  },
];

export const AI_HUB_READINESS_LABELS = {
  "directory-only": "তালিকাভুক্ত — সংযুক্ত নয়",
  "credential-needed": "Credential ও API test বাকি",
  "live-verified": "Live API যাচাইকৃত",
} as const;
