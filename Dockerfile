# ─────────────── BUILD STAGE ───────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


# ─────────────── PRODUCTION STAGE ───────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# install OpenSSL (fix Prisma warning)
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# IMPORTANT: prevent postinstall crash dependency order
RUN npm ci

# copy build output only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["npm", "start"]
