# ─────────────── BUILD STAGE ───────────────
FROM node:20-alpine AS builder

WORKDIR /app

# install dependencies first (better caching)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# copy full source
COPY . .

# ✅ IMPORTANT: inject Vite env at build time
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY

# generate prisma + build app
RUN npx prisma generate
RUN npm run build


# ─────────────── PRODUCTION STAGE ───────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

# frontend build
COPY --from=builder /app/dist ./dist

# backend build
COPY --from=builder /app/dist-server ./dist-server

# prisma runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["npm", "start"]
