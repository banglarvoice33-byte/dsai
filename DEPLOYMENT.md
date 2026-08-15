# DSAI One-Command Deployment

## Purpose

`deploy-genesis.sh` installs only missing prerequisites, installs the locked project dependencies, builds the production bundle, selects a free application port, starts the project, and performs a local health check. It is designed for a Linux server where the project directory has been uploaded or cloned.

The installer is intentionally **non-destructive**. It does not delete unrelated projects, rewrite reverse-proxy configuration, open firewall ports, create cloud accounts, or embed passwords and API keys. If Node.js and `corepack` are missing, it uses the host's `apt-get` package manager, with `sudo` only when available and required.

## Port behavior

The normal allocation range begins at **3010**, which is the eleventh application slot when ports `3000` through `3009` are already occupied by ten projects. The installer checks active listeners and selects the first free port between `3010` and `3099`. If the project has already been deployed, it reuses its saved port when that port remains available for the current process; otherwise it selects a new free port.

This behavior avoids assuming that port 3010 is free. The actual selected port is written to `.dsai-runtime/port`, while the production environment is written to `.env.production` with mode `0600`.

## One-command usage

After uploading the full project directory to the server:

```bash
cd /path/to/genesis-platform-site && bash deploy-genesis.sh
```

Before the first run, create `.env.production` with the required full-stack values. The installer fails closed if these values are missing rather than launching a misleading partially functional production service:

```dotenv
NODE_ENV=production
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://your-oauth-server
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal/login
```

Keep this file mode `0600`, use a real database and OAuth configuration, and never commit it. The installer loads these values before the Vite build so both frontend OAuth configuration and the server receive the intended production environment.

The command performs the following sequence:

| Stage | Behavior |
|---|---|
| Prerequisites | Confirms Linux, Node.js, corepack, pnpm, and curl. Installs only missing base packages when apt is available. |
| Port allocation | Checks ports 3010–3099 and selects the first free listener. |
| Configuration | Loads and validates `.env.production`, then updates `NODE_ENV=production` and the selected `PORT`; required database and OAuth values must already be present. |
| Dependencies | Runs `pnpm install --frozen-lockfile`. |
| Build | Runs the existing production build and creates `dist/`. |
| Process | Stops only the previous DSAI PID recorded in `.dsai-runtime/app.pid`, then launches the production server with `nohup`. |
| Verification | Polls `http://127.0.0.1:<PORT>/` for up to 30 seconds and prints the local/server URL, PID file, and log file. |

The application will be directly reachable at `http://SERVER_IP:PORT/` only if the server firewall and hosting provider allow that port. For a production domain on ports 80/443, configure an existing reverse proxy separately; this installer does not modify other projects’ proxy configuration.

## Optional port range override

If the server uses a different convention, set the range explicitly:

```bash
DSAI_START_PORT=4010 DSAI_END_PORT=4099 bash deploy-genesis.sh
```

The installer never assumes that a port is free simply because it is numerically the eleventh slot; it always checks the host first.

## Operational commands

The installer records runtime state in `.dsai-runtime/`. To inspect the service:

```bash
PORT=$(cat .dsai-runtime/port)
curl -I "http://127.0.0.1:${PORT}/"
cat .dsai-runtime/app.pid
 tail -n 100 .dsai-runtime/app.log
```

To stop only the current DSAI process:

```bash
kill "$(cat .dsai-runtime/app.pid)"
```

To rebuild and restart after a code update, run the same one-command installer again. It will reuse the current port when possible, install any newly required locked dependencies, build, stop the previous DSAI process, and perform the health check again.

## DSAI domain and contact arrangement

The requested public contact address is `info@banglarvoice24news.com`. The requested controlled test hostname is `dsai@banglarvoice24news.com`; because an email-style value contains `@`, operators should confirm whether the intended web hostname is `dsai.banglarvoice24news.com` or a registrar-specific test alias before configuring DNS. A web subdomain normally uses the `dsai.banglarvoice24news.com` form, while `dsai@banglarvoice24news.com` is normally an email address.

For the web test hostname, create an `A` or `CNAME` record for `dsai.banglarvoice24news.com` pointing to the server or reverse-proxy target. Configure the same hostname in the OAuth provider as an allowed origin and callback host, then use the final HTTPS callback path supplied by the application’s OAuth configuration. Do not claim the test domain is live until DNS, TLS, and OAuth click-through have been verified by the operator.

Keep `info@banglarvoice24news.com` as a mailto contact until a real mailbox, forwarding rule, SPF record, DKIM signing, and DMARC policy are configured by the domain operator. The website does not itself create or host that mailbox.

## Production notes

For reboot persistence, use the server operator’s preferred process manager or a user-level systemd service after reviewing `.env.production` and the project’s access policy. The current full-stack deployment requires protected database, JWT, and OAuth values for authenticated workflows; the installer validates their presence but does not invent, rotate, or transmit them. Do not expose `.env.production` through the frontend or commit it.

For a public deployment, the recommended next layer is an existing reverse proxy with TLS, a domain, a restrictive firewall rule for the proxy ports, and a private application port. Because proxy and firewall layouts differ across servers and multiple projects may already be live, they are deliberately left as an explicit operator-controlled step rather than guessed or overwritten by the installer.

## Safety boundaries

This deployment package contains no cryptocurrency miner, wallet, pool connector, token payout, or device-compute reward system. It does not claim guaranteed income or unlimited generation. It also does not make high-risk external submissions or access user accounts. Those boundaries are part of the GENESIS product contract and must remain in place when the project is extended.


## Capability answers for operators and users

For Bengali-first answers to “DSAI API key কী?”, “এক কমান্ডে কীভাবে deploy করব?”, “Super Agent কি live?”, and “Text-to-video কীভাবে করব?”, read `docs/DSAI_CAPABILITY_AND_OPERATOR_GUIDE_2026-08-15.md`. The guide intentionally separates ordinary user access from server-side provider secrets and states which roadmap capabilities are not live. Never ask a normal user to paste an API key into the website.
