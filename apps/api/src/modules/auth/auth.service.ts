import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { AuthenticatedSession, LoginResult, TenantWorkspaceData } from "@lipecare/shared";
import { createDefaultTenantWorkspace } from "@lipecare/shared";
import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import type { Request } from "express";
import { PrismaService } from "../../database/prisma.service.js";
import { isReservedTenantSlug } from "./auth.schemas.js";
import type { RequestAuth } from "./auth.types.js";

const SESSION_COOKIE = "lipecare_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const CHALLENGE_DURATION_MS = 5 * 60 * 1000;

type UserWithContext = Prisma.UserGetPayload<{
  include: { tenant: true; professional: true; patient: true };
}>;
type ContextUser = Prisma.UserGetPayload<{
  include: { professional: true; patient: true };
}>;

type RateEntry = { count: number; resetAt: number };

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function randomToken() {
  return randomBytes(32).toString("base64url");
}

function parseCookies(header: string | undefined) {
  return Object.fromEntries(
    String(header || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf("=");
        return separator < 0
          ? [decodeURIComponent(item), ""]
          : [decodeURIComponent(item.slice(0, separator)), decodeURIComponent(item.slice(separator + 1))];
      })
  );
}

function jsonObject<T>(value: Prisma.JsonValue, fallback: T): T {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : fallback;
}

@Injectable()
export class AuthService {
  private readonly rateLimits = new Map<string, RateEntry>();

  constructor(private readonly prisma: PrismaService) {}

  enforceRateLimit(key: string, maximum: number, durationMs: number) {
    const now = Date.now();
    const current = this.rateLimits.get(key);
    if (!current || current.resetAt <= now) {
      this.rateLimits.set(key, { count: 1, resetAt: now + durationMs });
      return;
    }
    if (current.count >= maximum) throw new HttpException("Muitas tentativas. Aguarde e tente novamente.", 429);
    current.count += 1;
  }

  async registerClinic(input: {
    clinicName: string;
    adminName: string;
    email: string;
    password: string;
    slug: string;
  }) {
    if (isReservedTenantSlug(input.slug)) throw new ConflictException("Este endereço não está disponível.");
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const workspace = createDefaultTenantWorkspace({ clinicName: input.clinicName, professionalName: input.adminName });

    let user: UserWithContext;
    try {
      user = await this.prisma.$transaction(async (transaction) => {
        const tenant = await transaction.tenant.create({
          data: {
            name: input.clinicName,
            slug: input.slug,
            workspace: {
              create: this.workspaceCreateData(workspace)
            }
          }
        });
        const createdUser = await transaction.user.create({
          data: {
            tenantId: tenant.id,
            email: input.email,
            passwordHash,
            name: input.adminName,
            role: "ADMIN"
          },
          include: { tenant: true, professional: true, patient: true }
        });
        await transaction.auditLog.create({
          data: {
            tenantId: tenant.id,
            actorUserId: createdUser.id,
            action: "tenant_registered",
            resource: "tenant",
            resourceId: tenant.id
          }
        });
        return createdUser;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Este endereço ou e-mail já está em uso nesta clínica.");
      }
      throw error;
    }

    return this.createSession(user);
  }

  async login(input: { email: string; password: string; tenantSlug?: string }): Promise<{
    result: LoginResult;
    sessionToken?: string;
  }> {
    const candidates = await this.prisma.user.findMany({
      where: {
        email: input.email,
        isActive: true,
        tenant: {
          isActive: true,
          ...(input.tenantSlug ? { slug: input.tenantSlug } : {})
        }
      },
      include: { tenant: true, professional: true, patient: true }
    });

    const matches: UserWithContext[] = [];
    for (const candidate of candidates) {
      if (await argon2.verify(candidate.passwordHash, input.password).catch(() => false)) matches.push(candidate);
    }
    if (!matches.length) throw new UnauthorizedException("E-mail ou senha incorretos.");

    if (matches.length === 1) {
      const session = await this.createSession(matches[0]);
      return { result: { status: "authenticated", ...session.payload }, sessionToken: session.token };
    }

    const challengeToken = randomToken();
    await this.prisma.loginChallenge.create({
      data: {
        tokenHash: tokenHash(challengeToken),
        userIds: matches.map((user) => user.id),
        expiresAt: new Date(Date.now() + CHALLENGE_DURATION_MS)
      }
    });
    const tenants = await Promise.all(matches.map(async (user) => ({
      name: user.tenant.name,
      slug: user.tenant.slug,
      logo: await this.publicLogo(user.tenantId)
    })));
    return {
      result: { status: "tenant_selection_required", challengeToken, tenants }
    };
  }

  async selectTenant(challengeToken: string, tenantSlug: string) {
    const challenge = await this.prisma.loginChallenge.findUnique({
      where: { tokenHash: tokenHash(challengeToken) }
    });
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
      throw new UnauthorizedException("A seleção expirou. Entre novamente.");
    }
    const userIds = Array.isArray(challenge.userIds) ? challenge.userIds.filter((id): id is string => typeof id === "string") : [];
    const user = await this.prisma.user.findFirst({
      where: { id: { in: userIds }, isActive: true, tenant: { slug: tenantSlug, isActive: true } },
      include: { tenant: true, professional: true, patient: true }
    });
    if (!user) throw new ForbiddenException("Esta conta não está vinculada à clínica selecionada.");
    await this.prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    return this.createSession(user);
  }

  async authenticateRequest(request: Request): Promise<RequestAuth> {
    const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
    if (!token) throw new UnauthorizedException("Sessão não encontrada.");
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: {
        tenant: true,
        user: { include: { professional: true, patient: true } }
      }
    });
    if (!session || session.expiresAt <= new Date() || !session.tenant.isActive || !session.user.isActive) {
      if (session) await this.prisma.authSession.delete({ where: { id: session.id } }).catch(() => undefined);
      throw new UnauthorizedException("Sua sessão expirou.");
    }
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date(), expiresAt }
    });
    return {
      ...this.sessionPayload(session.user, session.tenant, session.csrfToken),
      sessionId: session.id,
      expiresAt
    };
  }

  assertCsrf(request: Request, auth: RequestAuth) {
    this.assertTrustedOrigin(request);
    const header = request.headers["x-lipecare-csrf"];
    if (typeof header !== "string" || header !== auth.csrfToken) {
      throw new ForbiddenException("Token de segurança inválido.");
    }
  }

  assertTrustedOrigin(request: Request) {
    const origin = request.headers.origin;
    if (!origin) return;
    const allowedOrigins = new Set([
      process.env.WEB_URL || "http://localhost:3000",
      "http://localhost:3009"
    ]);
    if (!allowedOrigins.has(origin)) throw new ForbiddenException("Origem não autorizada.");
  }

  async logout(auth: RequestAuth) {
    await this.prisma.authSession.delete({ where: { id: auth.sessionId } }).catch(() => undefined);
    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenant.id,
        actorUserId: auth.user.id,
        action: "auth_logout",
        resource: "session",
        resourceId: auth.sessionId
      }
    });
  }

  sessionCookieName() {
    return SESSION_COOKIE;
  }

  sessionDurationMs() {
    return SESSION_DURATION_MS;
  }

  private async createSession(user: UserWithContext) {
    const token = randomToken();
    const csrfToken = randomToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await this.prisma.authSession.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        tokenHash: tokenHash(token),
        csrfToken,
        expiresAt
      }
    });
    await this.prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorUserId: user.id,
        action: "auth_login",
        resource: "session",
        resourceId: session.id
      }
    });
    return { token, payload: this.sessionPayload(user, user.tenant, csrfToken) };
  }

  private sessionPayload(user: ContextUser, tenant: { id: string; name: string; slug: string }, csrfToken: string): AuthenticatedSession {
    return {
      csrfToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: user.patient?.id || null,
        canManageWorkspace: user.role === "ADMIN" || Boolean(user.professional?.canManageTenantWorkspace)
      },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug }
    };
  }

  private async publicLogo(tenantId: string) {
    const workspace = await this.prisma.tenantWorkspace.findUnique({ where: { tenantId } });
    if (!workspace) return "";
    return jsonObject<{ logo?: string }>(workspace.identity, {}).logo || "";
  }

  private workspaceCreateData(workspace: TenantWorkspaceData) {
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
}
