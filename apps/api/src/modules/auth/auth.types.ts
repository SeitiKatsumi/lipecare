import type { AuthenticatedSession } from "@lipecare/shared";

export type RequestAuth = AuthenticatedSession & {
  sessionId: string;
  expiresAt: Date;
};
