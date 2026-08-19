# DSAI Capability and Lawful Low-Cost Video Audit

## Executive assessment

DSAI is strongest today as a **Bengali-first, controlled-alpha Workdesk** for access workflows, reviewable Work Packets, lead planning, evidence-aware traces, scholarship review metadata, and preview-first creative planning. It is not yet a live government submission system, a live CRM/calendar writer, a fully connected OCR/file-processing platform, or a live media-generation worker. The capability ledger now makes those distinctions visible instead of allowing a preview surface to be mistaken for a production provider.

| Service area | Current quality | What is evidenced | Highest-value specialization |
|---|---|---|---|
| Public access and forms | Controlled alpha | Bengali routing, access cases, human review boundaries | Government-service explainer packets with source/evidence fields |
| Records and evidence | Foundation | Agent contracts, trace metadata, release gates | Agency-specific retention schedules and signed evidence bundles |
| Scholarship/public programs | Controlled alpha | Review queue, bounded entitlement, usage counters | Institution verification and fraud-resistant review operations |
| Private operations | Controlled alpha | Lead planner, durable traces, preview-first integration | Bengali/Banglish lead-to-Work-Packet workflow with explicit consent |
| Creative Studio | Preview-only | Independent media agents, safety/rights gates, cost policy | Bengali typography, source-rights, provenance, and human approval |
| Secure file services | Foundation | Quarantine/scan/lifecycle contracts and deletion evidence | Real scanner, OCR, object storage, and large-file worker adapters |

## File-service quality contract

Government and business document workflows should accept only declared formats and produce evidence-bearing outputs. The current contract distinguishes PDF, DOCX, XLSX, PPTX, image, and audio/video metadata from raw file bytes. Files must be quarantined before any downstream interpretation; scanner failure must fail closed; deletion must produce a tombstone and verifiable audit event; and consequential outputs must cite their source or explicitly say that source evidence is missing. The remaining quality gap is not a frontend feature: it is the provider-backed scanner, OCR, object-storage, retention scheduler, and isolated processing worker.

## What “zero-cost video” can honestly mean

There is no reliable universal zero-cost path for arbitrary high-quality video generation. A lawful cost-minimization design can, however, make **preview generation platform-cost-free to DSAI** when the operator uses a user-owned GPU, a permitted free-tier provider within its terms, or an open-source/self-hosted model on infrastructure already paid for. FFmpeg is an open-source media converter and can use hardware acceleration where the host supports it [1] [2]. These facts reduce marginal processing cost for encoding and preview assembly, but they do not make compute, storage, electricity, model weights, moderation, or support free.

The implemented policy therefore uses five controls. It limits a free preview to four seconds, 640×360, silent output, one retry, and no public/commercial release. It derives a deterministic cache key so identical jobs can be deduplicated. It selects immediate, micro-batch, or scheduled-batch processing based on queue length. It estimates cost units before approval. It rejects duration, resolution, audio, source, and prompt violations instead of silently increasing spend. Provider quota and billing remain explicit gates.

## Specialization opportunities

The most defensible specialization is a **Bengali evidence-to-action layer**: transform notices, forms, briefs, and operational requests into source-aware, reviewable Work Packets with Bengali/Banglish normalization, public/private policy templates, retention metadata, and human approval. A second specialization is a Bengali creative provenance layer that protects source rights, flags likeness and trademark risk, preserves prompt/model/source hashes, and forces review before public release. These are narrower and more defensible than claiming a generic all-purpose AI or an unverified free video platform.

## Research references

[1]: https://ffmpeg.org/ffmpeg.html "FFmpeg Documentation"

[2]: https://docs.nvidia.com/video-technologies/video-codec-sdk/13.1/ffmpeg-with-nvidia-gpu/index.html "NVIDIA FFmpeg Hardware Acceleration Guide"

[3]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"

[4]: https://www.nist.gov/privacy-framework "NIST Privacy Framework"
