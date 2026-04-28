# Runbook: Deploy

## Antes Do Deploy

- Confirmar CI verde.
- Revisar migrations.
- Validar variaveis de ambiente.
- Confirmar backup quando houver mudanca em banco.
- Testar em staging.
- Validar health check.
- Conferir plano de rollback.

## Durante O Deploy

- Acompanhar logs da aplicacao.
- Acompanhar status do container.
- Verificar erros 5xx.
- Confirmar conexao com banco, Redis, storage e servicos externos.

## Depois Do Deploy

- Testar fluxos principais.
- Verificar Sentry/logs.
- Verificar consumo de CPU/RAM/disco.
- Registrar versao publicada.

