# DSAI Custom-Domain Route Fix

## Verified diagnosis

On 19 August 2026, the managed domain served `/` and `/auth/login` with the DSAI HTML application, while `https://dsai.banglarvoice24news.com/` and `/auth/login` returned an Express `404 Not Found`. The custom domain did serve `/healthz` with `service: dsai`, but `/readyz` returned `503` because its upstream database handle was unavailable. Static assets such as `/assets/index-*.js` also returned `404`. This pattern indicates that the custom domain is reaching a separate or incomplete upstream process/build, not the current managed deployment. It is not a React route-registration defect.

## Required Nginx behavior

The custom domain must proxy all application traffic to the same DSAI Node process that serves the current production build. The upstream must contain `dist/public/index.html` and its hashed assets. The following is a reference configuration; replace the port with the port recorded by `deploy-genesis.sh`.

```nginx
server {
    listen 443 ssl http2;
    server_name dsai.banglarvoice24news.com;

    # TLS certificate directives go here.

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}

server {
    listen 80;
    server_name dsai.banglarvoice24news.com;
    return 301 https://$host$request_uri;
}
```

Do not add a separate `try_files` rule that sends `/api/*` to a static file. API routes and `/api/oauth/callback` must reach Node unchanged. If Nginx serves static files directly instead of proxying, its fallback must be `try_files $uri $uri/ /index.html;` for browser history routes, while `/api/` must remain proxied.

## Operator verification sequence

Run the deployment script, record the selected port from `.dsai-runtime/port`, and confirm that local `/healthz`, `/readyz`, `/`, `/auth/login`, and one hashed asset return the expected status. Then reload Nginx and repeat the same checks over HTTPS. `/readyz` must be `200` before calling the domain production-ready. Finally, start OAuth from the same custom domain and confirm that the provider callback allowlist contains exactly `https://dsai.banglarvoice24news.com/api/oauth/callback`.

The deployment script now fails if API health passes but `/auth/login` does not return HTTP 200. This prevents a missing SPA build or broken history fallback from being reported as a successful deployment.

## Current boundary

The application code cannot repair an external Nginx upstream that points to an old process, wrong port, missing build directory, or disconnected database. That correction requires VPS/Nginx access. No OAuth security check should be bypassed to work around the route error.
