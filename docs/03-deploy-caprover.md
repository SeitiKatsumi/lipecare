# Deploy Com CapRover

## Estrutura De Apps

Recomendado no CapRover:

```text
lipecare-web-staging
lipecare-web-production
lipecare-api-staging
lipecare-api-production
postgres-staging
postgres-production
redis-staging
redis-production
n8n-staging
n8n-production
```

Servicos de producao e staging devem ter variaveis, bancos, volumes e dominios separados.

## Dominios

Exemplo:

```text
staging.lipecare.com.br -> VPS
app.lipecare.com.br     -> VPS
captain.dominio.com.br  -> VPS
```

No DNS, configurar registros `A` apontando para o IP da VPS.

## Deploy Recomendado

GitHub Actions deve:

1. instalar dependencias;
2. rodar lint;
3. rodar testes;
4. gerar build;
5. validar Docker build;
6. acionar deploy no CapRover.

## Dockerfiles

O monorepo possui Dockerfiles separados:

```text
preview/Dockerfile
apps/web/Dockerfile
apps/api/Dockerfile
```

Para o primeiro staging visual, o `captain-definition` da raiz aponta para `preview/Dockerfile`.

No deploy real, usar apps separados para web e API. Isso facilita escala, logs, variaveis e rollback independente.

## Primeiro Deploy: Preview

App CapRover recomendado:

```text
lipecare-preview-staging
```

Formulario GitHub/Bitbucket/GitLab no CapRover:

```text
Repository: https://github.com/SeitiKatsumi/lipecare
Branch: main
Username: deixar vazio se o repositorio continuar publico
Password: deixar vazio se o repositorio continuar publico
SSH Key: deixar vazio se usar repositorio publico por HTTPS
```

Se o repositorio ficar privado, use uma chave SSH de deploy ou um GitHub Personal Access Token com permissao minima de leitura do repositorio. Nao use sua senha do GitHub.

## Variaveis

Secrets reais devem ficar no CapRover e no GitHub Secrets, nunca no repositorio.

## Rollback

Antes de deploy em producao:

- identificar versao anterior;
- confirmar backup do banco, se houver migration;
- validar health check;
- acompanhar logs nos primeiros minutos.

Ver `docs/07-runbooks/rollback.md`.
