# Seguranca E LGPD

## Classificacao De Dados

O LipeCare trata dados pessoais sensiveis de saude. Isso exige controles tecnicos e organizacionais superiores aos de um app comum.

## Principios

- minimizacao de dados;
- controle de acesso por perfil;
- isolamento por tenant;
- registro de auditoria;
- criptografia em transito;
- backups protegidos;
- retencao e exclusao documentadas;
- consentimento claro do usuario;
- menor privilegio.

## Controles Obrigatorios

- HTTPS em todos os ambientes publicos.
- Banco sem exposicao publica.
- Storage privado para fotos e exames.
- URLs assinadas e temporarias para arquivos sensiveis.
- Logs sem dados clinicos desnecessarios.
- Auditoria de acesso a dados de paciente.
- Separacao entre staging e producao.
- MFA para GitHub, CapRover e provedores criticos.

## IA E Dados Sensíveis

Antes de enviar dados para IA:

- avaliar se o dado e necessario;
- remover identificadores quando possivel;
- registrar finalidade;
- evitar diagnostico automatico;
- manter profissional responsavel no fluxo de decisao.

## Riscos Principais

- vazamento de fotos ou exames;
- acesso cruzado entre tenants;
- banco exposto na internet;
- secret commitado;
- logs com dados de paciente;
- WhatsApp recebendo informacoes sensiveis sem consentimento;
- IA recebendo informacoes alem do necessario.

