# DSAI Creative Generation Research

## Architecture findings

OpenAI's current image-generation documentation distinguishes single-shot Image API generation/editing from Responses API multi-turn image workflows. The architecture implication for DSAI is to normalize a creative brief first, preserve the source/reference asset contract, and select a provider adapter based on whether the job is a one-shot render or an iterative edit [1].

Google's Gemini video documentation describes separate video workflows, including a faster multimodal default and a higher-capability Veo path for features such as scene extension, last-frame control, and native audio. DSAI should represent these as provider/model capabilities rather than hardcoding one vendor or promising all features in the UI [2].

C2PA Content Credentials provide an open standard for recording the origin and edit history of digital content. DSAI should produce a provenance manifest for every generated or edited asset, including source checksum, prompt/brief hash, provider/model version, safety result, timestamp, and review decision; embedding signed C2PA credentials remains a provider/storage integration step [3].

## Required controls

| Control | Image | Text-to-video | Image-to-video |
|---|---:|---:|---:|
| Normalized Bengali/Banglish brief | Required | Required | Required |
| Source rights declaration | Required for references | Required for supplied assets/audio | Required and enforced |
| Safety check | Required | Required for visual/audio/likeness | Required for source and motion |
| Preview-first approval | Required | Required | Required |
| Cost/duration budget | Credit and resolution budget | Duration/frame/audio budget | Duration/frame/source budget |
| Provenance | Prompt/model/output hash | Storyboard/model/output hash | Source/output/hash chain |
| Human review | Public/commercial release | Public/commercial/audio/likeness release | Public/commercial/likeness release |

## References

[1]: https://developers.openai.com/api/docs/guides/image-generation "OpenAI Image Generation Guide"

[2]: https://ai.google.dev/gemini-api/docs/video "Google Gemini API Video Generation"

[3]: https://c2pa.org/ "Coalition for Content Provenance and Authenticity"
