#!/bin/sh
set -eu

npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

if [ "${LIPECARE_SEED_DEMO:-false}" = "true" ]; then
  node apps/api/prisma/seed.mjs
fi

exec npm run start:prod -w @lipecare/api
