# Contribuindo Com O LipeCare

## Fluxo De Trabalho

1. Criar ou escolher uma issue.
2. Criar branch curta a partir da branch principal.
3. Implementar mudancas pequenas e revisaveis.
4. Rodar lint, testes e build.
5. Abrir Pull Request com descricao clara.
6. Validar em staging antes de producao.

## Branches

- `main`: producao.
- `feature/*`: novas funcionalidades.
- `fix/*`: correcoes.
- `chore/*`: manutencao.
- `hotfix/*`: correcao urgente de producao.

## Commits

Preferir mensagens objetivas:

```text
feat: add patient symptom tracking
fix: validate tenant access on patient records
docs: update CapRover deployment guide
```

## Regras De Qualidade

- Nao misturar refatoracao ampla com feature.
- Nao commitar secrets.
- Nao usar dados reais de pacientes em testes.
- Atualizar documentacao quando alterar arquitetura, deploy, banco ou seguranca.
- Toda mudanca em dado sensivel deve considerar LGPD, auditoria e permissoes.

## Pull Requests

Todo PR deve informar:

- objetivo;
- telas ou fluxos afetados;
- impacto em banco/migrations;
- variaveis novas;
- como testar;
- riscos conhecidos.

