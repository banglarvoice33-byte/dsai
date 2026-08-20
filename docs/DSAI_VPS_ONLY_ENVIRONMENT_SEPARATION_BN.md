# DSAI VPS-Only Environment Separation

**সিদ্ধান্ত:** Production API key, OAuth credential, database URL, JWT/session secret এবং provider secret মূল source tree, GitHub repository, release ZIP, self-extracting bundle এবং public deployment artifact-এর বাইরে থাকবে। এগুলো শুধুমাত্র VPS-এর protected environment file-এ থাকবে।

## Protected file contract

Production environment-এর আলাদা source of truth হবে:

```text
/etc/dsai/dsai.env
```

এই file-এর permission হবে `600` এবং parent directory-এর permission হবে `700`। File-এর owner এমন user বা service account হবে যে DSAI process চালায়। মূল project-এ কেবল `.env.production.example` placeholder template থাকবে; এতে কোনো real credential থাকবে না।

Bundle এবং runtime-এর নিয়ম হলো:

| বিষয় | নিয়ম |
|---|---|
| Source project | Real secret রাখা যাবে না |
| GitHub | Real secret commit বা push করা যাবে না |
| Release ZIP/.run | Real secret embedded থাকবে না |
| Runtime | `/etc/dsai/dsai.env` থেকে read করবে |
| Secret rotation | Source rebuild ছাড়াই VPS file বদলে করা যাবে |
| Chat/screenshot | Secret value পাঠানো যাবে না |

Release launcher external file-টি validate করে runtime process-এ pass করবে। Environment file release directory-তে `.env.production` হিসেবে copy করা হবে না।

## VPS-এ operator নিজে file তৈরি করবেন

Secret values এখানে বা chat-এ পাঠানোর প্রয়োজন নেই। VPS terminal-এ নিচের command চালিয়ে `nano` খুলুন এবং values শুধু VPS-এ লিখুন:

```bash
sudo install -d -o "$USER" -g "$USER" -m 700 /etc/dsai && sudo touch /etc/dsai/dsai.env && sudo chown "$USER:$USER" /etc/dsai/dsai.env && sudo chmod 600 /etc/dsai/dsai.env && nano /etc/dsai/dsai.env && chmod 600 /etc/dsai/dsai.env
```

`nano`-তে save করার সময় `Ctrl+O`, `Enter`, তারপর exit-এর জন্য `Ctrl+X` ব্যবহার করুন। File-এর required variable names project-এর safe example template ও validator অনুযায়ী লিখবেন। কোনো secret এই chat, screenshot, browser message, GitHub বা public log-এ paste করবেন না।

`nano` ব্যবহার না করলে operator VPS terminal-এ protected heredoc ব্যবহার করতে পারেন; তবে heredoc-এ real values locally বসাতে হবে এবং সেই command history বা screenshot share করা যাবে না। সাধারণভাবে `nano` কম ঝুঁকিপূর্ণ, কারণ secret command-line history-তে চলে যাওয়ার সম্ভাবনা কম।

## Deployment boundary

Environment file তৈরি হওয়ার পরে release bundle চালানো হবে। Bundle checksum, extraction, environment validation, build, local health এবং login smoke check করবে। Environment অনুপস্থিত বা required value missing হলে এটি fail-closed হবে; কোনো অনুমান করে fake value তৈরি করবে না।

Application source বা public live project-এ API/OAuth credential দেখা গেলে সেটি production-safe অবস্থা নয়। কোনো credential leak সন্দেহ হলে সংশ্লিষ্ট key provider dashboard থেকে revoke/rotate করতে হবে; শুধু Git history থেকে file মুছে ফেললে যথেষ্ট নয়।

## Current implementation status

এই separation project-side-এ বাস্তবায়িত: launcher-এর default external path `/etc/dsai/dsai.env`, setup helper external file-এ লেখে, bundle external file validate করে এবং release directory-তে secret copy করে না, আর credential-free packager সব dotenv file বাদ দিয়ে শুধু safe example রাখে। VPS-এ file সত্যিই তৈরি হয়েছে কি না, permission সঠিক কি না এবং OAuth/public-edge PASS করেছে কি না—এসব কেবল non-secret operator output দিয়ে যাচাই করা যাবে।
