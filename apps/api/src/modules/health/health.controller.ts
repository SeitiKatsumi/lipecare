import { Controller, Get } from "@nestjs/common";
import type { HealthStatus } from "@lipecare/shared";

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthStatus {
    return {
      status: "ok",
      service: "lipecare-api",
      timestamp: new Date().toISOString()
    };
  }
}

