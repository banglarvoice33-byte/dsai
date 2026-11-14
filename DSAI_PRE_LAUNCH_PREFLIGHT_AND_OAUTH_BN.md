# DSAI চালুর আগে Preflight ও OAuth Credential Map

## মেশিন চালুর নীতি

DSAI-কে একটি বহু-অংশের engine হিসেবে বিবেচনা করতে হবে। Production startup-এর আগে source/build, locked dependency, environment permission, database connectivity, session secret, CAPTCHA, Supabase Auth redirect, optional legacy OAuth callback, port ownership, local health, SPA history route, reverse proxy, TLS, backup/rollback এবং provider health আলাদা করে যাচাই করতে হবে। একটি layer সবুজ হলেও অন্য layer ব্যর্থ হতে পারে; তাই `/healthz` একা production readiness প্রমাণ করে না।

## Authentication ও legacy Manus dependency

DSAI-এর বর্তমান primary account identity provider হলো **Supabase Auth**। Email/password signup ও login, email confirmation, session refresh এবং logout Supabase Auth client দিয়ে পরিচালিত হয়। Production login-এর জন্য Manus OAuth URL প্রয়োজন নেই।

Repository-তে legacy Manus OAuth callback, legacy session-cookie fallback এবং Manus JWT দিয়ে scheduled-task identity verification এখনো আছে। Scheduled cleanup endpoint `/api/scheduled/cleanupFileAssets`-এ `isCron` ও `taskUid` যাচাই বাধ্যতামূলক। তাই Manus code এখনই সম্পূর্ণ মুছে ফেলা নিরাপদ নয়। এই compatibility path কেবল `OAUTH_SERVER_URL` ও `VITE_APP_ID` উভয়ই configure থাকলে সক্রিয় হবে; অনুপস্থিত থাকলে callback disabled থাকবে এবং cron request fail-closed হবে।

Repository-তে `vercel.json` বা GitHub Actions workflow-এ কোনো Vercel Cron schedule নেই। তবে বাহ্যিক Manus scheduler আছে কি না, সেটি account/dashboard থেকে নিশ্চিত না হওয়া পর্যন্ত cron verifier মুছবেন না। Google Calendar/HubSpot credentials আলাদা optional connectors; এগুলো account login-এর বিকল্প নয়।

Managed Manus project-এর environment name self-hosted/Vercel-এ transferable ধরে নেবেন না। Preflight কেবল variable name/status দেখায়; secret value কখনো print করে না।

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
| Supabase Auth | exact redirect allowlist, email verification, session persistence | login gated |
| Legacy Manus OAuth/cron | optional URL + app ID, signed task identity | legacy callback disabled; cron fail-closed |
| Provider connector | Google/HubSpot scope ও health evidence | connector disabled |
| Operations | logs, backup, restore, alert, rollback | controlled alpha |

**Current truth:** project-side preflight and provider-status tooling are implemented; live VPS, real OAuth consent/revoke, Google/HubSpot provider execution, database evidence, and custom-domain proxy verification remain operator gates.
