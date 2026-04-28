# Banco De Dados

## Banco Recomendado

PostgreSQL.

## Ambientes

```text
lipecare_local
lipecare_staging
lipecare_production
```

Cada ambiente deve ter usuario e senha proprios.

## Acesso

- Banco de producao nao deve expor porta publica.
- Aplicacao deve acessar banco pela rede interna do CapRover/Docker.
- Acesso humano a producao deve ser excepcional, temporario e registrado.
- Desenvolvedores devem usar banco local ou staging.

## Migrations

Migrations devem ser versionadas no repositorio via Prisma.

Regras:

- revisar migrations antes de producao;
- evitar alteracoes destrutivas sem plano;
- fazer backup antes de migrations criticas;
- testar migration em staging.

## Backups

Backups devem ser:

- automaticos;
- criptografados quando possivel;
- armazenados fora da VPS;
- testados periodicamente com restore.

## Dados Sensíveis

Dados de saude, fotos, exames e historico clinico devem ter acesso minimo e rastreavel.

Nunca usar dump de producao em desenvolvimento sem anonimizacao.

