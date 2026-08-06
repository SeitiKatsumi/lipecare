import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PublicTenantBrand, TenantWorkspaceData } from "@lipecare/shared";
import { createDefaultTenantWorkspace } from "@lipecare/shared";
import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { PrismaService } from "../../database/prisma.service.js";
import { isReservedTenantSlug } from "../auth/auth.schemas.js";
import type { RequestAuth } from "../auth/auth.types.js";

type WorkspaceRecord = {
  identity: Prisma.JsonValue;
  palette: Prisma.JsonValue;
  assistant: Prisma.JsonValue;
  protocol: Prisma.JsonValue;
  metrics: Prisma.JsonValue;
  causeQuestions: Prisma.JsonValue;
  automation: Prisma.JsonValue;
  version: number;
};

function workspaceFromRecord(record: WorkspaceRecord | null, clinicName?: string): TenantWorkspaceData {
  const defaults = createDefaultTenantWorkspace({ clinicName });
  if (!record) return defaults;
  return {
    identity: record.identity as unknown as TenantWorkspaceData["identity"],
    palette: record.palette as unknown as TenantWorkspaceData["palette"],
    assistant: record.assistant as unknown as TenantWorkspaceData["assistant"],
    protocol: record.protocol as unknown as TenantWorkspaceData["protocol"],
    metrics: record.metrics as unknown as TenantWorkspaceData["metrics"],
    causeQuestions: record.causeQuestions as unknown as TenantWorkspaceData["causeQuestions"],
    automation: record.automation as unknown as TenantWorkspaceData["automation"]
  };
}

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async publicBrand(slug: string): Promise<PublicTenantBrand> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug, isActive: true },
      include: { workspace: true }
    });
    if (!tenant) throw new NotFoundException("Clínica não encontrada.");
    const workspace = workspaceFromRecord(tenant.workspace, tenant.name);
    return {
      name: tenant.name,
      slug: tenant.slug,
      identity: workspace.identity,
      palette: workspace.palette
    };
  }

  async workspace(auth: RequestAuth) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: auth.tenant.id },
      include: { workspace: true }
    });
    if (!tenant || !tenant.isActive) throw new NotFoundException("Clínica não encontrada.");
    return {
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      workspace: workspaceFromRecord(tenant.workspace, tenant.name),
      version: tenant.workspace?.version || 1,
      canManage: auth.user.canManageWorkspace
    };
  }

  async updateWorkspace(auth: RequestAuth, input: { version: number; workspace: TenantWorkspaceData }) {
    this.assertCanManage(auth);
    const data = this.workspaceData(input.workspace);
    const updated = await this.prisma.tenantWorkspace.updateMany({
      where: { tenantId: auth.tenant.id, version: input.version },
      data: { ...data, version: { increment: 1 }, updatedByUserId: auth.user.id }
    });
    if (!updated.count) throw new ConflictException("As configurações foram alteradas por outra pessoa. Recarregue antes de salvar novamente.");
    await this.audit(auth, "tenant_workspace_updated", "tenant_workspace", auth.tenant.id);
    return this.workspace(auth);
  }

  async updateProfile(auth: RequestAuth, input: { name: string; slug: string }) {
    this.assertCanManage(auth);
    if (isReservedTenantSlug(input.slug)) throw new ConflictException("Este endereço não está disponível.");
    try {
      const tenant = await this.prisma.tenant.update({
        where: { id: auth.tenant.id },
        data: { name: input.name, slug: input.slug }
      });
      await this.audit(auth, "tenant_profile_updated", "tenant", tenant.id, { slug: tenant.slug });
      return { id: tenant.id, name: tenant.name, slug: tenant.slug };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Este endereço já está em uso.");
      }
      throw error;
    }
  }

  async listProfessionals(auth: RequestAuth) {
    const professionals = await this.prisma.professional.findMany({
      where: { tenantId: auth.tenant.id },
      include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
      orderBy: { user: { name: "asc" } }
    });
    return professionals.map((professional) => ({
      id: professional.id,
      userId: professional.user.id,
      name: professional.user.name,
      email: professional.user.email,
      isActive: professional.user.isActive,
      canManageWorkspace: professional.canManageTenantWorkspace
    }));
  }

  async updateWorkspaceManager(auth: RequestAuth, professionalId: string, enabled: boolean) {
    if (auth.user.role !== "ADMIN") throw new ForbiddenException("Somente administradores podem definir responsáveis.");
    const result = await this.prisma.professional.updateMany({
      where: { id: professionalId, tenantId: auth.tenant.id },
      data: { canManageTenantWorkspace: enabled }
    });
    if (!result.count) throw new NotFoundException("Profissional não encontrado.");
    await this.audit(auth, "workspace_manager_updated", "professional", professionalId, { enabled });
    return { success: true };
  }

  async upsertPatientAccess(auth: RequestAuth, input: { patientId: string; name: string; email: string; password?: string; phone: string }) {
    if (auth.user.role === "PATIENT" && auth.user.patientId !== input.patientId) {
      throw new ForbiddenException("Você só pode alterar o próprio acesso.");
    }
    const passwordHash = input.password ? await argon2.hash(input.password, { type: argon2.argon2id }) : null;
    try {
      const patient = await this.prisma.$transaction(async (transaction) => {
        const existing = await transaction.patient.findFirst({
          where: { id: input.patientId, tenantId: auth.tenant.id },
          include: { user: true }
        });
        let userId = existing?.userId || null;
        if (userId) {
          await transaction.user.update({
            where: { id: userId },
            data: { name: input.name, email: input.email, ...(passwordHash ? { passwordHash } : {}), isActive: true }
          });
        } else {
          if (!passwordHash) throw new BadRequestException("Informe uma senha para criar o acesso da paciente.");
          const user = await transaction.user.create({
            data: {
              tenantId: auth.tenant.id,
              name: input.name,
              email: input.email,
              passwordHash,
              role: "PATIENT"
            }
          });
          userId = user.id;
        }
        return existing
          ? transaction.patient.update({
              where: { id: existing.id },
              data: { userId, fullName: input.name, phone: input.phone }
            })
          : transaction.patient.create({
              data: {
                id: input.patientId,
                tenantId: auth.tenant.id,
                userId,
                fullName: input.name,
                phone: input.phone
              }
            });
      });
      await this.audit(auth, "patient_access_updated", "patient", patient.id);
      return { patientId: patient.id, email: input.email };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Este e-mail já possui acesso nesta clínica.");
      }
      throw error;
    }
  }

  private assertCanManage(auth: RequestAuth) {
    if (!auth.user.canManageWorkspace) throw new ForbiddenException("Você não tem permissão para alterar as configurações da clínica.");
  }

  private workspaceData(workspace: TenantWorkspaceData) {
    return {
      identity: workspace.identity as unknown as Prisma.InputJsonValue,
      palette: workspace.palette as unknown as Prisma.InputJsonValue,
      assistant: workspace.assistant as unknown as Prisma.InputJsonValue,
      protocol: workspace.protocol as unknown as Prisma.InputJsonValue,
      metrics: workspace.metrics as unknown as Prisma.InputJsonValue,
      causeQuestions: workspace.causeQuestions as unknown as Prisma.InputJsonValue,
      automation: workspace.automation as unknown as Prisma.InputJsonValue
    };
  }

  private audit(auth: RequestAuth, action: string, resource: string, resourceId: string, metadata?: Prisma.InputJsonValue) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenant.id,
        actorUserId: auth.user.id,
        action,
        resource,
        resourceId,
        metadata
      }
    });
  }
}
