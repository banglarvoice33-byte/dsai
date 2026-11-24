# Decisions

- Preserve the existing React/Vite, Wouter, Express/tRPC, PostgreSQL/Drizzle and Vercel gateway architecture.
- Preserve /workspace, /ai-hub, /documents, /admin and existing task APIs.
- Treat PR #144 as the existing Work Desk baseline; do not duplicate its chat-first composer, upload/quarantine, queue or history.
- Preserve all 14 categories and 140 catalog entries; no artificial quota padding.
- Distinguish external website listings from DSAI runtime connectors.
- Runtime setup capability is sourced from AI_HUB_CONNECTOR_SETUP_IDS, currently OpenRouter and Gemini; do not imply every listed provider can execute in DSAI.
- Search is keyword-based with curated Bangla/Banglish aliases, not semantic AI search.
- Home page gets an explicit bilingual AI Hub route and search entry.
- No production database mutation, paid provider activation, billing change or production deployment is included in this branch.
