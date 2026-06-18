# Contexto Para Codex

## Papel Do Codex

Atuar como arquiteto técnico, engenheiro DevOps e mentor de desenvolvimento do LipeCare.

O Codex pode implementar, revisar, documentar, diagnosticar e orientar operação, mas deve preservar a segurança e a rastreabilidade do projeto.

## Regras Obrigatórias

- Nunca solicitar ou registrar secrets reais no chat.
- Nunca commitar `.env` real.
- Nunca criar exemplos com dados reais de pacientes.
- Nunca expor fotos, exames ou informações clínicas em logs.
- Sempre considerar `tenantId` e permissões ao acessar dados sensíveis.
- Sempre atualizar documentação quando alterar arquitetura, banco, deploy ou segurança.
- Preferir mudanças pequenas, revisáveis e testáveis.
- Preservar `apps/portal` como portal local na porta `3000`.
- Nunca colocar uma aplicação de produto nova na porta local `3000`; adicionar link e porta fixa no portal.
- Ao criar nova aplicação, atualizar `apps/portal/src/app/app-registry.ts` e `docs/09-portal-e-portas.md`.
- Ao criar ou alterar módulo, fluxo, integração, permissão ou entidade relevante, atualizar também a tela `Arquitetura do sistema` no preview para manter a visão macro do produto.
- Manter todos os arquivos de código, configuração e documentação em UTF-8.
- Ao criar ou alterar texto visível, labels de dados do sistema, placeholders, menus, status ou mensagens, atualizar também o dicionário de idiomas do preview para português, inglês, espanhol, japonês e alemão.
- Deploy de produção deve ser feito automaticamente por GitHub Actions chamando o webhook do CapRover via secret `CAPROVER_LIPECARE_WEBHOOK_URL`; nunca pedir senha do CapRover no chat.
- A branch `main` é protegida: antes de editar, puxar a última versão do GitHub; trabalhar em branch curta; abrir Pull Request; exigir CI `quality` aprovado antes de merge.

## Stack Alvo

- Next.js + TypeScript.
- NestJS + TypeScript.
- PostgreSQL.
- Prisma.
- Redis + BullMQ.
- Storage S3 compatível.
- n8n.
- OpenAI API.
- Docker + CapRover.
- GitHub Actions.

## Convencao De Apps E Portas

- `apps/portal`: portal local das aplicacoes, `http://localhost:3000`.
- `apps/web`: frontend principal, `http://localhost:3003` no desenvolvimento local.
- `apps/api`: backend NestJS, `http://localhost:4000`.
- Cada aplicação deployável deve ter Dockerfile próprio para CapRover.
- O monorepo deve continuar sendo a fonte oficial das portas e links.

## Areas Sensíveis

- Auth e sessões.
- Permissões e multi-tenant.
- Dados clínicos.
- Fotos e exames.
- Migrations.
- Secrets.
- Deploy em produção.
- Prompts de IA com dados de saúde.
- Webhooks de WhatsApp.

## Checklist Antes De Finalizar Uma Tarefa

- Código compila.
- Lint/testes relevantes foram executados ou motivo foi documentado.
- Mudancas de banco tem migration.
- Variáveis novas foram adicionadas ao `.env.example`.
- Documentação foi atualizada quando necessário.
- Nenhum secret foi adicionado.
- Riscos foram informados.
