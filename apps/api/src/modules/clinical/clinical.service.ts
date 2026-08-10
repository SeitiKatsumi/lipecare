import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClinicalAlertSeverity, Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service.js";
import type { RequestAuth } from "../auth/auth.types.js";
import type { ClinicalStateInput, ConversationProfileInput } from "./clinical.schemas.js";

type SummaryInput = {
  name: string;
  status: string;
  lastSituation?: string | null;
  engagement?: number | null;
  answers?: Record<string, unknown>;
  symptom?: { painLevel: number | null; notes: string | null; recordedAt: Date } | null;
  measurement?: {
    weightKg: Prisma.Decimal | null;
    waistCm: Prisma.Decimal | null;
    hipCm: Prisma.Decimal | null;
    recordedAt: Date;
  } | null;
  recentMessages?: Array<{ externalId: string; text: string; sentAt: Date }>;
  checkInExternalId?: string | null;
  symptomExternalId?: string | null;
  measurementExternalId?: string | null;
};

type DetectedSignal = {
  sourceKey: string;
  type: string;
  severity: ClinicalAlertSeverity;
  title: string;
  details: string;
};

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function dateValue(value: string | null | undefined, fallback = new Date()) {
  if (!value) return fallback;
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00.000Z` : value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function dateOnly(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function jsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function messageTime(value: Date) {
  return value.toISOString();
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function buildClinicalSummary(input: SummaryInput) {
  const answers = input.answers || {};
  const scores = [
    ["bem-estar", numberValue(answers.wellbeing)],
    ["dor", numberValue(answers.pain)],
    ["inchaço", numberValue(answers.swelling)],
    ["sono", numberValue(answers.sleep)],
    ["energia", numberValue(answers.energy)],
    ["estresse", numberValue(answers.stress)]
  ].filter((item): item is [string, number] => item[1] !== null);
  const priority = textValue(answers.priority);
  const commitment = textValue(answers.commitment);
  const sections = [`${input.name}: ${input.status || "acompanhamento em atualização"}.`];

  if (scores.length) sections.push(`Indicadores recentes: ${scores.map(([label, value]) => `${label} ${value}/10`).join(", ")}.`);
  if (input.symptom?.painLevel !== null && input.symptom?.painLevel !== undefined) {
    const symptomNote = input.symptom.notes?.replace(/[.!?]+$/, "") || "";
    sections.push(`Último sintoma: dor ${input.symptom.painLevel}/10${symptomNote ? `, ${symptomNote}` : ""}.`);
  }
  if (input.measurement) {
    const measurements = [
      input.measurement.weightKg !== null ? `peso ${Number(input.measurement.weightKg)} kg` : "",
      input.measurement.waistCm !== null ? `cintura ${Number(input.measurement.waistCm)} cm` : "",
      input.measurement.hipCm !== null ? `quadril ${Number(input.measurement.hipCm)} cm` : ""
    ].filter(Boolean);
    if (measurements.length) sections.push(`Medidas mais recentes: ${measurements.join(", ")}.`);
  }
  if (priority) sections.push(`Prioridade relatada: ${priority}.`);
  if (commitment) sections.push(`Combinado atual: ${commitment}.`);
  if (input.lastSituation) sections.push(`Etapa atual: ${input.lastSituation}.`);
  if (input.engagement !== null && input.engagement !== undefined) sections.push(`Engajamento estimado: ${input.engagement}/10.`);

  return {
    narrative: sections.join(" "),
    structured: {
      scores: Object.fromEntries(scores),
      priority,
      commitment,
      lastSituation: input.lastSituation || null,
      engagement: input.engagement ?? null,
      latestPain: input.symptom?.painLevel ?? null
    },
    sourceReferences: [
      input.checkInExternalId ? { type: "checkin", id: input.checkInExternalId } : null,
      input.symptomExternalId ? { type: "symptom", id: input.symptomExternalId } : null,
      input.measurementExternalId ? { type: "measurement", id: input.measurementExternalId } : null,
      ...(input.recentMessages || []).slice(-3).map((message) => ({ type: "message", id: message.externalId }))
    ].filter(Boolean)
  };
}

export function detectClinicalSignals(input: {
  symptomExternalId?: string | null;
  pain?: number | null;
  checkInExternalId?: string | null;
  answers?: Record<string, unknown>;
  engagement?: number | null;
  messages?: Array<{ externalId: string; text: string }>;
}) {
  const signals: DetectedSignal[] = [];
  const pain = input.pain ?? numberValue(input.answers?.pain);
  const swelling = numberValue(input.answers?.swelling);
  if (pain !== null && pain >= 7) {
    signals.push({
      sourceKey: `pain:${input.symptomExternalId || input.checkInExternalId || "current"}`,
      type: "HIGH_PAIN",
      severity: pain >= 9 ? "CRITICAL" : "HIGH",
      title: "Dor elevada",
      details: `Foi registrado nível de dor ${pain}/10. A equipe deve revisar a evolução e o contexto.`
    });
  }
  if (swelling !== null && swelling >= 7) {
    signals.push({
      sourceKey: `swelling:${input.checkInExternalId || "current"}`,
      type: "HIGH_SWELLING",
      severity: swelling >= 9 ? "CRITICAL" : "HIGH",
      title: "Inchaço elevado",
      details: `Foi registrado nível de inchaço ${swelling}/10. A equipe deve revisar a evolução.`
    });
  }
  if (input.engagement !== null && input.engagement !== undefined && input.engagement <= 4) {
    signals.push({
      sourceKey: "engagement:low",
      type: "LOW_ENGAGEMENT",
      severity: "MEDIUM",
      title: "Engajamento reduzido",
      details: `O engajamento estimado está em ${input.engagement}/10. Considere contato humano e um próximo passo simples.`
    });
  }
  const urgentPattern = /falta de ar|dor no peito|desmai|sangramento intenso|dor insuportavel|piora rapida/;
  for (const message of input.messages || []) {
    if (!urgentPattern.test(normalizeText(message.text))) continue;
    signals.push({
      sourceKey: `urgent-message:${message.externalId}`,
      type: "URGENT_LANGUAGE",
      severity: "CRITICAL",
      title: "Mensagem com possível sinal de urgência",
      details: "A conversa contém um relato que exige revisão humana imediata e orientação para atendimento médico."
    });
  }
  return signals;
}

@Injectable()
export class ClinicalService {
  constructor(private readonly prisma: PrismaService) {}

  async state(auth: RequestAuth) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: auth.tenant.id } });
    if (!tenant) throw new NotFoundException("Clínica não encontrada.");
    const patients = await this.prisma.patient.findMany({
      where: this.accessiblePatientWhere(auth),
      include: {
        user: { select: { email: true } },
        professionals: { include: { professional: { include: { user: { select: { id: true } } } } } },
        symptoms: { orderBy: { recordedAt: "desc" }, take: 500 },
        measurements: { orderBy: { recordedAt: "desc" }, take: 500 },
        conversationMessages: { orderBy: { sentAt: "desc" }, take: 2000 },
        checkIns: { orderBy: { recordedAt: "desc" }, take: 500 },
        clinicalMemory: true,
        clinicalSummaryRecord: true,
        clinicalAlerts: { orderBy: { detectedAt: "desc" }, take: 200 },
        clinicalTasks: { orderBy: { dueAt: "asc" }, take: 500 }
      },
      orderBy: { fullName: "asc" }
    });

    const chats: Record<string, unknown[]> = {};
    const conversationProfiles: Record<string, unknown> = {};
    const clinicalSummaries: Record<string, unknown> = {};
    const symptoms: unknown[] = [];
    const measurements: unknown[] = [];
    const checkins: unknown[] = [];
    const tasks: unknown[] = [];
    const clinicalAlerts: unknown[] = [];

    for (const patient of patients) {
      chats[patient.id] = patient.conversationMessages.slice().reverse().map((message) => ({
        id: message.externalId,
        role: message.role,
        author: message.authorName,
        date: messageTime(message.sentAt),
        text: message.text,
        attachments: message.attachments,
        ai: message.aiGenerated,
        fallback: message.fallback
      }));
      conversationProfiles[patient.id] = patient.clinicalMemory?.structured || {};
      if (patient.clinicalSummaryRecord) {
        clinicalSummaries[patient.id] = {
          narrative: patient.clinicalSummaryRecord.narrative,
          structured: patient.clinicalSummaryRecord.structured,
          sourceReferences: patient.clinicalSummaryRecord.sourceReferences,
          status: patient.clinicalSummaryRecord.status,
          generatedAt: patient.clinicalSummaryRecord.generatedAt.toISOString(),
          reviewedAt: patient.clinicalSummaryRecord.reviewedAt?.toISOString() || null
        };
      }
      symptoms.push(...patient.symptoms.map((item) => ({
        id: item.externalId || item.id,
        patientId: patient.id,
        date: dateOnly(item.recordedAt),
        pain: item.painLevel,
        note: item.notes || ""
      })));
      measurements.push(...patient.measurements.map((item) => ({
        id: item.externalId || item.id,
        patientId: patient.id,
        date: dateOnly(item.recordedAt),
        weight: item.weightKg === null ? null : Number(item.weightKg),
        height: item.heightCm === null ? null : Number(item.heightCm),
        thigh: item.thighCm === null ? null : Number(item.thighCm),
        leg: item.legCm === null ? null : Number(item.legCm),
        waist: item.waistCm === null ? null : Number(item.waistCm),
        hip: item.hipCm === null ? null : Number(item.hipCm),
        note: item.notes || ""
      })));
      checkins.push(...patient.checkIns.map((item) => ({
        id: item.externalId,
        patientId: patient.id,
        date: item.recordedAt.toISOString(),
        type: item.type,
        frequency: item.frequency,
        answers: item.answers
      })));
      tasks.push(...patient.clinicalTasks.map((item) => ({
        id: item.externalId,
        patientId: patient.id,
        title: item.title,
        type: item.type,
        status: item.status,
        priority: item.priority,
        due: dateOnly(item.dueAt)
      })));
      clinicalAlerts.push(...patient.clinicalAlerts.map((alert) => ({
        id: alert.id,
        patientId: patient.id,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        details: alert.details,
        detectedAt: alert.detectedAt.toISOString(),
        reviewedAt: alert.reviewedAt?.toISOString() || null
      })));
    }

    return {
      initialized: Boolean(tenant.clinicalInitializedAt),
      patients: patients.map((patient) => ({
        id: patient.id,
        name: patient.fullName,
        age: patient.age,
        phone: patient.phone || "",
        email: patient.email || patient.user?.email || "",
        city: patient.city || "",
        doctorId: patient.professionals[0]?.professional.user.id || null,
        status: patient.status,
        lastCheckin: dateOnly(patient.lastCheckInAt),
        summary: patient.clinicalSummaryRecord?.narrative || patient.clinicalSummary || "",
        interactionFrequency: patient.clinicalMemory?.frequency || null,
        planningDay: null,
        focusMetrics: []
      })),
      symptoms,
      measurements,
      tasks,
      checkins,
      chats,
      conversationProfiles,
      clinicalSummaries,
      clinicalAlerts
    };
  }

  async sync(auth: RequestAuth, input: ClinicalStateInput) {
    await this.prisma.$transaction(async (transaction) => {
      const allowedPatientIds = new Set<string>();
      for (const patient of input.patients) {
        const existing = await transaction.patient.findFirst({ where: { id: patient.id, tenantId: auth.tenant.id } });
        const existingAccessible = existing
          ? Boolean(await transaction.patient.findFirst({
              where: { ...this.accessiblePatientWhere(auth), id: existing.id },
              select: { id: true }
            }))
          : false;
        if (!this.canWritePatient(auth, existing?.id || null, patient.doctorId || null, existingAccessible)) continue;
        if (auth.user.role === "PATIENT" && existing) {
          allowedPatientIds.add(existing.id);
          continue;
        }
        const lastCheckInAt = patient.lastCheckin ? dateValue(patient.lastCheckin) : null;
        if (existing) {
          await transaction.patient.update({
            where: { id: existing.id },
            data: {
              fullName: patient.name,
              age: patient.age ?? null,
              phone: patient.phone || null,
              email: patient.email || null,
              city: patient.city || null,
              status: patient.status,
              lastCheckInAt,
              clinicalSummary: patient.summary || null
            }
          });
        } else {
          await transaction.patient.create({
            data: {
              id: patient.id,
              tenantId: auth.tenant.id,
              fullName: patient.name,
              age: patient.age ?? null,
              phone: patient.phone || null,
              email: patient.email || null,
              city: patient.city || null,
              status: patient.status,
              lastCheckInAt,
              clinicalSummary: patient.summary || null
            }
          });
        }
        allowedPatientIds.add(patient.id);
        await this.ensureProfessionalAssignment(transaction, auth, patient.id, patient.doctorId || null);
      }

      const accessible = await transaction.patient.findMany({
        where: this.accessiblePatientWhere(auth),
        select: { id: true }
      });
      accessible.forEach((patient) => allowedPatientIds.add(patient.id));

      const messageIds = Object.values(input.chats).flatMap((messages) => messages.map((message) => message.id));
      const [storedSymptoms, storedMeasurements, storedTasks, storedCheckIns, storedMessages] = await Promise.all([
        transaction.symptomRecord.findMany({ where: { tenantId: auth.tenant.id, externalId: { in: input.symptoms.map((item) => item.id) } }, select: { externalId: true, patientId: true } }),
        transaction.bodyMeasurement.findMany({ where: { tenantId: auth.tenant.id, externalId: { in: input.measurements.map((item) => item.id) } }, select: { externalId: true, patientId: true } }),
        transaction.clinicalTask.findMany({ where: { tenantId: auth.tenant.id, externalId: { in: input.tasks.map((item) => item.id) } }, select: { externalId: true, patientId: true } }),
        transaction.checkInRecord.findMany({ where: { tenantId: auth.tenant.id, externalId: { in: input.checkins.map((item) => item.id) } }, select: { externalId: true, patientId: true } }),
        transaction.conversationMessage.findMany({ where: { tenantId: auth.tenant.id, externalId: { in: messageIds } }, select: { externalId: true, patientId: true } })
      ]);
      const symptomOwners = new Map(storedSymptoms.map((item) => [item.externalId, item.patientId]));
      const measurementOwners = new Map(storedMeasurements.map((item) => [item.externalId, item.patientId]));
      const taskOwners = new Map(storedTasks.map((item) => [item.externalId, item.patientId]));
      const checkInOwners = new Map(storedCheckIns.map((item) => [item.externalId, item.patientId]));
      const messageOwners = new Map(storedMessages.map((item) => [item.externalId, item.patientId]));

      for (const item of input.symptoms.filter((entry) => allowedPatientIds.has(entry.patientId))) {
        if (symptomOwners.has(item.id) && symptomOwners.get(item.id) !== item.patientId) continue;
        symptomOwners.set(item.id, item.patientId);
        await transaction.symptomRecord.upsert({
          where: { tenantId_externalId: { tenantId: auth.tenant.id, externalId: item.id } },
          update: {},
          create: { tenantId: auth.tenant.id, patientId: item.patientId, externalId: item.id, painLevel: item.pain ?? null, notes: item.note || null, recordedAt: dateValue(item.date) }
        });
      }
      for (const item of input.measurements.filter((entry) => allowedPatientIds.has(entry.patientId))) {
        if (measurementOwners.has(item.id) && measurementOwners.get(item.id) !== item.patientId) continue;
        measurementOwners.set(item.id, item.patientId);
        const measurement = this.measurementData(item);
        await transaction.bodyMeasurement.upsert({
          where: { tenantId_externalId: { tenantId: auth.tenant.id, externalId: item.id } },
          update: {},
          create: { tenantId: auth.tenant.id, externalId: item.id, ...measurement }
        });
      }
      for (const item of input.tasks.filter((entry) => auth.user.role !== "PATIENT" && allowedPatientIds.has(entry.patientId))) {
        if (taskOwners.has(item.id) && taskOwners.get(item.id) !== item.patientId) continue;
        taskOwners.set(item.id, item.patientId);
        await transaction.clinicalTask.upsert({
          where: { tenantId_externalId: { tenantId: auth.tenant.id, externalId: item.id } },
          update: { patientId: item.patientId, title: item.title, type: item.type, status: item.status, priority: item.priority || null, dueAt: item.due ? dateValue(item.due) : null },
          create: { tenantId: auth.tenant.id, patientId: item.patientId, externalId: item.id, title: item.title, type: item.type, status: item.status, priority: item.priority || null, dueAt: item.due ? dateValue(item.due) : null }
        });
      }
      for (const item of input.checkins.filter((entry) => allowedPatientIds.has(entry.patientId))) {
        if (checkInOwners.has(item.id) && checkInOwners.get(item.id) !== item.patientId) continue;
        checkInOwners.set(item.id, item.patientId);
        await transaction.checkInRecord.upsert({
          where: { tenantId_externalId: { tenantId: auth.tenant.id, externalId: item.id } },
          update: {},
          create: { tenantId: auth.tenant.id, patientId: item.patientId, externalId: item.id, type: item.type, frequency: item.frequency || null, answers: jsonInput(item.answers), recordedAt: dateValue(item.date) }
        });
      }
      for (const [patientId, messages] of Object.entries(input.chats)) {
        if (!allowedPatientIds.has(patientId)) continue;
        for (const message of messages) {
          if (messageOwners.has(message.id) && messageOwners.get(message.id) !== patientId) continue;
          messageOwners.set(message.id, patientId);
          await transaction.conversationMessage.upsert({
            where: { tenantId_externalId: { tenantId: auth.tenant.id, externalId: message.id } },
            update: {},
            create: {
              tenantId: auth.tenant.id,
              patientId,
              externalId: message.id,
              role: message.role,
              authorUserId: message.role === "assistant" ? null : auth.user.id,
              authorName: message.author || null,
              text: message.text,
              attachments: jsonInput(message.attachments),
              aiGenerated: message.ai,
              fallback: message.fallback,
              sentAt: dateValue(message.date)
            }
          });
        }
      }
      for (const [patientId, profile] of Object.entries(input.conversationProfiles)) {
        if (!allowedPatientIds.has(patientId)) continue;
        const memory = this.memoryData(profile);
        await transaction.clinicalMemory.upsert({
          where: { patientId },
          update: { ...memory, version: { increment: 1 } },
          create: { tenantId: auth.tenant.id, patientId, ...memory, version: 1 }
        });
      }

      for (const patientId of allowedPatientIds) await this.refreshPatientInsights(transaction, auth.tenant.id, patientId);
      if (auth.user.role === "ADMIN") {
        await transaction.tenant.update({ where: { id: auth.tenant.id }, data: { clinicalInitializedAt: new Date() } });
      }
      await transaction.auditLog.create({
        data: { tenantId: auth.tenant.id, actorUserId: auth.user.id, action: "clinical_state_synced", resource: "clinical_state", metadata: { patientCount: allowedPatientIds.size } }
      });
    }, { timeout: 30000 });
    return this.state(auth);
  }

  async reviewSummary(auth: RequestAuth, patientId: string, input: { status: "APPROVED" | "NEEDS_REVISION"; narrative?: string }) {
    this.assertClinicalReviewer(auth);
    await this.assertPatientAccess(auth, patientId);
    const result = await this.prisma.clinicalSummary.updateMany({
      where: { tenantId: auth.tenant.id, patientId },
      data: {
        status: input.status,
        ...(input.narrative ? { narrative: input.narrative, editedByUserId: auth.user.id } : {}),
        reviewedByUserId: auth.user.id,
        reviewedAt: new Date()
      }
    });
    if (!result.count) throw new NotFoundException("Resumo clínico não encontrado.");
    if (input.narrative) await this.prisma.patient.updateMany({ where: { id: patientId, tenantId: auth.tenant.id }, data: { clinicalSummary: input.narrative } });
    await this.audit(auth, "clinical_summary_reviewed", "clinical_summary", patientId, { status: input.status });
    return this.state(auth);
  }

  async reviewAlert(auth: RequestAuth, alertId: string, status: "ACKNOWLEDGED" | "RESOLVED") {
    this.assertClinicalReviewer(auth);
    const alert = await this.prisma.clinicalAlert.findFirst({ where: { id: alertId, tenantId: auth.tenant.id } });
    if (!alert) throw new NotFoundException("Alerta clínico não encontrado.");
    await this.assertPatientAccess(auth, alert.patientId);
    await this.prisma.clinicalAlert.update({
      where: { id: alert.id },
      data: { status, reviewedByUserId: auth.user.id, reviewedAt: new Date() }
    });
    await this.audit(auth, "clinical_alert_reviewed", "clinical_alert", alert.id, { status });
    return this.state(auth);
  }

  async assistantMemory(auth: RequestAuth, patientId: string | null | undefined) {
    if (!patientId) return null;
    const patient = await this.prisma.patient.findFirst({
      where: { ...this.accessiblePatientWhere(auth), id: patientId },
      include: {
        clinicalMemory: true,
        clinicalSummaryRecord: true,
        conversationMessages: { orderBy: { sentAt: "desc" }, take: 16 }
      }
    });
    if (!patient) return null;
    return {
      summary: patient.clinicalSummaryRecord?.narrative || patient.clinicalMemory?.shortTermSummary || "",
      activePlan: patient.clinicalMemory?.activePlan || {},
      unresolvedQuestions: patient.clinicalMemory?.unresolvedQuestions || [],
      structured: patient.clinicalMemory?.structured || {},
      recentMessages: patient.conversationMessages.reverse().map((message) => ({
        role: message.role === "user" ? "user" as const : "assistant" as const,
        text: message.text
      }))
    };
  }

  private accessiblePatientWhere(auth: RequestAuth): Prisma.PatientWhereInput {
    const base: Prisma.PatientWhereInput = { tenantId: auth.tenant.id };
    if (auth.user.role === "ADMIN") return base;
    if (auth.user.role === "PATIENT") return { ...base, id: auth.user.patientId || "__none__" };
    return { ...base, professionals: { some: { professional: { userId: auth.user.id } } } };
  }

  private canWritePatient(
    auth: RequestAuth,
    existingPatientId: string | null,
    requestedDoctorId: string | null,
    existingAccessible: boolean
  ) {
    if (auth.user.role === "ADMIN") return true;
    if (auth.user.role === "PATIENT") return existingAccessible && existingPatientId === auth.user.patientId;
    if (!existingPatientId) return !requestedDoctorId || requestedDoctorId === auth.user.id;
    return existingAccessible;
  }

  private async ensureProfessionalAssignment(transaction: Prisma.TransactionClient, auth: RequestAuth, patientId: string, requestedDoctorId: string | null) {
    if (auth.user.role === "PATIENT") return;
    const userId = auth.user.role === "PROFESSIONAL" ? auth.user.id : requestedDoctorId;
    if (!userId) return;
    const professional = await transaction.professional.findFirst({ where: { tenantId: auth.tenant.id, userId } });
    if (!professional) return;
    await transaction.patientProfessional.upsert({
      where: { patientId_professionalId: { patientId, professionalId: professional.id } },
      update: { tenantId: auth.tenant.id },
      create: { tenantId: auth.tenant.id, patientId, professionalId: professional.id }
    });
  }

  private measurementData(item: ClinicalStateInput["measurements"][number]) {
    return {
      patientId: item.patientId,
      weightKg: item.weight ?? null,
      heightCm: item.height ?? null,
      thighCm: item.thigh ?? null,
      legCm: item.leg ?? null,
      waistCm: item.waist ?? null,
      hipCm: item.hip ?? null,
      notes: item.note || null,
      recordedAt: dateValue(item.date)
    };
  }

  private memoryData(profile: ConversationProfileInput) {
    const activePlan = {
      priority: textValue(profile.answers?.priority),
      commitment: textValue(profile.answers?.commitment)
    };
    return {
      shortTermSummary: profile.lastSituation || "Acompanhamento iniciado.",
      structured: jsonInput(profile),
      unresolvedQuestions: jsonInput(profile.unresolvedQuestions || []),
      activePlan: jsonInput(activePlan),
      engagement: profile.engagement ?? null,
      lastSituation: profile.lastSituation || null,
      frequency: profile.frequency || null
    } satisfies Omit<Prisma.ClinicalMemoryCreateInput, "tenant" | "patient" | "version">;
  }

  private async refreshPatientInsights(transaction: Prisma.TransactionClient, tenantId: string, patientId: string) {
    const patient = await transaction.patient.findFirst({
      where: { id: patientId, tenantId },
      include: {
        symptoms: { orderBy: { recordedAt: "desc" }, take: 1 },
        measurements: { orderBy: { recordedAt: "desc" }, take: 1 },
        checkIns: { orderBy: { recordedAt: "desc" }, take: 24 },
        conversationMessages: { orderBy: { sentAt: "desc" }, take: 12 },
        clinicalMemory: true,
        clinicalSummaryRecord: true
      }
    });
    if (!patient) return;
    const profile = (patient.clinicalMemory?.structured || {}) as Record<string, unknown>;
    const historicalAnswers = patient.checkIns.slice().reverse().reduce<Record<string, unknown>>((result, checkIn) => {
      const checkInAnswers = checkIn.answers && typeof checkIn.answers === "object" ? checkIn.answers as Record<string, unknown> : {};
      return { ...result, ...checkInAnswers };
    }, {});
    const currentAnswers = (profile.answers && typeof profile.answers === "object" ? profile.answers : {}) as Record<string, unknown>;
    const answers = { ...historicalAnswers, ...currentAnswers };
    const latestSymptom = patient.symptoms[0] || null;
    const latestMeasurement = patient.measurements[0] || null;
    const latestCheckIn = patient.checkIns[0] || null;
    const recentMessages = patient.conversationMessages.slice().reverse();
    const summary = buildClinicalSummary({
      name: patient.fullName,
      status: patient.status,
      lastSituation: patient.clinicalMemory?.lastSituation,
      engagement: patient.clinicalMemory?.engagement,
      answers,
      symptom: latestSymptom,
      measurement: latestMeasurement,
      recentMessages,
      checkInExternalId: latestCheckIn?.externalId,
      symptomExternalId: latestSymptom?.externalId,
      measurementExternalId: latestMeasurement?.externalId
    });
    const sourceReferencesChanged = JSON.stringify(patient.clinicalSummaryRecord?.sourceReferences || []) !== JSON.stringify(summary.sourceReferences);
    await transaction.clinicalSummary.upsert({
      where: { patientId },
      update: {
        ...(sourceReferencesChanged ? { narrative: summary.narrative } : {}),
        structured: jsonInput(summary.structured),
        sourceReferences: jsonInput(summary.sourceReferences),
        ...(sourceReferencesChanged ? { generatedAt: new Date(), status: "PENDING_REVIEW", reviewedAt: null, reviewedByUserId: null } : {})
      },
      create: {
        tenantId,
        patientId,
        narrative: summary.narrative,
        structured: jsonInput(summary.structured),
        sourceReferences: jsonInput(summary.sourceReferences)
      }
    });
    const activeNarrative = sourceReferencesChanged || !patient.clinicalSummaryRecord
      ? summary.narrative
      : patient.clinicalSummaryRecord.narrative;
    const unresolvedQuestions = [
      ["pain", "Confirmar a intensidade atual da dor."],
      ["swelling", "Confirmar a intensidade atual do inchaço."],
      ["sleep", "Atualizar a qualidade do sono."],
      ["priority", "Definir a prioridade atual do acompanhamento."]
    ].filter(([key]) => answers[key] === null || answers[key] === undefined || answers[key] === "").map(([, question]) => question);
    await transaction.patient.update({ where: { id: patientId }, data: { clinicalSummary: activeNarrative } });
    await transaction.clinicalMemory.upsert({
      where: { patientId },
      update: {
        shortTermSummary: activeNarrative,
        structured: jsonInput({ ...profile, clinicalFacts: answers }),
        unresolvedQuestions: jsonInput(unresolvedQuestions),
        activePlan: jsonInput({ priority: textValue(answers.priority), commitment: textValue(answers.commitment) })
      },
      create: {
        tenantId,
        patientId,
        shortTermSummary: activeNarrative,
        structured: jsonInput({ ...profile, clinicalFacts: answers }),
        unresolvedQuestions: jsonInput(unresolvedQuestions),
        activePlan: jsonInput({ priority: textValue(answers.priority), commitment: textValue(answers.commitment) })
      }
    });

    const signals = detectClinicalSignals({
      symptomExternalId: latestSymptom?.externalId,
      pain: latestSymptom?.painLevel,
      checkInExternalId: latestCheckIn?.externalId,
      answers,
      engagement: patient.clinicalMemory?.engagement,
      messages: recentMessages.map((message) => ({ externalId: message.externalId, text: message.text }))
    });
    for (const signal of signals) {
      await transaction.clinicalAlert.upsert({
        where: { tenantId_sourceKey: { tenantId, sourceKey: `${patientId}:${signal.sourceKey}` } },
        update: { type: signal.type, severity: signal.severity, title: signal.title, details: signal.details },
        create: { tenantId, patientId, sourceKey: `${patientId}:${signal.sourceKey}`, type: signal.type, severity: signal.severity, title: signal.title, details: signal.details }
      });
    }
  }

  private async assertPatientAccess(auth: RequestAuth, patientId: string) {
    const patient = await this.prisma.patient.findFirst({ where: { ...this.accessiblePatientWhere(auth), id: patientId }, select: { id: true } });
    if (!patient) throw new ForbiddenException("Você não tem acesso a este prontuário.");
  }

  private assertClinicalReviewer(auth: RequestAuth) {
    if (auth.user.role === "PATIENT") throw new ForbiddenException("Pacientes não podem revisar registros clínicos.");
  }

  private audit(auth: RequestAuth, action: string, resource: string, resourceId: string, metadata?: Prisma.InputJsonValue) {
    return this.prisma.auditLog.create({ data: { tenantId: auth.tenant.id, actorUserId: auth.user.id, action, resource, resourceId, metadata } });
  }
}
