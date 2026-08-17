# DSAI Student Scholarship Privacy Research Notes

This note records design principles for a global Bengali-speaking student Pro scholarship. It is not legal advice and does not establish compliance in every country.

## Findings

The U.S. Federal Trade Commission states that COPPA applies to operators of websites or online services directed to children under 13 that collect personal information, requiring parental-consent and related safeguards. DSAI should therefore avoid targeting children under 13 unless a separate child-safety and parental-consent program is designed.

The U.S. Department of Education student-privacy guidance emphasizes careful handling of personally identifiable information from education records. DSAI should request only the minimum proof needed, avoid storing full student documents by default, and use a manual review process with restricted access.

A privacy-preserving scholarship design should separate eligibility evidence from the user account, store a one-way verification reference or provider assertion where possible, apply short retention, redact reviewer notes, and provide deletion/appeal pathways. A “high defense” strategy should be layered and risk-based rather than claiming perfect exclusion of non-students: account authentication, one-per-person controls, rate limits, duplicate detection, proof-of-enrollment or institutional email where appropriate, manual review for uncertain cases, and audit logs.

## Design implications for DSAI

The first release should be 18+ or explicitly exclude under-13 applicants, use admin approval, limit the program to 100 approved entitlements, and grant a non-renewing 30-day window. It should not require a government ID or collect grades. The application should disclose what is collected, why, retention, reviewer access, appeal and deletion rights. Any future age group expansion requires a fresh privacy and child-safety review.

## Sources

1. FTC, Children’s Online Privacy Protection Rule: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule
2. U.S. Department of Education, Protecting Student Privacy guidance: https://studentprivacy.ed.gov/guidance
3. GDPR Recital 64 identity verification principle: https://gdpr-info.eu/recitals/no-64/
