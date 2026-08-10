import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ClinicalController } from "./clinical.controller.js";
import { ClinicalService } from "./clinical.service.js";

@Module({
  imports: [AuthModule],
  controllers: [ClinicalController],
  providers: [ClinicalService],
  exports: [ClinicalService]
})
export class ClinicalModule {}
