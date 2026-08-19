# DSAI VPS Context Reconciliation

## Purpose

এই নথিটি আগের chat preview-তে operator-এর দেওয়া VPS transcript এবং বর্তমান deployment artifacts মিলিয়ে তৈরি করা হয়েছে। GCP project বা zone চাওয়া এই deployment-এর জন্য প্রয়োজনীয় নয়; বর্তমান handoff generic VPS SSH/SCP flow ব্যবহার করে।

## Previously supplied VPS facts

| বিষয় | পূর্বে পাওয়া তথ্য | প্রমাণের ধরন |
|---|---|---|
| OS | Ubuntu 22.04 | VPS terminal transcript |
| SSH user | `dulal_sarder90` | `whoami` output |
| Hostname / prompt | `dsai` | `hostname` output এবং shell prompt |
| Existing application workspace | `/home/dulal_sarder90/apps/dsai-platform` | `pwd` output |
| Node.js | `v20.20.2` | `node -v` output |
| pnpm | `10.34.5` | `pnpm -v` output |
| Nginx | `1.18.0 (Ubuntu)` | `nginx -v` output |
| Web domain | `dsai.banglarvoice24news.com` | DNS and Nginx transcript |
| Observed IPv4 | `34.92.112.34` | `getent ahostsv4` output |
| Existing TLS path | `/etc/letsencrypt/live/dsai.banglarvoice24news.com/` | VPS preflight transcript |
| Existing proxy observations | Nginx server blocks referenced `127.0.0.1:3010` and `127.0.0.1:3011` | `nginx -T` excerpt |
| Nginx state at captured time | `inactive (dead)` | `systemctl status nginx` excerpt |
| Public auth result at captured time | `/auth/login` returned `404` | `curl` output |
| Firewall observation | `ufw: command not found` | `sudo ufw status verbose` output |

## Known versus not proven

The transcript proves that these values were observed previously; it does not prove that the VPS is currently unchanged. Before making a production change, run a fresh read-only preflight on the VPS. In particular, the current application directory, process on the selected port, Nginx active state, TLS validity, database reachability, and OAuth callback behavior must be checked again.

No password, private key, database password, OAuth secret, CAPTCHA secret, Forge key, or payment credential is stored in this document. These values must be entered only through the hidden bootstrap prompt or the VPS operator’s protected secret manager.

## Correct next action

Use the current VPS-only matrix with `VPS_USER=dulal_sarder90` and `VPS_HOST=dsai`. If `dsai` is not an SSH alias on the local machine, use the observed IP `34.92.112.34` or the operator’s configured reachable hostname. Do not request GCP identifiers for this flow. A real deployment still requires the authorized operator to execute the SSH/SCP commands and return only non-secret command output for verification.
