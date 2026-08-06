import { z } from "zod";

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const slugSchema = z.string().trim().min(3).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const registerClinicSchema = z.object({
  clinicName: z.string().trim().min(2).max(120),
  adminName: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: z.string().min(8).max(128),
  slug: slugSchema
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  tenantSlug: slugSchema.optional()
}).strict();

export const selectTenantSchema = z.object({
  challengeToken: z.string().min(32).max(256),
  tenantSlug: slugSchema
}).strict();

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "cadastro",
  "clinica",
  "login",
  "portal",
  "suporte",
  "www"
]);

export function normalizeTenantSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function isReservedTenantSlug(value: string) {
  return RESERVED_SLUGS.has(value);
}
