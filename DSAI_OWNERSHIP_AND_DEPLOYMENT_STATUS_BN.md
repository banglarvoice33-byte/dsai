# DSAI ownership ও self-hosted deployment status

Manus-এর published Help Center guidance অনুযায়ী Manus দিয়ে তৈরি output সাধারণত personal ও commercial use-এর জন্য ব্যবহারযোগ্য; তবে third-party rights, copyright, legal compliance এবং AI output uniqueness আলাদাভাবে review করতে হয়। এই guidance content ownership সম্পর্কে; এটি কোনো self-hosted VPS deployment সফল হয়েছে—এমন operational evidence নয়।

DSAI-এর বর্তমান verified state হলো credential-free production archive, clean-room VM bootstrap, safe secret injection workflow, deployment script, route fallback guidance এবং integrity evidence প্রস্তুত। VPS-এ live deployment প্রমাণ করার জন্য archive upload, database connection/migration, application service, Nginx/TLS, `/healthz`, `/readyz`, `/auth/login`, protected API boundaries এবং real OAuth consent/revoke এখনও চালাতে হবে।

তাই সঠিক release language হলো **artifact-ready এবং operator-deployable**, কিন্তু VPS-side evidence ছাড়া **live production verified** নয়। কোনো documentation, announcement বা investor-facing copy-তে এই দুই অবস্থাকে এক করে লেখা যাবে না।
