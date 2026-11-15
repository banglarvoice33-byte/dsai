FROM node:22-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY scan-server.mjs ./scan-server.mjs
USER node
EXPOSE 8080
CMD ["node", "scan-server.mjs"]
