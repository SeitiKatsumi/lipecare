# Runbook: Rollback

## Quando Usar

- erro critico apos deploy;
- indisponibilidade;
- falha de migration;
- erro de permissao ou vazamento potencial;
- regressao em fluxo principal.

## Passos

1. Identificar versao anterior estavel.
2. Pausar novas alteracoes.
3. Avaliar se houve migration irreversivel.
4. Restaurar imagem/app anterior no CapRover.
5. Restaurar backup do banco se necessario e aprovado.
6. Validar health check.
7. Testar fluxos principais.
8. Registrar incidente e causa provavel.

## Observacao

Rollback de codigo e simples. Rollback de banco pode ser complexo. Toda migration destrutiva precisa de plano antes do deploy.

