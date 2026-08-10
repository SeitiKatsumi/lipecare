FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run prisma:generate
RUN npm run build -w @lipecare/shared
RUN npm run build -w @lipecare/api

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/entrypoint.sh ./apps/api/entrypoint.sh
COPY --from=builder /app/packages/shared ./packages/shared
RUN chmod +x ./apps/api/entrypoint.sh
EXPOSE 4000
CMD ["sh", "apps/api/entrypoint.sh"]

