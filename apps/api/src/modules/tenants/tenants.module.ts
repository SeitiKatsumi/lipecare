import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PublicTenantsController, TenantController } from "./tenants.controller.js";
import { TenantsService } from "./tenants.service.js";

@Module({
  imports: [AuthModule],
  controllers: [PublicTenantsController, TenantController],
  providers: [TenantsService]
})
export class TenantsModule {}
