# DSAI VPS-Only Environment Separation

**সিদ্ধান্ত:** Production API key, OAuth credential, database URL, JWT/session secret এবং provider secret মূল source tree, GitHub repository, release ZIP, self-extracting bundle এবং public deployment artifact-এর বাইরে থাকবে। এগুলো শুধুমাত্র VPS-এর protected environment file-এ থাকবে।

## Protected file contract

সাধারণ production path হলো:

```text
/etc/dsai/dsai.env
```

এই file-এর owner এমন user বা service account হবে যে DSAI process চালায়; permission হবে `600`, parent directory হবে `700`। Source project-এ `.env.production.example` কেবল placeholder template হিসেবে থাকবে। এতে কোনো real value রাখা যাবে না।

Bundle এই file-এর value print করে না, Git-এ যোগ করে না এবং release directory-তে `.env.production` হিসেবে copy করে না। Release launcher `DSAI_ENV_FILE=/etc/dsai/dsai.env` দিয়ে runtime process শুরু করে। ফলে source tree বা release archive ভুল করে GitHub-এ গেলেও real production secret সেখানে থাকার কথা নয়।

## Operator-created environment file

Secret values chat-এ পাঠানোর প্রয়োজন নেই। VPS terminal-এ operator নিজে `nano` অথবা protected heredoc ব্যবহার করে file তৈরি করতে পারেন। Heredoc-এ placeholder-গুলো নিজের আসল value দিয়ে operator locally প্রতিস্থাপন করবেন; সেই value কখনো chat, screenshot, GitHub বা public log-এ পাঠাবেন না।

```bash
sudo install -d -o "$USER" -g "$USER" -m 700 /etc/dsai
sudo touch /etc/dsai/dsai.env
sudo chown "$USER:$USER" /etc/dsai/dsai.env
sudo chmod 600 /etc/dsai/dsai.env
nano /etc/dsai/dsai.env
chmod 600 /etc/dsai/dsai.env
```

File-এর required names validator নিজে যাচাই করবে। CAPTCHA production mode-এ enabled থাকলে CAPTCHA keys-ও প্রয়োজন হবে; Controlled Alpha private mode-এ কেবল তখনই CAPTCHA বাদ যাবে যখন operator স্পষ্টভাবে `DSAI_PRIVATE_ALPHA=true` ব্যবহার করবেন। CAPTCHA optional বলে production validator-এর required security boundary অকারণে দুর্বল করা যাবে না।

## Three-command operator model

প্রথম command fresh VPS-এ project-এর বাইরে protected environment file তৈরি করে। আপনি `nano`-তে নিজে values লিখবেন; কোনো secret chat-এ পাঠাবেন না। File আগে থেকেই থাকলে overwrite করা হবে না। যদি legacy process থেকে non-interactive migration দরকার হয়, release extraction-এর পরে bundle-এর internal helper allowlisted values ব্যবহার করতে পারে; exactly one process না থাকলে তা fail-closed হবে।

```bash
sudo install -d -o "$USER" -g "$USER" -m 700 /etc/dsai && sudo touch /etc/dsai/dsai.env && sudo chown "$USER:$USER" /etc/dsai/dsai.env && sudo chmod 600 /etc/dsai/dsai.env && nano /etc/dsai/dsai.env && chmod 600 /etc/dsai/dsai.env
```

দ্বিতীয় command verified `.run` bundle চালাবে। Actual uploaded filename যদি আলাদা suffix বহন করে, operator exact file path ব্যবহার করবেন; একাধিক পুরোনো bundle থাকলে অস্পষ্ট wildcard ব্যবহার করবেন না।

```bash
RUN="$(find "$HOME" -maxdepth 2 -type f -name 'DSAI_one_command_vps_deploy_2026-08-20.run' -print -quit)" && test -n "$RUN" && chmod 700 "$RUN" && DSAI_ENV_FILE=/etc/dsai/dsai.env bash "$RUN"
```

তৃতীয় command non-mutating public-edge report চালাবে। এটি Nginx, TLS, DNS, firewall, systemd এবং public `/auth/login` evidence report করবে; secret values দেখাবে না।

```bash
cd "$HOME/dsai/current" && DSAI_DOMAIN=dsai.banglarvoice24news.com DSAI_PORT="$(cat .dsai-runtime/port)" bash scripts/remote-production-gate-report.sh
```

এই তিনটি command deployment repetition কমায়, কিন্তু DNS, TLS certificate issuance, OAuth callback allowlisting বা third-party provider activation জাদুর মতো সম্পন্ন করে না। সেগুলো আলাদা external control-plane কাজ এবং report-এ PASS না হওয়া পর্যন্ত public production claim করা যাবে না।

## আগের one-command flow-এর তুলনা

আগের one-command flow ইতিমধ্যেই checksum, safe extraction, staged release, validation, health check এবং rollback safeguards দিত। নতুন separation-এ তার প্রধান উন্নতি হলো runtime secret আর release directory-তে copy করা হয় না; launcher external file থেকে environment নেয়। ফলে তিনটি সুবিধা পাওয়া যায়: release archive সহজে GitHub বা অন্য storage-এ রাখা নিরাপদ হয়, secret rotation-এর জন্য application source পুনরায় package করতে হয় না, এবং source/release exposure হলেও production credentials আলাদা থাকে।

“এক command” এখনও সবচেয়ে সহজ path হিসেবে রাখা যায়, যদি `/etc/dsai/dsai.env` আগে থেকেই প্রস্তুত থাকে। “তিন command” path নতুন VPS বা missing environment-এর জন্য বেশি স্বচ্ছ: প্রথমে environment, পরে release, শেষে public gate report। এটি convenience এবং security-এর মধ্যে বেশি বাস্তবসম্মত ভারসাম্য।

## কী কখনো করা যাবে না

Real `.env.production`, `/etc/dsai/dsai.env`, API key, OAuth client secret, database password বা JWT secret source project-এ commit করা যাবে না। এগুলো ZIP-এ manually যোগ করা, chat-এ paste করা, screenshot-এ পাঠানো, browser/public deployment artifact-এ রেখে দেওয়া, অথবা GitHub-এ push করা যাবে না। Secret leak সন্দেহ হলে সংশ্লিষ্ট key revoke/rotate করতে হবে; শুধু Git history থেকে file মুছে ফেললেই যথেষ্ট নয়।

## Status boundary

এই separation project-side implementation এবং packaging safeguard হিসেবে সম্পন্ন করা হয়েছে। VPS-এ actual environment file তৈরি হয়েছে কি না, তার permission সঠিক কি না, এবং public OAuth callback/domain gate PASS করেছে কি না—এসব non-secret operator output ছাড়া সত্য বলে দাবি করা যাবে না।
