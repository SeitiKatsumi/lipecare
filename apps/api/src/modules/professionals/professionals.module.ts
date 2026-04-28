import { Module } from "@nestjs/common";
import { ProfessionalsController } from "./professionals.controller.js";

@Module({
  controllers: [ProfessionalsController]
})
export class ProfessionalsModule {}

