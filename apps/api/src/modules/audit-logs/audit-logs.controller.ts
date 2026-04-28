import { Controller, Get } from "@nestjs/common";

@Controller("audit-logs")
export class AuditLogsController {
  @Get("policy")
  getPolicy() {
    return {
      enabled: true,
      minimumEvents: [
        "patient_record_viewed",
        "patient_record_updated",
        "file_accessed",
        "auth_login",
        "permission_changed"
      ]
    };
  }
}

