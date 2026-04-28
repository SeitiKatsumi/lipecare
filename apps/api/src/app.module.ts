import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { FilesModule } from "./modules/files/files.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { PatientsModule } from "./modules/patients/patients.module.js";
import { ProfessionalsModule } from "./modules/professionals/professionals.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    ProfessionalsModule,
    PatientsModule,
    FilesModule,
    AuditLogsModule
  ]
})
export class AppModule {}

