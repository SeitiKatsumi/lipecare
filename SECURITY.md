# Politica De Seguranca

O LipeCare manipula dados pessoais sensiveis de saude. Por isso, falhas de seguranca podem gerar risco legal, reputacional e operacional.

## Nunca Expor

- credenciais;
- tokens;
- chaves privadas;
- dumps de banco;
- dados reais de pacientes;
- fotos evolutivas;
- exames;
- historico clinico;
- URLs privadas de arquivos;
- logs com dados identificaveis.

## Ambientes

- Producao e staging devem usar bancos separados.
- Banco de producao nao deve ficar exposto publicamente.
- Acesso administrativo deve ser minimo, rastreavel e revogavel.
- Dados de producao so podem ser usados fora de producao se forem anonimizados.

## Incidentes

Em caso de vazamento, acesso indevido ou erro critico:

1. interromper o vetor de exposicao;
2. preservar evidencias;
3. rotacionar credenciais afetadas;
4. avaliar impacto;
5. registrar incidente;
6. comunicar responsaveis;
7. executar plano de correcao.

Ver tambem `docs/07-runbooks/incidentes.md`.

