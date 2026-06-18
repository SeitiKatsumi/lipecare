# Contribuindo Com O LipeCare

## Fluxo De Trabalho

1. Criar ou escolher uma issue.
2. Antes de editar, puxar a última versão do GitHub.
3. Implementar mudanças pequenas.
4. Antes de enviar, puxar novamente a última versão.
5. Resolver conflitos, se existirem.
6. Fazer push para o GitHub.
7. O CI e o deploy no CapRover rodam automaticamente.

## Antes De Editar No Codex

Todo colaborador deve rodar:

```powershell
.\scripts\sync-before-edit.ps1
```

Esse script:

- bloqueia se houver alterações locais não salvas;
- troca para a branch `main`;
- faz `git fetch origin`;
- faz `git pull --rebase origin main`;
- só então libera o projeto para edição.

Comando manual equivalente:

```powershell
git status
git switch main
git pull --rebase origin main
```

## Antes De Enviar Para O GitHub

Antes do push, atualizar novamente:

```powershell
git pull --rebase origin main
git push origin main
```

Se outro colaborador enviou algo antes, o Git vai pedir para resolver conflito antes do push.

## Branches

- `main`: produção e deploy automático.
- `feature/*`: novas funcionalidades.
- `fix/*`: correções.
- `chore/*`: manutenção.
- `hotfix/*`: correção urgente de produção.

## Commits

Preferir mensagens objetivas:

```text
feat: add patient symptom tracking
fix: validate tenant access on patient records
docs: update CapRover deployment guide
```

## Regras De Qualidade

- Não misturar refatoração ampla com feature.
- Não commitar secrets.
- Não usar dados reais de pacientes em testes.
- Sempre puxar a última versão antes de editar.
- Sempre puxar a última versão antes de fazer push.
- Atualizar documentação quando alterar arquitetura, deploy, banco ou segurança.
- Toda mudança em dado sensível deve considerar LGPD, auditoria e permissões.

## Pull Requests Opcionais

PR é recomendado para mudanças grandes ou revisão entre colaboradores, mas não é obrigatório neste fluxo. Quando houver PR, informar:

- objetivo;
- telas ou fluxos afetados;
- impacto em banco/migrations;
- variáveis novas;
- como testar;
- riscos conhecidos.

