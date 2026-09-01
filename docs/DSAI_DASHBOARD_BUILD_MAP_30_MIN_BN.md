# DSAI Dashboard Build Map — ৩০ মিনিটের Design-to-Build Plan

## উদ্দেশ্য

এই build map-এর লক্ষ্য হলো DSAI-এর operational dashboard-কে এমনভাবে সাজানো, যাতে ব্যবহারকারী প্রথম ৩০ সেকেন্ডে সিস্টেমের অবস্থা, নিজের পরবর্তী কাজ এবং কোন capability বাস্তবে চালু—তা বুঝতে পারেন। Dashboard-এর visual language হবে **Tactile Kinetic**: অন্ধকার editorial canvas, উষ্ণ parchment surface, terracotta action accent, restrained depth, এবং motion যা তথ্যকে পরিষ্কার করে কিন্তু বিভ্রান্ত করে না।

> Premium মানে শুধু বেশি gradient বা বেশি animation নয়। Premium outcome হবে দ্রুত বোঝা যায় এমন hierarchy, বিশ্বাসযোগ্য status language, consistent spacing, responsive behavior, এবং এমন motion যা ব্যবহারকারীর action-কে সহায়তা করে।

## ৩০ মিনিটের build sequence

| সময় | Build focus | বাস্তব deliverable |
|---|---|---|
| ০–৫ মিনিট | Shell, hierarchy, dark theme | Persistent sidebar/topbar, page title, Bengali-first labels, theme tokens, responsive container |
| ৫–১০ মিনিট | Capability pulse | Live/foundation/preview/gated counts, health strip, latest signal card |
| ১০–১৬ মিনিট | Operational cards | Operator queue, release-gate status, management-surface links, evidence freshness |
| ১৬–২২ মিনিট | Charts and data views | Capability distribution, route/lead activity trend, provider readiness bars; no fabricated customer metrics |
| ২২–২৬ মিনিট | Interaction polish | Hover depth, keyboard focus, loading skeletons, empty/error states, reduced-motion fallback |
| ২৬–৩০ মিনিট | Verification pass | Desktop/mobile layout, contrast, route access, admin role boundary, no-hidden-success review |

## Layout map

Dashboard-এ প্রথম row-তে চারটি summary signal থাকবে: **বর্তমান সিস্টেম অবস্থা**, **বাস্তবে চালু capability**, **operator action count**, এবং **evidence freshness**। দ্বিতীয় row-তে capability pulse ও latest signal পাশাপাশি থাকবে। তৃতীয় row-তে operator queue এবং public-edge/OAuth/provider gate status থাকবে। নিচের অংশে activity/evidence table থাকবে, যাতে প্রতিটি claim-এর পাশে source বা verification status থাকে।

| Zone | Purpose | Visual treatment | Mobile behavior |
|---|---|---|---|
| Header | Identity, current workspace, theme, help | Low-height dark bar, one primary action | Compresses to title + menu |
| Capability pulse | What is live versus gated | Four compact metric cards with status chips | Two-column grid |
| Latest signal | Most recent verified event | Large tactile card with timestamp and provenance | Full-width card |
| Operator queue | What still needs action | Ordered queue with severity and next action | Stacked cards, no horizontal scroll |
| Evidence table | Why a status is shown | Dense but readable rows, source/status columns | Cards with disclosure details |
| Management links | Navigate to admin controls | Explicitly role-gated, never implied as live | Hidden or replaced with sign-in state for user APK |

## Chart map

Charts must communicate operational truth, not create decorative certainty. The dashboard should prefer small, legible visualizations over dense BI panels. Any value that is not backed by an authoritative project or remote source must be labeled as unavailable rather than replaced by a made-up number.

| Chart | Data source | Decision it supports | Status rule |
|---|---|---|---|
| Capability distribution | `shared/capabilityMatrix.ts` | How much is live, foundation, preview, gated, or roadmap | Always authoritative and deterministic |
| Evidence freshness | Deployment/evidence records | Whether a status is recent enough to trust | Show timestamp and stale state |
| Operator queue severity | Remote gate report when available | Which action should happen first | Pending is not failure; failure is not success |
| Lead composer activity | Real persisted lead events only | Whether the workflow is being used | Empty state when no real events exist |
| Provider readiness | Connector/provider health evidence | Which external capability can be activated | “Not configured” rather than zero |

## Dark mode and design tokens

Dark mode should use a near-black green-charcoal background rather than pure black, because the product’s tactile surfaces need a small luminance range for depth. Cards use a warm off-white or muted olive surface only where a reading surface is required. Terracotta remains the action color; muted gold is reserved for evidence and attention; signal green is reserved for confirmed healthy states.

| Token role | Suggested value | Usage |
|---|---|---|
| Canvas | Deep green-charcoal | Page background and navigation |
| Surface | Warm parchment / muted olive | Cards and reading panels |
| Primary accent | Terracotta | Primary CTA and active route |
| Evidence accent | Muted gold | Verified evidence and attention |
| Healthy state | Restrained signal green | Confirmed health only |
| Warning state | Warm amber | Pending operator action |
| Failure state | Controlled red | Confirmed failure, never generic uncertainty |
| Text | Warm white / dark charcoal | Maintain contrast on paired surfaces |

## Interaction and micro-motion rules

Motion should be snappy and physically plausible. Buttons may compress slightly on press, cards may lift by a few pixels on hover, and status changes may fade or slide into place. Loading should use branded skeleton geometry that reflects the final layout. Reduced-motion users receive the same information without orbit motion, parallax, or non-essential transitions.

The dashboard must not use motion to imply a live event that has not been measured. A “pending” queue item may pulse only as an attention cue; it must not animate like a successful process. All keyboard focus states remain visible, and every chart has a text summary or accessible label.

## Honest premium outcome

After a focused ৩০-minute build, the realistic outcome is a **strong premium alpha dashboard**, not a finished enterprise observability platform. The layout can look deliberate and high-quality because the hierarchy, spacing, typography, status semantics, and tactile surfaces are controlled. The charts can be useful if they are bound to authoritative project data. However, remote deployment evidence, provider telemetry, real user volume, authenticated role testing, and field-device performance cannot be created by styling. Those remain explicit gates.

| Quality dimension | Expected result after this build | What is not claimed |
|---|---|---|
| Visual polish | Distinctive Bengali-first Tactile Kinetic identity with coherent depth | No claim of agency-level art direction across every breakpoint |
| Information clarity | A user can identify live, pending, and gated states quickly | No claim that remote data is complete without evidence |
| Interaction quality | Responsive cards, focus states, skeletons, and reduced-motion behavior | No claim of exhaustive device/browser coverage |
| Operational usefulness | Clear next actions and provenance-aware status | No claim of production SLO monitoring unless connected |
| Store readiness | User APK can load the configured web origin | No claim of Play Store release signing or listing approval without keystore and Play evidence |

## Acceptance checklist

A dashboard build is accepted when its route loads, its status values match the authoritative capability matrix, charts do not fabricate activity, dark mode preserves readable contrast, mobile layout avoids clipped content, loading/error/empty states are explicit, admin controls remain role-gated, and the user-facing Android wrapper cannot navigate into operator routes. The final review must state which items were browser-verified, test-verified, provider-gated, or remote-only.
