import { BadRequestException, Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../auth/auth.service.js";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard.js";
import { AiChatService, aiChatRequestSchema } from "./ai-chat.service.js";

@Controller("ai")
@UseGuards(SessionGuard)
export class AiChatController {
  constructor(
    private readonly aiChatService: AiChatService,
    private readonly authService: AuthService
  ) {}

  @Post("chat")
  async createReply(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    this.authService.assertCsrf(request, request.auth);
    const parsed = aiChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("[ai-chat] Requisição rejeitada pela validação.");
      throw new BadRequestException("A mensagem enviada para a IA é inválida.");
    }
    return this.aiChatService.createReply(parsed.data, request.auth.tenant.id);
  }
}
