# Deploy Automático No CapRover

## Fluxo Oficial

1. O código fonte oficial fica no GitHub, no repositório `SeitiKatsumi/lipecare`.
2. Colaboradores trabalham por branch e pull request.
3. A branch `main` dispara o CI.
4. Se o CI passar, o GitHub Actions chama o webhook do CapRover.
5. O CapRover baixa a `main`, gera a imagem e publica o app `lipecare`.

## Regra De Acesso

- Colaboradores não precisam acessar o CapRover para publicar.
- O CapRover deve ser acessado apenas por administradores do ambiente.
- Nenhuma senha, token ou webhook deve ser escrito no código, documentação ou chat.

## Secret Necessário No GitHub

Criar o secret abaixo em:

`GitHub > SeitiKatsumi/lipecare > Settings > Secrets and variables > Actions > New repository secret`

Nome:

`CAPROVER_LIPECARE_WEBHOOK_URL`

Valor:

URL completa do webhook de build do app `lipecare` no CapRover.

## Workflow

O arquivo `.github/workflows/caprover-deploy.yml` dispara o deploy de produção quando o workflow `CI` termina com sucesso na branch `main`.

Também é possível rodar manualmente em:

`GitHub > Actions > Deploy CapRover > Run workflow`

## Conferência Pós-Deploy

Após o deploy, conferir:

`https://lipecare.dna11.com.br/config.js`

O conteúdo deve refletir a versão, número de deploy e commit esperados.
