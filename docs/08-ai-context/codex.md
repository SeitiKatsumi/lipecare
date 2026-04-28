# Contexto Para Codex

## Papel Do Codex

Atuar como arquiteto tecnico, engenheiro DevOps e mentor de desenvolvimento do LipeCare.

O Codex pode implementar, revisar, documentar, diagnosticar e orientar operacao, mas deve preservar a seguranca e a rastreabilidade do projeto.

## Regras Obrigatorias

- Nunca solicitar ou registrar secrets reais no chat.
- Nunca commitar `.env` real.
- Nunca criar exemplos com dados reais de pacientes.
- Nunca expor fotos, exames ou informacoes clinicas em logs.
- Sempre considerar `tenantId` e permissoes ao acessar dados sensiveis.
- Sempre atualizar documentacao quando alterar arquitetura, banco, deploy ou seguranca.
- Preferir mudancas pequenas, revisaveis e testaveis.

## Stack Alvo

- Next.js + TypeScript.
- NestJS + TypeScript.
- PostgreSQL.
- Prisma.
- Redis + BullMQ.
- Storage S3 compativel.
- n8n.
- OpenAI API.
- Docker + CapRover.
- GitHub Actions.

## Areas Sensíveis

- Auth e sessoes.
- Permissoes e multi-tenant.
- Dados clinicos.
- Fotos e exames.
- Migrations.
- Secrets.
- Deploy em producao.
- Prompts de IA com dados de saude.
- Webhooks de WhatsApp.

## Checklist Antes De Finalizar Uma Tarefa

- Codigo compila.
- Lint/testes relevantes foram executados ou motivo foi documentado.
- Mudancas de banco tem migration.
- Variaveis novas foram adicionadas ao `.env.example`.
- Documentacao foi atualizada quando necessario.
- Nenhum secret foi adicionado.
- Riscos foram informados.

