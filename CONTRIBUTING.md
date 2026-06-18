# Contribuindo Com O LipeCare

## Fluxo De Trabalho

1. Criar ou escolher uma issue.
2. Atualizar a branch principal local antes de editar.
3. Criar uma branch curta a partir da `main` atualizada.
4. Implementar mudanças pequenas e revisáveis.
5. Rodar lint, testes e build.
6. Abrir Pull Request com descrição clara.
7. Aguardar CI passar e revisão antes do merge.
8. O deploy de produção roda automaticamente após merge aprovado na `main`.

## Antes De Editar

Sempre começar puxando a última versão do GitHub:

```powershell
git checkout main
git pull --rebase origin main
```

Depois criar uma branch nova:

```powershell
git checkout -b feature/nome-curto-da-tarefa
```

Se a branch já existir, atualizar com a `main` antes de continuar:

```powershell
git fetch origin
git rebase origin/main
```

## Branches

- `main`: produção protegida. Não fazer push direto.
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
- Atualizar documentação quando alterar arquitetura, deploy, banco ou segurança.
- Toda mudança em dado sensível deve considerar LGPD, auditoria e permissões.
- Antes de abrir PR, atualizar a branch com `git rebase origin/main`.
- Resolver conflitos localmente antes de pedir revisão.

## Pull Requests

Todo PR deve informar:

- objetivo;
- telas ou fluxos afetados;
- impacto em banco/migrations;
- variáveis novas;
- como testar;
- riscos conhecidos.

## Proteção Da Main

A branch `main` exige:

- Pull Request obrigatório.
- Pelo menos uma aprovação.
- CI `quality` aprovado.
- Branch atualizada com a última `main` antes do merge.
- Histórico linear.
- Force push bloqueado.
- Deleção da branch bloqueada.
