# DSAI Production Authentication Setup

## Authentication model

- Supabase Auth is the single account identity provider.
- Email + password sign-in is supported.
- Permanent accounts require verified email before protected account APIs; anonymous guest sessions are limited to the guest workspace and image pipeline.
- Anonymous sessions are supported for temporary guest access; persistent accounts use verified email/password.
- The application API validates Supabase access tokens against the Supabase Auth /user endpoint and maps verified identities to public.users using openId = supabase:<auth-user-uuid>.
- Image generation, history, and downloads use the same verified Supabase account.

## Required Supabase Dashboard configuration

In project wleytsrflhboyevhigiu:

1. Authentication → URL Configuration
   - Site URL: https://dsai-one.vercel.app
   - Redirect URL allowlist: https://dsai-one.vercel.app/auth/login
2. Authentication → Sign In / Providers
   - Enable Email provider.
   - Keep email confirmations enabled.
   - Enable Anonymous Sign-Ins for guest image generation. Supabase's IP-based rate limit is 30 requests/hour by default; enable Supabase CAPTCHA with Cloudflare Turnstile before broad public launch to reduce bot-created accounts.
3. Authentication → Bot and Abuse Protection\n   - Enable CAPTCHA protection and select Cloudflare Turnstile.\n   - Use a site key for dsai-one.vercel.app and store the secret only in Supabase Auth settings.\n   - Add Vercel Production and Preview variables: VITE_CAPTCHA_SITE_KEY (site key), CAPTCHA_SECRET_KEY (secret), CAPTCHA_ALLOWED_HOSTNAME=dsai-one.vercel.app, and CAPTCHA_ENABLED=true. Never expose CAPTCHA_SECRET_KEY in client code.\n4. Authentication → SMTP Settings
   - Configure a production custom SMTP provider.
   - Use a sender address on a domain you control and have verified with the email provider.
   - Verify SPF/DKIM (and DMARC where available) before inviting public users.
   - Do not paste SMTP passwords or API keys into GitHub or the browser.

Supabase's built-in email sender is not suitable for public production signups: it is rate-limited to 2 emails/hour and restricts delivery to project organization members. Custom SMTP is required for normal public email verification and password recovery. Anonymous guest access does not require email, but it is temporary and tied to that browser's session; users should create a verified account for persistent access.

## Initial admin account

1. Create an account at https://dsai-one.vercel.app/auth/login.
2. Complete the email verification link.
3. Confirm that the user appears in auth.users with a non-null email_confirmed_at.
4. Promote only the intended owner account by matching its Supabase UUID:

```sql
select id, email, email_confirmed_at
from auth.users
where lower(email) = lower('ADMIN_EMAIL');

-- After verifying the exact UUID and email:
update public.users
set role = 'admin'
where "openId" = 'supabase:AUTH_USER_UUID';
```

Do not grant admin based only on a user-supplied email string in client code.

## Production acceptance checklist

- [ ] Public user can sign up with email/password.
- [ ] Confirmation email is delivered to an external address.
- [ ] Confirmation callback returns to /auth/login and creates a valid session.
- [ ] Verified user can sign in after a page refresh.
- [ ] Anonymous guest users can generate images but cannot access admin procedures.\n- [ ] Unverified email users are rejected by protected APIs.\n- [ ] CAPTCHA prevents automated anonymous account creation.
- [ ] Non-admin users cannot open the operator console or execute admin procedures.
- [ ] Intended admin account can open the operator console.
- [ ] Image generation reserves quota before provider calls and refunds failed attempts.
- [ ] Per-user limit is 2 successful images per Bangladesh calendar day (Asia/Dhaka).
- [ ] Global capacity is 500 distinct accounts per Bangladesh calendar day (Asia/Dhaka).
- [ ] Generated images are private in Supabase Storage; preview and download URLs are short-lived.