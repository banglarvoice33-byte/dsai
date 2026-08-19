# World-Class AI Product Research Notes

## Official sources reviewed

1. OpenAI Help Center, “Projects in ChatGPT”: https://help.openai.com/en/articles/10169521-projects-in-chatgpt
2. Google Gemini Apps Help, “Upload & analyze files in Gemini Apps - Android”: https://support.google.com/gemini/answer/14903178?hl=en&co=GENIE.Platform%3DAndroid

## Findings

OpenAI’s Projects pattern groups conversations, reference files, custom instructions, saved responses, project memory, connected app links, and collaboration controls into a durable context hub. The user expectation is not only a one-off chat; it is continuity, reusable context, project-level instructions, and safe sharing/access control.

Google’s Android guidance treats upload and analysis as a first-class mobile workflow: signed-in users can add documents, spreadsheets, notebooks, photos, videos, device files, and Drive content, then request answers, summaries, and insights. It also makes limits, sign-in requirements, connected-app permissions, and data/activity controls visible. The user expectation is a clear upload affordance, mobile-friendly processing, supported-file boundaries, understandable limits, and data controls.

## DSAI comparison hypotheses to verify

DSAI is strong on Bengali-first discovery, human-gated language, privacy disclosure, PWA/offline foundations, safe OAuth continuation, admin connector visibility, and truthful capability boundaries. The highest likely gaps are a durable user workspace with reusable context, actual file upload/analysis, visible conversation or task history, user-controlled export/delete for generated work, clear usage/limit feedback, richer sources/citations for AI answers, and a tested authenticated end-to-end AI interaction. These must be checked against the current code before implementation.

## Additional official sources reviewed

3. OpenAI Help Center, “File Uploads FAQ”: https://help.openai.com/en/articles/8555545-file-uploads-faq
4. Google Gemini Apps Help, “Gemini Apps Privacy Hub”: https://support.google.com/gemini/answer/13594961?hl=en

OpenAI’s file-upload pattern is broader than simple chat: users expect synthesis, transformation, extraction, document comparison, spreadsheet analysis, and explicit support/size/rate limits. A premium assistant needs a clear file-processing contract and visible limits rather than an upload control that silently fails.

Google’s Privacy Hub makes data collection, connected-app exchange, configuration, retention, content removal, and export discoverable as separate user-facing topics. This indicates that privacy is an operational product surface: users expect to understand what is collected, how connected services are used, how long data is retained, and how to remove or export it.

## Additional DSAI comparison hypotheses

DSAI already has privacy policy and deletion-request foundations, but the cross-check suggests a need to make data lifecycle controls visible at the moment of upload/task creation, add a durable work history/project context model, expose processing limits before the user submits a file, and provide a clear export/delete action for generated work. A future connector system should also show exactly what data is shared and why before authorization.
