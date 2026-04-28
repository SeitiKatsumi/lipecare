# Contexto Do Projeto

## Nome

LipeCare

## Objetivo

Criar uma plataforma digital para acompanhamento de pacientes com lipedema, com foco em cuidado humanizado, monitoramento continuo, educacao em saude e apoio a decisao clinica.

## Usuarios Principais

- Paciente: registra sintomas, praticas, medidas, fotos, exames e recebe orientacoes.
- Profissional de saude: acompanha pacientes, configura protocolos, analisa evolucao e toma decisoes.
- Administrador: gerencia tenants, usuarios, permissoes, configuracoes e operacao.
- Operacao Elevenmind: acompanha deploy, suporte, automacoes, logs e incidentes.

## Funcionalidades Macro

- Autenticacao e controle de acesso.
- Cadastro de profissionais.
- Cadastro de pacientes.
- Vinculo profissional-paciente.
- Historico clinico.
- Registro de sintomas.
- Registro de medidas corporais.
- Registro de peso e IMC.
- Registro de exames laboratoriais.
- Registro de fotos evolutivas.
- Monitoramento de habitos.
- Biblioteca de conteudos.
- Dicas por tema.
- Agenda, periodicidade e lembretes.
- Notificacoes.
- WhatsApp para inputs e alertas.
- Dashboards e indicadores.
- IA para insights e recomendacoes.
- Multi-tenant e whitelabel.

## Premissas Criticas

- O sistema lida com dados pessoais sensiveis de saude.
- Producao, staging e desenvolvimento precisam ser isolados.
- Acesso a dados clinicos deve ser registrado e autorizado.
- IA deve receber apenas os dados necessarios para a tarefa.
- Fotos e exames devem ficar em storage privado, nao em pasta publica.
- Toda decisao arquitetural relevante deve ser versionada como ADR.

## Fora Do Escopo Inicial

Estes itens podem existir no futuro, mas nao devem bloquear o MVP:

- aplicativo nativo iOS/Android;
- microservices independentes;
- machine learning proprio;
- integracao com prontuario hospitalar complexo;
- faturamento completo;
- prescricao medica formal.

