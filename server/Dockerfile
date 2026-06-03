# ── Build stage ─────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Ensure data directories exist (MFA, debate jobs)
RUN mkdir -p /app/data

EXPOSE 8080

CMD ["node", "dist/index.js"]
