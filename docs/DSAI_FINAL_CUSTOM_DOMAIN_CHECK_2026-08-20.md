# DSAI Final Custom-Domain Check

**Checked:** 20 August 2026 (sandbox browser session)

The requested production URL `https://dsai.banglarvoice24news.com/` responded with a page titled `Error` and visible body text `Not Found`. This is direct evidence that the custom-domain production root is not currently serving the DSAI application. It does not prove that the managed preview is broken; the managed preview remains a separate environment. Final launch cannot be declared until DNS, reverse proxy/upstream, deployment release, SPA fallback, and health routes are verified on the requested domain.

The requested production URL `https://dsai.banglarvoice24news.com/auth/login` also responded with page title `Error` and visible body text `Not Found`. Therefore both the production root and the login history route currently fail at the custom-domain layer. OAuth callback/security code in the managed project cannot be treated as live on this domain until the upstream deployment and SPA fallback are corrected and rechecked.
