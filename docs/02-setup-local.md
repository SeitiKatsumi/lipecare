# Setup Local

Este documento sera atualizado quando a aplicacao for scaffoldada.

## Requisitos Esperados

- Node.js LTS.
- npm, pnpm ou yarn, a definir.
- Docker Desktop ou Docker Engine.
- PostgreSQL local ou container.
- Redis local ou container, se filas forem usadas.

## Variaveis

Criar `.env` local a partir de `.env.example`:

```bash
cp .env.example .env
```

Nunca commitar `.env`.

## Banco Local

O banco local deve usar dados ficticios ou anonimizados. Dados reais de producao nao devem ser copiados para ambiente local.

## Comandos Esperados

```bash
npm install
npm run prisma:generate
npm run dev
npm run dev:portal
npm run dev:web
npm run dev:api
npm run lint
npm run test
```

## Portal Local

A porta `3000` e reservada para o portal local das aplicacoes:

```text
http://localhost:3000
```

O portal lista os links das aplicacoes e servicos do monorepo. A aplicacao web principal roda localmente em `http://localhost:3003`, e a API em `http://localhost:4000`.

## Monorepo

Estrutura inicial:

```text
apps/portal  Portal local na porta 3000
apps/web      Next.js
apps/api      NestJS
packages/shared
```

Enquanto o `package-lock.json` nao existir, o CI usa `npm install`. Depois da primeira instalacao local, gerar e commitar o lockfile e trocar o CI para `npm ci`.
