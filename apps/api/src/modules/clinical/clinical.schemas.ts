import { z } from "zod";

const identifier = z.string().trim().min(1).max(120);
const dateText = z.string().trim().max(100).optional().nullable();
const nullableNumber = z.number().finite().optional().nullable();
const answerValue = z.union([z.string().max(4000), z.number().finite(), z.boolean(), z.null()]);

const patientSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1).max(160),
  age: z.number().int().min(0).max(130).optional().nullable(),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().max(254).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  doctorId: z.string().trim().max(120).optional().nullable(),
  status: z.string().trim().max(80).optional().default("Avaliação pendente"),
  lastCheckin: dateText,
  summary: z.string().trim().max(6000).optional().default(""),
  interactionFrequency: z.string().trim().max(80).optional().nullable(),
  planningDay: z.string().trim().max(40).optional().nullable(),
  focusMetrics: z.array(identifier).max(30).optional().default([])
}).strict();

const symptomSchema = z.object({
  id: identifier,
  patientId: identifier,
  date: dateText,
  pain: z.number().int().min(0).max(10).optional().nullable(),
  note: z.string().trim().max(6000).optional().default("")
}).strict();

const measurementSchema = z.object({
  id: identifier,
  patientId: identifier,
  date: dateText,
  weight: nullableNumber,
  height: nullableNumber,
  thigh: nullableNumber,
  leg: nullableNumber,
  waist: nullableNumber,
  hip: nullableNumber,
  note: z.string().trim().max(3000).optional().default("")
}).strict();

const taskSchema = z.object({
  id: identifier,
  patientId: identifier,
  title: z.string().trim().min(1).max(240),
  type: z.string().trim().max(80).optional().default("Acompanhamento"),
  status: z.string().trim().max(80).optional().default("Pendente"),
  priority: z.string().trim().max(40).optional().nullable(),
  due: dateText
}).strict();

const checkInSchema = z.object({
  id: identifier,
  patientId: identifier,
  date: dateText,
  type: z.string().trim().min(1).max(100),
  frequency: z.string().trim().max(80).optional().nullable(),
  answers: z.record(z.string().max(120), answerValue).default({})
}).strict();

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(240),
  type: z.string().trim().max(120).optional().default("application/octet-stream"),
  size: z.number().int().min(0).max(3_000_000).optional().default(0),
  dataUrl: z.string().max(4_000_000).optional().default("")
}).strict();

const messageSchema = z.object({
  id: identifier,
  role: z.enum(["user", "assistant", "staff"]),
  author: z.string().trim().max(160).optional().nullable(),
  date: dateText,
  text: z.string().max(12000).optional().default(""),
  attachments: z.array(attachmentSchema).max(8).optional().default([]),
  ai: z.boolean().optional().default(false),
  fallback: z.boolean().optional().default(false),
  welcome: z.boolean().optional().default(false),
  automatic: z.boolean().optional().default(false)
}).strict();

const conversationProfileSchema = z.object({
  stage: z.string().max(80).optional().nullable(),
  consent: z.boolean().optional().nullable(),
  frequency: z.string().max(80).optional().nullable(),
  initialAssessmentCompleted: z.boolean().optional().default(false),
  lastRoutineDate: dateText,
  lastMonthlyPeriod: z.string().max(20).optional().nullable(),
  lastWeeklyPlanDate: dateText,
  lastCustomQuestionDate: dateText,
  flow: z.string().max(80).optional().nullable(),
  step: z.string().max(80).optional().nullable(),
  answers: z.record(z.string().max(120), answerValue).optional().default({}),
  engagement: z.number().int().min(0).max(10).optional().default(7),
  lastSituation: z.string().max(240).optional().default("Boas-vindas"),
  unresolvedQuestions: z.array(z.string().trim().max(500)).max(30).optional().default([])
}).passthrough();

export const clinicalStateSchema = z.object({
  patients: z.array(patientSchema).max(500).default([]),
  symptoms: z.array(symptomSchema).max(5000).default([]),
  measurements: z.array(measurementSchema).max(5000).default([]),
  tasks: z.array(taskSchema).max(5000).default([]),
  checkins: z.array(checkInSchema).max(5000).default([]),
  chats: z.record(identifier, z.array(messageSchema).max(5000)).default({}),
  conversationProfiles: z.record(identifier, conversationProfileSchema).default({})
}).strict();

export const reviewSummarySchema = z.object({
  status: z.enum(["APPROVED", "NEEDS_REVISION"]),
  narrative: z.string().trim().min(1).max(8000).optional()
}).strict();

export const reviewAlertSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "RESOLVED"])
}).strict();

export type ClinicalStateInput = z.infer<typeof clinicalStateSchema>;
export type ConversationProfileInput = z.infer<typeof conversationProfileSchema>;
