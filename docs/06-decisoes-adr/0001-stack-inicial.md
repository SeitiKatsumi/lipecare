# ADR 0001: Stack Inicial Do LipeCare

## Status

Proposta inicial.

## Contexto

O LipeCare precisa lidar com dados sensiveis de saude, multi-tenant, whitelabel, cadastros clinicos, fotos, exames, agenda, notificacoes, IA e integracoes com WhatsApp.

## Decisao

Adotar:

- Next.js + TypeScript para frontend.
- NestJS + TypeScript para backend.
- PostgreSQL para banco relacional.
- Prisma para ORM e migrations.
- Redis + BullMQ para filas e lembretes.
- Storage S3 compativel para arquivos privados.
- n8n para automacoes.
- OpenAI API para insights assistidos.
- Docker + CapRover para deploy.
- GitHub Actions para CI/CD.

## Consequencias Positivas

- Stack moderna e conhecida.
- Boa separacao entre UI e regras de negocio.
- Banco forte para dados relacionais e auditoria.
- Deploy compativel com VPS propria.
- Evolucao futura para servicos separados se necessario.

## Consequencias Negativas

- Mais componentes que um app simples.
- Exige disciplina de DevOps.
- Exige politica clara de secrets, logs e backups.
- Exige cuidado juridico/operacional por lidar com saude.

## Alternativas Consideradas

### Next.js fullstack apenas

Mais simples, mas pode concentrar regras clinicas demais na camada web.

### Microservices desde o inicio

Mais escalavel em teoria, mas aumenta custo, complexidade e tempo de entrega para o MVP.

