# Arquitetura

## Visao Recomendada

O LipeCare deve iniciar como um monolito modular com frontend e backend separados, usando Docker para execucao e CapRover para deploy.

```text
Paciente / Profissional
  -> Frontend Web/PWA
  -> Backend API
  -> PostgreSQL
  -> Storage privado S3
  -> Redis / filas
  -> n8n / automacoes
  -> OpenAI
  -> WhatsApp provider
```

## Decisao: Monolito Modular Primeiro

Apesar de a proposta citar microservices, a recomendacao inicial e um monolito modular.

Vantagens:

- menor custo operacional;
- desenvolvimento mais rapido;
- deploy mais simples;
- observabilidade mais facil;
- melhor para time pequeno;
- permite extrair servicos depois.

Riscos:

- precisa de disciplina de modulos;
- regras de tenant e permissao devem ser centralizadas;
- crescimento sem arquitetura pode gerar acoplamento.

## Modulos Iniciais

- `auth`
- `tenants`
- `users`
- `professionals`
- `patients`
- `clinical-history`
- `body-measurements`
- `symptoms`
- `habits`
- `lab-exams`
- `photos`
- `content-library`
- `schedules`
- `notifications`
- `whatsapp`
- `ai-insights`
- `reports`
- `audit-logs`
- `admin`

## Multi-Tenant

Todos os dados sensiveis devem ser associados a um `tenantId`.

Entidades principais:

```text
Tenant
User
Professional
Patient
PatientProfessional
ClinicalRecord
AuditLog
```

Regra obrigatoria: nenhuma consulta a dados de paciente pode ignorar tenant, vinculo profissional-paciente e permissao do usuario.

## IA

IA deve ser usada para apoio, nao para substituir decisao clinica. Recomenda-se:

- registrar prompt, modelo e versao da regra usada;
- evitar envio de dados identificaveis quando possivel;
- salvar explicacao/resumo do insight;
- exibir aviso de apoio a decisao, nao diagnostico automatico.

