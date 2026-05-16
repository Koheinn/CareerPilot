# ──────────────── 1. BUILD STAGE ────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source
COPY . .

# Generate Prisma client + build
RUN npx prisma generate
RUN npm run build


# ──────────────── 2. PRODUCTION STAGE ────────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only built output (IMPORTANT)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# If using Prisma, include generated client safely
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# DO NOT copy Firebase JSON here (use env instead)
# COPY firebase.json ❌ REMOVE THIS

EXPOSE 3000

# Run compiled JS (NOT tsx)
CMD ["node", "dist/server.js"]
