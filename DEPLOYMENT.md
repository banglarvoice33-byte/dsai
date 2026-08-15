# GENESIS One-Command Deployment

## Purpose

`deploy-genesis.sh` installs only missing prerequisites, installs the locked project dependencies, builds the production bundle, selects a free application port, starts the project, and performs a local health check. It is designed for a Linux server where the project directory has been uploaded or cloned.

The installer is intentionally **non-destructive**. It does not delete unrelated projects, rewrite reverse-proxy configuration, open firewall ports, create cloud accounts, or embed passwords and API keys. If Node.js and `corepack` are missing, it uses the host's `apt-get` package manager, with `sudo` only when available and required.

## Port behavior

The normal allocation range begins at **3010**, which is the eleventh application slot when ports `3000` through `3009` are already occupied by ten projects. The installer checks active listeners and selects the first free port between `3010` and `3099`. If the project has already been deployed, it reuses its saved port when that port remains available for the current process; otherwise it selects a new free port.

This behavior avoids assuming that port 3010 is free. The actual selected port is written to `.genesis-runtime/port`, while the production environment is written to `.env.production` with mode `0600`.

## One-command usage

After uploading the full project directory to the server:

```bash
cd /path/to/genesis-platform-site && bash deploy-genesis.sh
```

The command performs the following sequence:

| Stage | Behavior |
|---|---|
| Prerequisites | Confirms Linux, Node.js, corepack, pnpm, and curl. Installs only missing base packages when apt is available. |
| Port allocation | Checks ports 3010–3099 and selects the first free listener. |
| Configuration | Creates or updates `.env.production` with `NODE_ENV=production` and the selected `PORT`. |
| Dependencies | Runs `pnpm install --frozen-lockfile`. |
| Build | Runs the existing production build and creates `dist/`. |
| Process | Stops only the previous GENESIS PID recorded in `.genesis-runtime/app.pid`, then launches the production server with `nohup`. |
| Verification | Polls `http://127.0.0.1:<PORT>/` for up to 30 seconds and prints the local/server URL, PID file, and log file. |

The application will be directly reachable at `http://SERVER_IP:PORT/` only if the server firewall and hosting provider allow that port. For a production domain on ports 80/443, configure an existing reverse proxy separately; this installer does not modify other projects’ proxy configuration.

## Optional port range override

If the server uses a different convention, set the range explicitly:

```bash
GENESIS_START_PORT=4010 GENESIS_END_PORT=4099 bash deploy-genesis.sh
```

The installer never assumes that a port is free simply because it is numerically the eleventh slot; it always checks the host first.

## Operational commands

The installer records runtime state in `.genesis-runtime/`. To inspect the service:

```bash
PORT=$(cat .genesis-runtime/port)
curl -I "http://127.0.0.1:${PORT}/"
cat .genesis-runtime/app.pid
 tail -n 100 .genesis-runtime/app.log
```

To stop only the current GENESIS process:

```bash
kill "$(cat .genesis-runtime/app.pid)"
```

To rebuild and restart after a code update, run the same one-command installer again. It will reuse the current port when possible, install any newly required locked dependencies, build, stop the previous GENESIS process, and perform the health check again.

## Production notes

For reboot persistence, use the server operator’s preferred process manager or a user-level systemd service after reviewing the generated `.env.production` and the project’s access policy. Do not place secrets in `.env.production` unless the file is protected and the secret is genuinely needed by this static frontend. The current public website does not require a backend credential to render.

For a public deployment, the recommended next layer is an existing reverse proxy with TLS, a domain, a restrictive firewall rule for the proxy ports, and a private application port. Because proxy and firewall layouts differ across servers and multiple projects may already be live, they are deliberately left as an explicit operator-controlled step rather than guessed or overwritten by the installer.

## Safety boundaries

This deployment package contains no cryptocurrency miner, wallet, pool connector, token payout, or device-compute reward system. It does not claim guaranteed income or unlimited generation. It also does not make high-risk external submissions or access user accounts. Those boundaries are part of the GENESIS product contract and must remain in place when the project is extended.
