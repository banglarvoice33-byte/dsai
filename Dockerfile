FROM node:20.19.4-alpine3.21 AS build

WORKDIR /app
RUN npm install --global pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20.19.4-alpine3.21 AS runtime

WORKDIR /app
ENV NODE_ENV=production

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

EXPOSE 3000
CMD ["node", "dist/index.js"]
