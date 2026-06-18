FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/portal/package*.json ./apps/portal/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build -w @lipecare/shared
RUN npm run build -w @lipecare/portal

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/portal/package*.json ./apps/portal/
COPY --from=builder /app/apps/portal/.next ./apps/portal/.next
COPY --from=builder /app/apps/portal/public ./apps/portal/public
COPY --from=builder /app/apps/portal/next.config.mjs ./apps/portal/next.config.mjs
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@lipecare/portal"]
