# LipeCare

LipeCare e uma plataforma digital para acompanhamento clinico de pacientes com lipedema, combinando registro de dados de saude, engajamento do paciente, conteudos educativos, automacoes, insights com IA e apoio a decisao clinica.

Este repositorio deve ser tratado como a fonte oficial de contexto tecnico do projeto. Conversas com IA ajudam na execucao, mas decisoes, setup, arquitetura, comandos, riscos e padroes precisam estar documentados aqui.

## Visao Do Produto

O objetivo do LipeCare e oferecer um ecossistema seguro para:

- cadastro de profissionais e pacientes;
- acompanhamento de sintomas, habitos, medidas, exames e fotos evolutivas;
- educacao em saude baseada em metodologia clinica;
- agenda, lembretes e notificacoes;
- dashboards para profissionais;
- interacao por WhatsApp;
- geracao de insights com IA;
- suporte a multi-tenant e whitelabel.

## Stack Recomendada

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Banco de dados: PostgreSQL
- ORM/Migrations: Prisma
- Filas/cache: Redis + BullMQ
- Storage privado: S3 compativel, como Cloudflare R2, AWS S3, Backblaze ou MinIO
- Automacoes: n8n
- IA: OpenAI API
- Deploy: Docker + CapRover
- CI/CD: GitHub Actions
- Monitoramento: Sentry, Uptime Kuma e logs estruturados

## Ambientes

| Ambiente | Uso | Banco | Deploy |
| --- | --- | --- | --- |
| Local | Desenvolvimento diario | PostgreSQL local ou container | Manual |
| Staging | Homologacao e testes reais | Banco isolado de staging | CapRover |
| Producao | Usuarios reais | Banco isolado de producao | CapRover |

Dados reais de producao nao devem ser usados em desenvolvimento sem anonimizacao.

## Primeiros Comandos

Com Node.js 20+ e npm 10+ disponiveis:

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
npm run test
npm run lint
```

Para subir dependencias locais:

```bash
docker compose up -d postgres redis
```

## Estrutura Do Repositorio

```text
apps/
  web/      Next.js + TypeScript
  api/      NestJS + TypeScript + Prisma
packages/
  shared/   Tipos e contratos compartilhados
docs/       Documentacao tecnica e operacional
```

Dockerfiles separados para deploy:

```text
apps/web/Dockerfile
apps/api/Dockerfile
```

## Documentacao

- `docs/00-contexto-do-projeto.md`: contexto de negocio e escopo.
- `docs/01-arquitetura.md`: arquitetura recomendada.
- `docs/02-setup-local.md`: como rodar o projeto localmente.
- `docs/03-deploy-caprover.md`: deploy via Docker/CapRover.
- `docs/04-banco-de-dados.md`: estrategia de dados, migrations e backups.
- `docs/05-seguranca-lgpd.md`: seguranca, privacidade e LGPD.
- `docs/06-decisoes-adr/`: decisoes arquiteturais.
- `docs/07-runbooks/`: operacao, rollback, backup e incidentes.
- `docs/08-ai-context/codex.md`: contexto obrigatorio para uso do Codex.

## Politica De Seguranca

Nunca commitar:

- `.env` real;
- senhas;
- tokens;
- chaves privadas;
- dumps de banco;
- fotos, exames ou dados reais de pacientes;
- credenciais de CapRover, GitHub, OpenAI, WhatsApp ou storage.

Use `.env.example` para documentar nomes de variaveis sem valores reais.

## Status

Fase atual: fundacao tecnica e documentacao inicial.
