# DSAI SQLite বনাম MySQL/TiDB এবং Deployment Simplification Audit

**তারিখ:** ২০ আগস্ট ২০২৬  
**সিদ্ধান্ত:** বর্তমান DSAI production-এর primary database হিসেবে MySQL/TiDB বজায় থাকবে; SQLite local development, disposable preview, অথবা single-process edge utility হিসেবে সীমিতভাবে বিবেচ্য।

## Executive decision

SQLite দুর্বল বা অসম্পূর্ণ প্রযুক্তি নয়। SQLite একটি self-contained, serverless, zero-configuration, transactional SQL engine; এটি single-file database, ACID transaction এবং ছোট footprint-এর জন্য অত্যন্ত কার্যকর। SQLite-এর নিজস্ব documentation-ও এটিকে high-reliability embedded engine হিসেবে বর্ণনা করে [1]। তাই “SQLite ব্যবহার করলে project ছোট হবে” ধারণাটি আংশিকভাবে সত্য: আলাদা database server process ও network configuration লাগবে না। কিন্তু এটি production suitability-এর সমার্থক নয়।

DSAI-এর বর্তমান workload কেবল একটি ছোট local tool নয়। এতে user account, OAuth/session boundary, protected workspaces, admin governance, scholarship entitlement ও usage, creative requests, traces, release gates, billing-event records, deletion lifecycle, future durable media jobs এবং সম্ভাব্য concurrent users আছে। এই data contract-কে supplied script-এর নতুন SQLite file-এ সরিয়ে নিলে storage cost সামান্য কমতে পারে, কিন্তু schema migration, backup/restore, multi-user write contention, process coordination, data split এবং rollback risk বাড়বে। সুতরাং SQLite-এ বদলানোকে cost optimization নয়, architecture migration হিসেবে বিবেচনা করতে হবে।

## Supplied script বনাম বর্তমান DSAI

| বিষয় | Supplied script | Current DSAI | সিদ্ধান্ত |
|---|---|---|---|
| Runtime | React 18, tRPC 10, Tailwind 3, PM2 | React 19, tRPC 11, Tailwind 4, Express/core runtime | Current stack বজায়; useful UX nativeভাবে port |
| Database | Local `better-sqlite3` file | Drizzle/MySQL/TiDB contract | Production database বদলানো নয় |
| Auth | Email mutation/navigation; verified OAuth state boundary প্রদর্শিত নয় | Manus OAuth, nonce/state, protected/admin procedures | Current auth boundary বজায় |
| Media | Video UI ও status concept | Provider-gated Creative Studio planner এবং safe media job contract | Async job ধারণা গ্রহণ; provider side effect নয় |
| Deployment | নতুন `dsai-final` tree লিখে parallel replacement | Credential-free ZIP, checksum, env validator, staged release, rollback-aware bundle | Replacement script নয়; guarded one-command bundle |
| Data | SQLite file ও demo-like surface | Existing relational schema, lifecycle, governance, billing-event model | Data split এড়ানো |
| Process | Global PM2 installation ও unclear port ownership | Existing launcher/systemd handoff, local port 3011 | One supervisor contract মাত্র |

## SQLite কখন উপযুক্ত

SQLite-এর WAL mode-এ readers writers-কে এবং writers readers-কে block না করেও concurrent কাজ করতে পারে; কিন্তু একই WAL database-এর সব process একই host-এ থাকতে হয় এবং একসঙ্গে একটিই writer থাকতে পারে [2]। এটি local preview, CLI, test fixture, single-user desktop tool, disposable controlled-alpha utility বা edge cache-এর জন্য ভালো fit হতে পারে। এই ব্যবহারে database file backup ও process ownership খুব পরিষ্কার রাখতে হবে।

SQLite-কে DSAI-এর primary production database করার বিরুদ্ধে সিদ্ধান্তটি SQLite-এর quality judgement নয়; এটি workload fit-এর সিদ্ধান্ত। DSAI-এর user-scoped writes, scholarship usage/entitlements, audit traces, billing events, deletion lifecycle এবং future media job coordination একটি shared relational service contract-এর মধ্যে থাকা উচিত। একাধিক application process, worker, reverse proxy, backup job বা future horizontal instance যুক্ত হলে SQLite file ownership ও write serialization operational risk তৈরি করবে।

## MySQL/TiDB কেন বজায় রাখা হয়েছে

MySQL InnoDB ACID transaction, row-level locking, consistent reads, foreign-key constraints, backup/point-in-time recovery support এবং multi-user concurrency দেয় [3]। InnoDB চারটি standard transaction isolation level সমর্থন করে এবং default `REPEATABLE READ` isolation consistency ও concurrency trade-off নিয়ন্ত্রণ করে [4]। DSAI-এর existing Drizzle schema এই relational contract-এর ওপর ইতিমধ্যেই নির্মিত; database বদলালে application code নয়, migration, backup, rollback, entitlement consistency, OAuth/user identity, billing-event idempotency এবং operator runbook—সব পুনরায় যাচাই করতে হবে।

VPS cost কমানোর উন্নত পথ হলো database বদলে data integrity ঝুঁকিতে ফেলা নয়। বরং unused services বন্ধ করা, application port loopback-only রাখা, Nginx-কে একমাত্র public edge করা, production dependency install reproducible রাখা, logs rotate করা, proper indexes/query plans যাচাই করা, backup retention সীমিত কিন্তু tested রাখা, এবং provider jobs-কে durable queue/ledger দিয়ে bounded করা। এই পদক্ষেপগুলো storage ও operational cost কমায়, SQLite migration-এর মতো data split তৈরি করে না।

## Deployment simplification: সর্বোচ্চ সহজ কিন্তু নিরাপদ path

Current one-command bundle এখন নিম্নলিখিত acceptance contract অনুসরণ করে:

1. Embedded release payload-এর SHA-256 যাচাই করে এবং ZIP integrity পরীক্ষা করে।
2. Timestamped release directory তৈরি করে; পুরোনো `current` target পড়তে পারে এবং overwrite করার আগে preserve করে।
3. Protected `/etc/dsai/dsai.env`, allowlisted legacy process environment, অথবা interactive setup—এই তিনটির একটিকে ব্যবহার করে। Missing secrets non-interactive mode-এ fail-closed হয়।
4. New release directory-তেই environment copy করে mode `600` দেয় এবং validator চালায়। Validation pass না হওয়া পর্যন্ত `current` symlink বদলায় না।
5. Validated release-কে `current` করে launcher চালায় এবং local health ও `/auth/login` smoke test করে। Post-switch failure ধরা পড়লে আগের target restore করার best-effort rollback marker দেয়।
6. Public edge—Nginx, TLS, DNS, OAuth callback, database readiness, process supervision এবং provider activation—কে আলাদা explicit gates হিসেবে রাখে; bundle এই gates মিথ্যা success হিসেবে report করে না।

এটি “একটি file upload + একটি command” সরলতা ধরে রাখে, কিন্তু blind overwrite, hidden secret embedding, duplicate process, stale environment এবং invalid release activation এড়ায়। SSH-এর প্রয়োজন পুরোপুরি দূর করা যাবে না, কারণ VPS-এ প্রথমবার file upload, secret injection এবং public edge verification বাস্তব operator action। তবে repeated SSH ঝামেলা কমানোর জন্য release artifact, checksum, environment migration, systemd handoff এবং non-mutating gate report একত্রে রাখা হয়েছে।

## কী বাদ দেওয়া হয়েছে এবং কেন

Supplied script-এর invalid JSX, tRPC 10/React 18/Tailwind 3 drift, unverified email-only login, hardcoded demo count, SQLite split, global PM2 installation, unpinned dependency drift, incomplete media provider execution, missing storage/moderation/retention, and destructive parallel tree creation বাদ দেওয়া হয়েছে। এগুলো বাদ দেওয়া মানে simplicity বাদ দেওয়া নয়; এগুলো current DSAI-এর identity, security, data contract ও rollback model ভেঙে দিত। Supplied script-এর visible queued/processing/succeeded/failed UX এবং dedicated media workflow concept গ্রহণ করা হয়েছে current React 19 + tRPC 11 + Drizzle contract-এর ভিতরে provider-neutral job planner হিসেবে।

## Final recommendation

বর্তমান DSAI production-এর জন্য **MySQL/TiDB primary রাখুন, SQLite যোগ করবেন না**। SQLite চাইলে আলাদা local test profile বা disposable preview utility হিসেবে future scope-এ রাখা যায়; production data, scholarship entitlement, OAuth identity, billing events, traces ও media-job ledger সেখানে স্থানান্তর করা যাবে না migration plan, backup/restore rehearsal, concurrency test এবং rollback evidence ছাড়া।

বর্তমান project-side simplified release production-safe foundation হিসেবে উন্নত হয়েছে। Fully public production চালু করার আগে এখনও operator-side DNS/Nginx/TLS/OAuth/database/process evidence এবং provider-side media/payment/CRM credentials ও webhook verification প্রয়োজন।

## References

[1]: https://sqlite.org/about.html "About SQLite — official documentation"
[2]: https://www.sqlite.org/wal.html "Write-Ahead Logging — official SQLite documentation"
[3]: https://dev.mysql.com/doc/refman/en/innodb-introduction.html "Introduction to InnoDB — official MySQL documentation"
[4]: https://dev.mysql.com/doc/refman/en/innodb-transaction-isolation-levels.html "InnoDB Transaction Isolation Levels — official MySQL documentation"
