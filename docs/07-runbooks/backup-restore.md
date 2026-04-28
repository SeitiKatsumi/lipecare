# Runbook: Backup E Restore

## Backup

- Executar backup automatico do PostgreSQL.
- Armazenar copia fora da VPS.
- Proteger credenciais de backup.
- Definir retencao.
- Monitorar falhas de backup.

## Restore

1. Escolher backup.
2. Restaurar primeiro em ambiente isolado.
3. Validar integridade.
4. Conferir versao da aplicacao e migrations.
5. Restaurar producao somente com aprovacao.

## Frequencia Recomendada

- Backup diario no inicio.
- Teste de restore mensal.
- Backup manual antes de migration critica.

