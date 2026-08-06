import { BadRequestException, Body, Controller, Get, Param, Patch, Put, Req, UseGuards } from "@nestjs/common";
import { ZodError } from "zod";
import { AuthService } from "../auth/auth.service.js";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard.js";
import { patientAccessSchema, updateTenantProfileSchema, updateWorkspaceManagerSchema, updateWorkspaceSchema } from "./tenant.schemas.js";
import { TenantsService } from "./tenants.service.js";

function parseOrThrow<T>(parser: { parse(value: unknown): T }, body: unknown) {
  try {
    return parser.parse(body);
  } catch (error) {
    if (error instanceof ZodError) throw new BadRequestException(error.issues[0]?.message || "Dados inválidos.");
    throw error;
  }
}

@Controller("tenants")
export class PublicTenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(":slug/public")
  publicBrand(@Param("slug") slug: string) {
    return this.tenantsService.publicBrand(slug);
  }
}

@Controller("tenant")
@UseGuards(SessionGuard)
export class TenantController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly authService: AuthService
  ) {}

  @Get("workspace")
  workspace(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.workspace(request.auth);
  }

  @Put("workspace")
  updateWorkspace(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    this.authService.assertCsrf(request, request.auth);
    return this.tenantsService.updateWorkspace(request.auth, parseOrThrow(updateWorkspaceSchema, body));
  }

  @Patch("profile")
  updateProfile(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    this.authService.assertCsrf(request, request.auth);
    return this.tenantsService.updateProfile(request.auth, parseOrThrow(updateTenantProfileSchema, body));
  }

  @Get("professionals")
  professionals(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.listProfessionals(request.auth);
  }

  @Patch("workspace-managers/:professionalId")
  updateWorkspaceManager(
    @Param("professionalId") professionalId: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest
  ) {
    this.authService.assertCsrf(request, request.auth);
    const input = parseOrThrow(updateWorkspaceManagerSchema, body);
    return this.tenantsService.updateWorkspaceManager(request.auth, professionalId, input.enabled);
  }

  @Put("patient-access")
  updatePatientAccess(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    this.authService.assertCsrf(request, request.auth);
    return this.tenantsService.upsertPatientAccess(request.auth, parseOrThrow(patientAccessSchema, body));
  }
}
