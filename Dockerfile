FROM node:20.11.1-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:20.11.1-alpine AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm test


FROM node:20.11.1-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV APP_PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=test /app/index.js /app/index.js
COPY --from=test /app/app.js /app/app.js

EXPOSE 3000
CMD ["node", "index.js"]
