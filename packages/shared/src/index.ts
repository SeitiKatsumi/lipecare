export const USER_ROLES = ["ADMIN", "PROFESSIONAL", "PATIENT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type HealthStatus = {
  status: "ok";
  service: string;
  timestamp: string;
};

