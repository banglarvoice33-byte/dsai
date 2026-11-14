FROM node:24.22.2-alpine3.24 AS build

WORKDIR /app
RUN npm install --global pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# Keep the Docker artifact aligned with the standalone server entrypoint.
RUN pnpm run check && pnpm run build:standalone

FROM node:24.22.2-alpine3.24 AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/shared ./shared
RUN printf '%s\n' \
    '# Generated placeholder-only template. Configure production secrets outside the image.' \
    'NODE_ENV=production' \
    'PORT=3000' \
    'DATABASE_URL=postgresql://<database_user>:<database_password>@<database_host>:5432/<database_name>?sslmode=require' \
    'JWT_SECRET=<server-only-secret-at-least-32-characters>' \
    'VITE_APP_ID=<manus-oauth-application-id>' \
    'OAUTH_SERVER_URL=https://<manus-oauth-server-host>' \
    'VITE_OAUTH_PORTAL_URL=https://<manus-oauth-login-portal-host>' \
    > ./.env.example

# The app serves static assets and health routes; it does not need root privileges.
RUN chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:3000/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "dist/index.js"]
