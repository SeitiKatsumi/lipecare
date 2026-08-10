import { BadRequestException, Body, Controller, Get, Param, Patch, Put, Req, UseGuards } from "@nestjs/common";
import { ZodError } from "zod";
import { AuthService } from "../auth/auth.service.js";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard.js";
import { ClinicalService } from "./clinical.service.js";
import { clinicalStateSchema, reviewAlertSchema, reviewSummarySchema } from "./clinical.schemas.js";

function parseOrThrow<T>(parser: { parse(value: unknown): T }, body: unknown) {
  try {
    return parser.parse(body);
  } catch (error) {
    if (error instanceof ZodError) throw new BadRequestException(error.issues[0]?.message || "Dados clínicos inválidos.");
    throw error;
  }
}

@Controller("clinical")
@UseGuards(SessionGuard)
export class ClinicalController {
  constructor(
    private readonly clinicalService: ClinicalService,
    private readonly authService: AuthService
  ) {}

  @Get("state")
  state(@Req() request: AuthenticatedRequest) {
    return this.clinicalService.state(request.auth);
  }

  @Put("state")
  sync(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    this.authService.assertCsrf(request, request.auth);
    return this.clinicalService.sync(request.auth, parseOrThrow(clinicalStateSchema, body));
  }

  @Patch("patients/:patientId/summary")
  reviewSummary(
    @Param("patientId") patientId: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest
  ) {
    this.authService.assertCsrf(request, request.auth);
    return this.clinicalService.reviewSummary(request.auth, patientId, parseOrThrow(reviewSummarySchema, body));
  }

  @Patch("alerts/:alertId")
  reviewAlert(
    @Param("alertId") alertId: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest
  ) {
    this.authService.assertCsrf(request, request.auth);
    const input = parseOrThrow(reviewAlertSchema, body);
    return this.clinicalService.reviewAlert(request.auth, alertId, input.status);
  }
}
