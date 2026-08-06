import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service.js";

export type AuthenticatedRequest = Request & { auth: Awaited<ReturnType<AuthService["authenticateRequest"]>> };

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    (request as AuthenticatedRequest).auth = await this.authService.authenticateRequest(request);
    return true;
  }
}
