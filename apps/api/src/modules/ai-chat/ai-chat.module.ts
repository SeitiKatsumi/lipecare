import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { AiChatController } from "./ai-chat.controller.js";
import { AiChatService } from "./ai-chat.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AiChatController],
  providers: [AiChatService]
})
export class AiChatModule {}
