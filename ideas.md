# GENESIS Website Design Brief

## Three stylistic approaches

### Theme Name: Civic Signal
Very Brief Intro: A warm editorial interface inspired by public-service wayfinding, field notebooks, and trustworthy civic infrastructure. It makes complex AI capability feel calm, legible, and human.
Probability: 0.04

### Theme Name: Quiet Instrument
Very Brief Intro: A restrained studio aesthetic built around paper-white surfaces, precise typography, and a single mineral accent. It positions GENESIS as a dependable tool rather than a spectacle.
Probability: 0.08

### Theme Name: Signal Garden
Very Brief Intro: A luminous, nature-adjacent digital system where language, memory, and access are represented as branching paths and soft signal fields. It feels optimistic without becoming playful or childish.
Probability: 0.03

## Chosen approach: Civic Signal

### Design Movement
Contemporary civic modernism blended with Swiss editorial information design and South Asian print culture. The interface should feel like a well-designed public service desk translated into a premium digital product.

### Core Principles
1. **Trust before spectacle:** generous white space, high legibility, clear labels, and visible safety boundaries.
2. **Human-scale systems:** show how UAA, Creative Studio, memory, and fair-use economics connect without overwhelming visitors.
3. **Warm precision:** use measured geometry and editorial rhythm, softened by clay, saffron, and ink-black accents.
4. **Bengali dignity:** Bengali copy is authored as product language, not treated as a secondary translation layer.

### Color Philosophy
The signature color is **Terracotta Signal** (`#C85A3F`), a grounded clay-red that suggests action, warmth, and human craft. It is paired with deep ink (`#18211F`), parchment (`#F5F1E8`), quiet sage (`#D8E0D3`), and brass (`#D6A84F`). The palette avoids default tech blue and purple so the product reads as civic infrastructure with a human center.

### Layout Paradigm
Use an editorial split layout rather than a centered hero. The opening viewport places a text-led statement on the left and a layered “service map” visualization on the right. Sections alternate between wide bands and offset columns. Content is organized as a guided field guide: promise, proof, pathways, economics, safeguards, and invitation.

### Signature Elements
1. A persistent terracotta “signal line” that travels between section markers and illustrates continuity of care.
2. Offset cards with small index labels such as `01 / ACCESS`, `02 / CREATE`, and `03 / TRUST`.
3. A service-map motif using branching lines, small nodes, and Bengali/English labels to visualize language and workflow continuity.

### Interaction Philosophy
Interactions should feel like opening a well-made folder or following a wayfinding marker: deliberate, responsive, and informative. CTAs use direct language. Tabs, toggles, and cards reveal practical detail without hiding important caveats. All placeholder actions show a clear “coming next” state rather than pretending backend functionality exists.

### Animation
Use short, confident transitions under 300ms. On entry, stagger section labels and major cards by 50ms. The signal line can draw in once on first visit, but motion must stop under `prefers-reduced-motion`. Hover states should slightly lift cards and sharpen the terracotta border; no floating neon glow or excessive parallax.

### Typography System
Use **Fraunces** for large English display headlines and **Noto Serif Bengali** for Bengali display copy. Use **DM Sans** for interface labels and body text, with **Noto Sans Bengali** for Bengali UI copy. Headlines are tight and editorial; labels are uppercase or small-caps in English and compact, high-contrast Bengali for local content. Never use Inter.

### Brand Essence
GENESIS is a Bengali-first AI access and creative platform for people who need useful intelligence without cloud-first dependency, hidden claims, or opaque economics. Personality: **grounded, generous, exacting**.

### Brand Voice
Headlines are clear and quietly ambitious. CTAs are specific and action-oriented. Microcopy explains limits without sounding apologetic or legalistic.

Example lines:
- “AI that helps you move through the real world.”
- “Create more. Promise less. Show the work.”

### Wordmark & Logo
Use a bold symbol built from two interlocking paths: one terracotta path for access and one sage path for creation, joined by a small brass node. The mark should work as a standalone favicon and as a compact emblem beside the GENESIS wordmark. The wordmark uses a custom-spaced serif/sans pairing, not a default font treatment.

### Signature Brand Color
**Terracotta Signal — #C85A3F**

## Page architecture

The website is a single-page product narrative with anchor navigation and progressive disclosure. It includes:

1. Header with GENESIS mark, Bengali/English language toggle, anchor links, and primary CTA.
2. Hero with the main promise, two product pathways, explicit “not crypto mining” trust note, and service-map visual.
3. “One platform, two kinds of access” section for UAA and Creative Studio.
4. Workflow section showing Intake → Understand → Review → Act.
5. Creative Studio section with fair-use tiers and provenance disclosure.
6. Trust architecture section showing Memory, Human Review, Privacy, and Cost Governor.
7. Economics section explaining how paid creative usage supports affordable access without earnings promises.
8. FAQ with safety and capability boundaries.
9. Final CTA and compact footer with legal and policy links.

## File-specific style reminders

- `client/src/App.tsx`: Keep the site as a focused public-facing narrative with anchor navigation and no dead-end routes.
- `client/src/pages/Home.tsx`: Use Civic Signal composition: editorial split hero, offset sections, index labels, service-map motifs, and Bengali-first copy.
- `client/src/index.css`: Define Terracotta Signal, parchment, ink, sage, brass, typography, paper texture, focus states, signal-line motion, and reduced-motion rules.
- `client/index.html`: Load Fraunces, DM Sans, Noto Serif Bengali, and Noto Sans Bengali; set `lang="bn"` and update metadata for GENESIS.

## Product content boundaries

The site must not claim Bitcoin mining, guaranteed income, unlimited generation, certified translation, professional replacement, or autonomous high-risk action. It should explicitly describe the lawful MVP as a service-access and creative platform with fair-use economics and a non-crypto companion concept only as a future, legally reviewed possibility.
