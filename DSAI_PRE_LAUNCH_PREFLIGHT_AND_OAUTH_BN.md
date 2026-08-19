# DSAI চালুর আগে Preflight ও OAuth Credential Map

## মেশিন চালুর নীতি

DSAI-কে একটি বহু-অংশের engine হিসেবে বিবেচনা করতে হবে। Production startup-এর আগে source/build, locked dependency, environment permission, database connectivity, session secret, CAPTCHA, OAuth callback, port ownership, local health, SPA history route, reverse proxy, TLS, backup/rollback এবং provider health আলাদা করে যাচাই করতে হবে। একটি layer সবুজ হলেও অন্য layer ব্যর্থ হতে পারে; তাই `/healthz` একা production readiness প্রমাণ করে না।

## কোন OAuth ব্যবহার হবে

DSAI account login-এর জন্য বর্তমান architecture-এর মূল credential হলো **Manus OAuth**: `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` এবং production callback `https://dsai.banglarvoice24news.com/api/oauth/callback`। Google বা HubSpot credential account login-এর বিকল্প নয়। এগুলো optional provider connector—Google Calendar/CRM বা HubSpot/CRM workflow-এর জন্য আলাদা consent ও provider allowlist প্রয়োজন।

Managed Manus project-এ কিছু environment name automatically injected থাকতে পারে, কিন্তু self-hosted VPS-এ সেগুলো transferable বা valid ধরে নেওয়া যাবে না। VPS-এ preflight command কেবল name/status দেখাবে; কোনো secret value প্রকাশ করবে না।

## Preflight command

```bash
cd /home/dulal_sarder90/dsai/current
node scripts/preflight-dsai.mjs /etc/dsai/dsai.env
```

Core contract fail করলে application start করা যাবে না। Optional Google/HubSpot/Forge group `gated` হলে DSAI safe fallback-এ থাকবে; configured দেখালেও provider OAuth, scope, callback, token revoke, health ও rollback test ছাড়া live action enable করা যাবে না।

## Sign-off matrix

| স্তর | প্রমাণ | ব্যর্থ হলে |
|---|---|---|
| Source/build | frozen install, typecheck, production build | release বন্ধ |
| Secrets | mode 600, required names present, no placeholder | fail closed |
| Database | migration ও read/write smoke test | service চালু নয় |
| Runtime | process supervision, port ownership, `/healthz` | rollback |
| SPA/proxy | `/auth/login` ও `/readyz` public response | Nginx সংশোধন |
| OAuth | exact callback, state/nonce, consent/revoke | provider gated |
| Provider connector | Google/HubSpot scope ও health evidence | connector disabled |
| Operations | logs, backup, restore, alert, rollback | controlled alpha |

**Current truth:** project-side preflight and provider-status tooling are implemented; live VPS, real OAuth consent/revoke, Google/HubSpot provider execution, database evidence, and custom-domain proxy verification remain operator gates.
