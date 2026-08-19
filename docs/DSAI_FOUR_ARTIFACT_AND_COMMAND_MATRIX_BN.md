# DSAI চারটি Artifact ও Command Matrix

## চূড়ান্ত যাচাইয়ের ফল

আগের চারটি delivered artifact এক ধরনের file নয়। একটি self-extracting deployment bundle, একটি credential-free release ZIP, একটি checksum manifest, এবং একটি supporting Bengali guide। One-file deployment ব্যবহার করলে কেবল `.run` file VPS-এ আপলোড করলেই যথেষ্ট; ZIP, manifest এবং guide তখন VPS-এ বাধ্যতামূলক নয়। ZIP-plus-manifest deployment ব্যবহার করলে ZIP ও manifest দুটিই আপলোড করতে হবে। একই deployment-এ দুই পদ্ধতি একসঙ্গে চালানোর প্রয়োজন নেই।

| Artifact | ব্যবহার | VPS-এ বাধ্যতামূলক? | নিরাপত্তা/ভূমিকা |
|---|---|---:|---|
| `DSAI_one_command_vps_deploy_2026-08-20.run` | One-file self-extracting deployment | **হ্যাঁ**, one-file flow-এ | Executable mode `700`; ভিতরে শুধু credential-free release payload; runtime secret নেই |
| `DSAI_production_release_FINAL_2026-08-20.zip` | Two-file/manual extraction flow | One-file flow-এ না; two-file flow-এ **হ্যাঁ** | Credential-free source release; checksum দিয়ে verify করতে হয় |
| `DSAI_production_release_FINAL_2026-08-20.integrity.txt` | ZIP checksum verification | One-file flow-এ না; two-file flow-এ **হ্যাঁ** | এটি ZIP-এর SHA-256 reference; secret নয় |
| `DSAI_SECURE_ONE_COMMAND_VPS_DEPLOYMENT_BN.md` | Human-readable instructions | VPS-এ বাধ্যতামূলক নয় | Local phone/computer-এ পড়ার জন্য supporting document |

## কোন command কোথায় চলবে

`scp` command কেবল local computer বা Cloud Shell-এ চলবে, যেখানে `.run` file সত্যিই আছে। এটি VPS-এর SSH prompt-এ চালানো যাবে না, যদি না file-টি একই VPS filesystem-এ আগে থেকেই থাকে।

```bash
scp "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run" dulal_sarder90@dsai:~/
```

নিচের command কেবল VPS-এর SSH terminal-এ চলবে এবং upload শেষ হওয়ার পরে চালাতে হবে:

```bash
chmod 700 "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

## Private Controlled Alpha command

Legacy PID স্থায়ী নয়। `30628` আগের transcript-এর observed PID; এটি blindly পুনর্ব্যবহার করা যাবে না। VPS-এ আগে non-secret process listing দেখে বর্তমান PID যাচাই করতে হবে। তারপর actual PID বসিয়ে command চালাতে হবে:

```bash
ps -eo pid,user,args | grep -E '[n]ode|[d]sai' | head -n 20
DSAI_LEGACY_PID='<বর্তমান-legacy-PID>' DSAI_PRIVATE_ALPHA=true bash "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

যদি `/etc/dsai/dsai.env` আগে থেকেই থাকে, migration না করে:

```bash
chmod 600 /etc/dsai/dsai.env
DSAI_ENV_FILE=/etc/dsai/dsai.env DSAI_PRIVATE_ALPHA=true bash "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

এই mode কেবল loopback-bound private Controlled Alpha-এর জন্য। এটি public internet launch নয়।

## Public production command

Public production-এর জন্য `/etc/dsai/dsai.env`-এ live database, JWT, OAuth, hostname এবং Turnstile values secure ভাবে provision করা থাকতে হবে। তারপর VPS-এ:

```bash
chmod 600 /etc/dsai/dsai.env
DSAI_ENV_FILE=/etc/dsai/dsai.env DSAI_PRIVATE_ALPHA=false bash "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

Public CAPTCHA values অনুপস্থিত হলে validator fail-closed করবে। Public mode-এ no-CAPTCHA চালানোর কোনো বৈধ command নেই।

## Two-file fallback flow

Self-extracting bundle ব্যবহার না করলে local computer থেকে ZIP ও manifest দুটিই upload করতে হবে:

```bash
scp "$HOME/DSAI_production_release_FINAL_2026-08-20.zip" "$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt" dulal_sarder90@dsai:~/
```

VPS-এ upload-এর পরে checksum ও archive test:

```bash
cd "$HOME"
ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"
test -s "$ZIP" && test -s "$MANIFEST"
EXPECTED="$(awk -F= '/^SHA256=/{print $2}' "$MANIFEST")"
ACTUAL="$(sha256sum "$ZIP" | awk '{print $1}')"
printf 'EXPECTED=%s\nACTUAL=%s\n' "$EXPECTED" "$ACTUAL"
test "$EXPECTED" = "$ACTUAL"
unzip -tq "$ZIP"
```

## গুরুত্বপূর্ণ সংশোধন

আগের handoff-এ bundle SHA-256 এবং release ZIP SHA-256-কে একইভাবে বলা হয়েছিল; এটি ভুল। ZIP checksum হলো `SHA256` manifest value, আর `.run` file-এর নিজস্ব SHA-256 আলাদা হবে। Bundle-এর ভিতরের embedded payload checksum ZIP checksum-এর সমান হওয়া দরকার; পুরো bundle checksum আলাদা হওয়া স্বাভাবিক।

আরেকটি সংশোধন হলো `DSAI_LEGACY_PID=30628`-কে স্থায়ী command হিসেবে না দেওয়া। PID reboot বা process restart-এর পরে বদলে যেতে পারে। বর্তমান PID non-secret `ps` output থেকে যাচাই করে বসাতে হবে।

## Go/no-go

Artifact upload ও local health pass করলেই public deployment সম্পূর্ণ হয়েছে বলা যাবে না। Database readiness, process supervision, Nginx upstream, TLS, DNS, SPA history fallback, OAuth callback allowlist, public CAPTCHA এবং rollback evidence আলাদাভাবে verify না হওয়া পর্যন্ত public launch **NO-GO**।
