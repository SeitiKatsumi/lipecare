import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiChatModule } from "./modules/ai-chat/ai-chat.module.js";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ClinicalModule } from "./modules/clinical/clinical.module.js";
import { PrismaModule } from "./database/prisma.module.js";
import { FilesModule } from "./modules/files/files.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { PatientsModule } from "./modules/patients/patients.module.js";
import { ProfessionalsModule } from "./modules/professionals/professionals.module.js";
import { TenantsModule } from "./modules/tenants/tenants.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env.local", ".env.local", ".env"] }),
    PrismaModule,
    AiChatModule,
    HealthModule,
    AuthModule,
    ClinicalModule,
    ProfessionalsModule,
    PatientsModule,
    FilesModule,
    AuditLogsModule,
    TenantsModule
  ]
})
export class AppModule {}

