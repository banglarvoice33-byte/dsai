# Bangladesh payment integration research

**Scope:** Pro/Enterprise SaaS checkout for DSAI. This is implementation research, not legal or tax advice.

## Findings

| Source | Evidence | DSAI implication |
|---|---|---|
| bKash Payment Gateway terms | bKash documents Tokenized Checkout and states that payment-service terms, dynamic charging, merchant responsibilities, customer support and security/compliance information apply. | Use an official merchant/PGW agreement; do not implement personal-wallet collection as a substitute for an approved merchant flow. Do not store wallet PIN/OTP. |
| bKash Merchant Portal | Official portal provides merchant transaction management. | Merchant onboarding and reconciliation should be completed in the business/merchant account, not through a personal card or informal wallet. |
| SSLCOMMERZ API v4 | Official docs describe hosted/easy checkout, server-side session creation, IPN listener, transaction validation, success/fail/cancel URLs, risk fields, sandbox/live environments, and refunds. | A gateway aggregator can provide one adapter for cards, bank channels and supported mobile-wallet channels. Payment success must be verified server-side and IPN/webhook must be idempotent. |
| Bangladesh Bank Payment and Settlement Systems | Bangladesh Bank describes PSP/PSO licensing and payment-system oversight. | DSAI should use a licensed gateway/merchant acquirer rather than acting as an unlicensed payment intermediary. |
| NBR VAT eServices / VAT FAQ | NBR provides VAT e-services and states seller invoice responsibility; applicable VAT, BIN and invoice obligations depend on the business and transaction. | Configure legal seller identity, invoice number, tax treatment, refund policy and records with a Bangladeshi tax professional. Do not hardcode a VAT rate without confirming the product/entity facts. |

## Recommended product boundary

The public UI may show an Upgrade path to users who select Pro or Enterprise. It should not hide pricing or payment conditions from customers who need to make a purchase. A hosted checkout is preferred so card/wallet credentials stay with the licensed gateway. DSAI stores only an order ID, user ID, plan, amount/currency, provider transaction ID, status, timestamps, consent/terms version, and redacted reconciliation evidence.

## Minimum backend contract

`checkout.create` creates a server-priced order with a unique idempotency key. `checkout.start` creates the provider session. `payment.callback`/IPN validates the provider response and amount against the order. `payment.reconcile` queries the provider when the browser return is missing. `entitlement.grant` is triggered only after verified paid status. `refund.request` is admin-gated and records reason, actor, provider result and receipt. Duplicate callbacks must not grant duplicate entitlements.

## Controls

Never trust a client-provided price, plan, paid flag, redirect URL, or transaction status. Do not store raw card number, CVV, wallet PIN, OTP, or authentication cookies. Verify webhook signatures or provider validation responses, enforce timestamp/replay/idempotency controls, use a unique order reference, record provider event IDs, and expose a clear pending/failed/paid/refunded state. Add cancellation, refund, support contact, terms version, privacy notice and invoice/receipt access before launch.

## Two viable architectures

**Option A: licensed aggregator hosted checkout.** Use SSLCOMMERZ or another licensed aggregator whose current merchant agreement explicitly supports the required Bangladesh channels. This reduces the number of provider adapters and centralizes reconciliation, but adds gateway fees and onboarding dependency.

**Option B: direct official wallet merchant adapters.** Obtain approved bKash merchant/PGW credentials and separate approved integrations for Nagad/Rocket where available. This may provide channel-specific control but has more adapters, contracts, webhook differences and operational maintenance.

A decision requires merchant onboarding status, target channels, local entity/tax setup, refund policy, recurring-payment requirement, and provider sandbox access. No live payment integration should be enabled from screenshots, personal card details, or unverified credentials.

## References

[1]: https://www.bkash.com/en/page/tokenized_checkout "bKash Payment Gateway Terms & Conditions"
[2]: https://merchantportal.bkash.com/ "bKash Merchant Portal"
[3]: https://developer.sslcommerz.com/doc/v4/ "SSLCOMMERZ Integrate API v4"
[4]: https://sslcommerz.com/payment-gateway/ "SSLCOMMERZ Payment Gateway"
[5]: https://www.bb.org.bd/en/index.php/financialactivity/paysystems "Bangladesh Bank Payment and Settlement Systems"
[6]: https://nbr.gov.bd/faq/vat-faq/eng "NBR VAT FAQ"
[7]: https://nbr.gov.bd/taxtypes/vat-eservices/eng "NBR VAT eServices"
