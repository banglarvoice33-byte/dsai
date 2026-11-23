FROM node:24.22.2-alpine3.24
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY scan-server.mjs ./scan-server.mjs
USER node
EXPOSE 8080
CMD ["node", "scan-server.mjs"]
