import { z } from "zod";

const shortText = z.string().trim().max(160);
const longText = z.string().trim().max(4000);
const optionalUrl = z.string().trim().max(2_000).refine((value) => !value || value.startsWith("/") || /^https?:\/\//i.test(value) || /^data:image\//i.test(value), "Informe uma URL válida.");
const logoSource = z.string().trim().max(2_000_000).refine((value) => !value || value.startsWith("/") || value.startsWith("assets/") || /^https?:\/\//i.test(value) || /^data:image\//i.test(value), "Informe uma imagem válida.");
const color = z.string().regex(/^#[0-9a-f]{6}$/i, "Informe uma cor hexadecimal.");
const direction = z.enum(["up", "down", "neutral"]);

const identitySchema = z.object({
  professionalName: shortText.min(2),
  specialty: shortText,
  brandName: shortText.min(2),
  clinicName: shortText.min(2),
  website: optionalUrl,
  social: z.string().trim().max(240),
  bookingUrl: optionalUrl,
  bookingContact: z.string().trim().max(240),
  patientBenefit: z.string().trim().max(800),
  logo: logoSource,
  presentationType: z.enum(["text", "image", "video"]),
  presentationTitle: z.string().trim().max(240),
  presentationText: z.string().trim().max(1_500),
  presentationMedia: optionalUrl
}).strict();

const paletteSchema = z.object({
  primary: color,
  primaryStrong: color,
  accent: color,
  lightBackground: color,
  lightSurface: color,
  darkBackground: color,
  darkSurface: color
}).strict();

export const workspaceSchema = z.object({
  identity: identitySchema,
  palette: paletteSchema,
  assistant: z.object({
    name: shortText.min(1),
    welcomeMessage: z.string().trim().max(1_500),
    voiceStyle: z.string().trim().max(2_000)
  }).strict(),
  protocol: z.object({
    name: shortText.min(2),
    foundation: longText,
    guidance: longText,
    restrictions: longText,
    pillars: z.array(z.object({
      id: shortText,
      name: shortText.min(1),
      description: z.string().trim().max(1_500),
      mediaUrl: optionalUrl
    }).strict()).max(24)
  }).strict(),
  metrics: z.array(z.object({
    id: shortText,
    name: shortText.min(1),
    unit: shortText,
    direction,
    acceptable: z.string().trim().max(500),
    formula: z.string().trim().max(500)
  }).strict()).max(40),
  causeQuestions: z.array(z.object({
    id: shortText,
    group: shortText,
    question: z.string().trim().min(1).max(1_000),
    answerType: z.enum(["text", "boolean", "scale", "number"]),
    frequency: shortText,
    direction,
    acceptable: z.string().trim().max(500)
  }).strict()).max(80),
  automation: z.object({
    interactionFrequency: shortText,
    planningDay: shortText,
    monthlyReminder: z.boolean(),
    lowEngagementAction: z.string().trim().max(1_500)
  }).strict()
}).strict();

export const updateWorkspaceSchema = z.object({
  version: z.number().int().positive(),
  workspace: workspaceSchema
}).strict();

export const updateTenantProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(3).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
}).strict();

export const updateWorkspaceManagerSchema = z.object({ enabled: z.boolean() }).strict();

export const patientAccessSchema = z.object({
  patientId: z.string().trim().min(1).max(80),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(128).optional(),
  phone: z.string().trim().max(40)
}).strict();
