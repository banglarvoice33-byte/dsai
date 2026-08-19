# DSAI governance, authority ও license audit

**প্রস্তুতকারী:** Manus AI  
**তারিখ:** 19 August 2026  
**স্থিতি:** Product governance documentation; এটি formal legal advice নয়। Jurisdiction-specific company, copyright, contract, tax, privacy ও licensing সিদ্ধান্তের আগে qualified counsel review প্রয়োজন।

## Executive finding

DSAI-এর public product boundary, privacy disclosures, human-approval rules, evidence ledger এবং operator-gated release language ইতোমধ্যে যুক্ত আছে। নতুন public `/governance` page brand, code, architecture, user input, AI-assisted output, open-source dependency এবং operator authority আলাদা করেছে। তবে **website copy নিজে legal company ownership তৈরি করে না**, এবং repository-এর current `package.json`-এ `license: MIT` আছে। তাই release owner যদি source-কে proprietary বা exclusive হিসেবে ব্যবহার করতে চান, final distribution license review এবং explicit repository notice এখনো operator/legal action। এই audit কোনো ownership transfer বা valuation guarantee নয়।

## Authority matrix

| বিষয় | বর্তমান product evidence | Final authority কার হাতে | Gap |
|---|---|---|---|
| Brand ও domain | DSAI public brand, domain route, contact mailbox | Legal owner/entity ও account owner | Domain registrar/business records confirm করতে হবে |
| Source code | Git/project files, release archive, checkpoint history | Repository owner এবং authorized technical maintainer | Contributor agreement ও final license notice দরকার |
| Architecture | Router, schema, traces, release gates, deployment docs | Designated technical authority | Named owner/backup operator records দরকার |
| User content | Privacy page ও governance boundary | User/customer contract ও applicable law | Formal customer terms দরকার |
| AI-assisted output | Human review ও rights review language | User contract, provider terms, jurisdiction | Output-specific rights policy দরকার |
| Third-party software | `pnpm-lock.yaml`, package metadata ও dependency graph | Each upstream license holder; DSAI distributor for compliance | Automated SPDX inventory/NOTICE workflow দরকার |
| Production operations | Admin routes, traces, health/release contracts | Authorized operator/admin | Real VPS evidence, MFA, backup drill, secret rotation pending |

## Current package-license finding

The current package metadata declares `MIT`. MIT is an open-source license, so the DSAI team should not simultaneously describe the complete source distribution as “exclusive proprietary code” without resolving the license decision. This does not determine ownership of every upstream dependency or user-generated asset. Before public source distribution, the owner should choose one of the following reviewed positions: keep MIT and publish the required notice; change the project license after counsel/owner approval; or keep the source private and publish only a controlled binary/service contract. The choice must be reflected consistently in `package.json`, repository notices, release archives, contributor terms and public copy.

## AI output and rights boundary

WIPO describes AI and IP as an evolving policy area involving authorship, rights management, attribution, consent and compensation across jurisdictions [1]. The U.S. Copyright Office separately examines copyrightability of generative-AI outputs and the role of human contribution [2]. DSAI therefore must not promise that every AI-assisted output is copyright-protected, exclusive, unique or free of third-party claims. Human selection, editing, arrangement, source permission, provider terms and provenance evidence remain material.

## Open-source compliance boundary

OSI describes approved open-source licenses as licenses that permit software to be used, modified and shared subject to the license terms [3]. DSAI must maintain a dependency inventory, preserve required notices, identify reciprocal obligations, and avoid treating package installation as proof of commercial redistribution clearance. The production archive currently excludes secrets and runtime state, but a full automated SPDX/NOTICE report is a separate compliance enhancement.

## Governance boundary

NIST AI RMF is a voluntary framework for incorporating trustworthiness considerations into the design, development, use and evaluation of AI systems [4]. DSAI maps this principle into human approval, redaction-first traces, release gates, provider consent, privacy deletion contracts and explicit capability status. These controls are engineering evidence, not a government certification or legal safe harbor.

## Institutional readiness verdict

DSAI is **governance-aware and artifact-ready**, not yet a legally complete institution or fully verified self-hosted production company. The remaining institutional actions are to identify the legal entity and beneficial owner, document technical authority and succession, choose the final source-license position, create customer/provider terms, confirm domain/mailbox ownership, execute real VPS/database/proxy/backup/OAuth evidence, and maintain a dependency license notice process. A billion-dollar valuation cannot be inferred from architecture or visual quality; value must be demonstrated by customer outcomes, retention, lawful economics, reliability evidence and durable governance.

## References

[1]: https://www.wipo.int/en/web/frontier-technologies/artificial-intelligence/index "WIPO — Artificial Intelligence and Intellectual Property"

[2]: https://www.copyright.gov/ai/ "U.S. Copyright Office — Copyright and Artificial Intelligence"

[3]: https://opensource.org/licenses "Open Source Initiative — OSI Approved Licenses"

[4]: https://www.nist.gov/itl/ai-risk-management-framework "NIST — AI Risk Management Framework"
