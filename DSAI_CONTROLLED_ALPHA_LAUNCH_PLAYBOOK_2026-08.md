# DSAI Controlled-Alpha Launch Playbook

**Prepared by Manus AI · August 2026**

## Launch position

DSAI-এর প্রথম বাজার-পরিচয় হবে **Bengali-first accountable AI Workdesk**। Launch-এর প্রধান promise হবে: বাংলা, Banglish এবং English-এর জটিল request-কে source, uncertainty, human review এবং next action-সহ একটি Work Packet-এ রূপান্তর করা। এটি “সবচেয়ে দ্রুত”, “সবার সেরা”, “fully autonomous” বা guaranteed income-এর claim নয়।

Google Search Central people-first, original এবং useful content-এর উপর জোর দেয় [1]। NIST trustworthy AI-তে governance, measurement এবং risk management-এর ধারাবাহিকতা চায় [2]। FTC paid endorsement ও influencer relationship-এর clear disclosure এবং fake review এড়ানোর guidance দেয় [3]। তাই DSAI-এর promotion system-এর মূলনীতি হবে: **প্রমাণ আগে, প্রচার পরে; উপকারী content আগে, search manipulation নয়; disclosure ছাড়া referral নয়।**

## Launch funnel

| ধাপ | User experience | প্রধান asset | মাপার metric |
|---|---|---|---|
| শেখা | Bengali utility guide, clear limits, privacy explanation | Learn, Developer, Privacy, short guide | engaged visit, guide completion |
| দেখা | Product demo, Platform architecture, Evidence ledger | `/platform`, `/evidence`, changelog | demo-to-workspace click |
| চেষ্টা | Controlled-alpha narrow task | Workspace, Work Packet, quota notice | packet start rate |
| প্রমাণ | human review, source/evidence, export | Review Contract, export, feedback | useful draft, approval, export success |
| ফিরে আসা | next action, saved work, relevant update | Workspace history, notification roadmap | repeat packet rate, retention |
| সুপারিশ | consented referral or community share | referral disclosure and policy | qualified referral, abuse rate, net revenue |

## Audience sequencing

প্রথম cohort একসঙ্গে “সব Bengali speaker” হওয়া উচিত নয়। প্রথমে দুটি narrow segment নির্বাচন করতে হবে। Student workflow-এ scholarship/application preparation, research outline বা document planning-এর মতো bounded task নেওয়া যায়। Professional workflow-এ structured brief, source-first research বা document-to-action planning নেওয়া যায়। প্রতিটি cohort-এ onboarding, packet completion, correction burden, support load এবং repeat use মাপা হবে। Evidence ছাড়া নতুন segment বা paid campaign scale করা হবে না।

## Promotion assets

Public launch-এর জন্য homepage, Learn, Method, Evidence, Platform, Privacy, Changelog ও Developer pages হলো core proof set। এর বাইরে চার ধরনের asset তৈরি করা উচিত: Bengali workflow tutorials, 60–90 second product walkthroughs, founder/operator explanation of limits and privacy, এবং anonymized aggregate progress updates। কোনো asset-এ fabricated user count, fake testimonial, invented rating বা unverified outcome ব্যবহার করা যাবে না। Real customer story প্রকাশের আগে written consent, scope, editing approval এবং withdrawal path থাকতে হবে।

## Channel plan

Bengali utility content হবে long-term organic engine। প্রতিটি content page একটি বাস্তব user question-এর complete answer দেবে এবং প্রয়োজনে একটি Work Packet template-এ নিয়ে যাবে। Community pilots-এর জন্য universities, professional communities, diaspora groups এবং small teams-এ workshop করা যেতে পারে; workshop participant-এর private data public marketing-এ ব্যবহার করা যাবে না। Founder/operator voice দিয়ে কী live, কী provider-gated, কীভাবে human review কাজ করে তা ব্যাখ্যা করতে হবে। Creator partnerships চালু হলে paid relationship, commission বা free access স্পষ্টভাবে Bengali ও platform-appropriate disclosure-এ জানাতে হবে [3]।

Paid acquisition প্রথম পর্যায়ে নয়। আগে organic and community cohort থেকে baseline conversion, completion, retention, support load ও contribution margin জানা দরকার। তারপর একটি narrow campaign-এ small budget, holdout comparison, frequency cap, landing-page experiment এবং kill threshold ব্যবহার করতে হবে। “More impressions” success নয়; qualified Work Packet completion এবং repeat value success।

## Measurement contract

| Metric | Definition | Decision use |
|---|---|---|
| Guide completion | Useful guide-এর শেষ অংশে পৌঁছানো consented session ratio | Content improve বা retire |
| Workspace start | Public route থেকে authenticated workspace intent | Funnel friction শনাক্ত |
| Useful draft | User বা reviewer-এর rubric অনুযায়ী usable draft | Core value |
| Source coverage | Evidence-backed claim / assessed claim | Trust quality |
| Human correction | Review-এ substantive correction-এর ratio | Model/prompt/workflow improve |
| Export/delete success | Requested operation successfully completed / total requests | Privacy reliability |
| Repeat packet rate | First completed packet-এর পরে defined window-এ second packet | Retention signal |
| Contribution margin | Revenue minus model, storage, review, support, payment and abuse cost | Paid scaling gate |
| Referral quality | Qualified consented referral that reaches defined outcome | Partner economics |

Analytics should minimize data, avoid storing raw private prompt/document content unless explicitly required and consented, and never expose user ID, IP address or device fingerprint in public reports. Search analytics should remain aggregate and privacy-aware.

## 30/60/90-day calendar

**Days 0–30: prepare and prove the funnel.** Finalize narrow cohort, campaign copy, support answers, privacy language, analytics definitions, referral disclosure, incident contacts and rollback plan. Invite a small controlled group. Watch auth failures, packet completion, export/deletion, scan verdict, support questions and mobile friction.

**Days 31–60: deepen one workflow.** Run one student and one professional cohort with human review. Publish only aggregate evidence after consent and review. Compare guide-to-workspace conversion, useful-draft rate, correction burden, repeat packet rate, support load and contribution margin. Stop or redesign workflows that do not show repeat value.

**Days 61–90: scale carefully.** Test one community partnership and one small paid campaign only if baseline evidence is stable. Enforce referral disclosure, refund adjustment, abuse review and payout hold. Run provider outage, deletion failure, OAuth failure and restore drills. Use SLO/error-budget status to decide whether to scale promotion or invest in reliability.

## Risk controls

Launch must pause if production environment validation fails, HTTPS/OAuth verification fails, readiness is unhealthy, backup/restore is unknown, raw private data appears in public analytics, an endorsement is undisclosed, or a campaign claim lacks evidence. Promotion must also pause when support load, abuse, refund rate, contribution margin or reliability crosses an operator-defined threshold.

## Recommended launch statement

> **DSAI হলো বাংলা-first controlled-alpha AI Workdesk—যেখানে জটিল request একটি source-aware, editable এবং human-reviewed Work Packet-এ রূপ নেয়।**

The statement is specific, testable and aligned with the implemented product. It does not imply live messaging, autonomous booking, guaranteed income, universal superiority or production provider activation.

## References

[1]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content "Google Search Central: Creating helpful, reliable, people-first content"
[2]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"
[3]: https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews "FTC: Endorsements, Influencers, and Reviews"
