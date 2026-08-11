import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { loginSchema, registerClinicSchema, selectTenantSchema } from "./auth.schemas.js";
import { SessionGuard, type AuthenticatedRequest } from "./session.guard.js";

function validationMessage(error: ZodError) {
  return error.issues[0]?.message || "Dados inválidos.";
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register-clinic")
  async registerClinic(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.authService.assertTrustedOrigin(request);
    try {
      const input = registerClinicSchema.parse(body);
      this.authService.enforceRateLimit(`register:${request.ip}`, 10, 60 * 60 * 1000);
      const session = await this.authService.registerClinic(input);
      this.setSessionCookie(response, session.token);
      return { status: "authenticated" as const, ...session.payload };
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(validationMessage(error));
      throw error;
    }
  }

  @Post("login")
  async login(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.authService.assertTrustedOrigin(request);
    try {
      const input = loginSchema.parse(body);
      this.authService.enforceRateLimit(`login:${request.ip}:${input.email}`, 5, 60 * 1000);
      const authenticated = await this.authService.login(input);
      if (authenticated.sessionToken) this.setSessionCookie(response, authenticated.sessionToken);
      return authenticated.result;
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(validationMessage(error));
      throw error;
    }
  }

  @Post("select-tenant")
  async selectTenant(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.authService.assertTrustedOrigin(request);
    try {
      const input = selectTenantSchema.parse(body);
      const session = await this.authService.selectTenant(input.challengeToken, input.tenantSlug);
      this.setSessionCookie(response, session.token);
      return { status: "authenticated" as const, ...session.payload };
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(validationMessage(error));
      throw error;
    }
  }

  @Get("me")
  @UseGuards(SessionGuard)
  me(@Req() request: AuthenticatedRequest) {
    const { sessionId: _sessionId, expiresAt: _expiresAt, ...payload } = request.auth;
    return payload;
  }

  @Post("logout")
  @UseGuards(SessionGuard)
  async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    this.authService.assertCsrf(request, request.auth);
    await this.authService.logout(request.auth);
    response.clearCookie(this.authService.sessionCookieName(), { path: "/" });
    return { success: true };
  }

  private setSessionCookie(response: Response, token: string) {
    response.cookie(this.authService.sessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: this.authService.sessionDurationMs()
    });
  }
}
