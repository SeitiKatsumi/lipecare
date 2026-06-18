import { Activity, LayoutDashboard, type LucideIcon } from "lucide-react";

export type PortalApp = {
  name: string;
  description: string;
  href: string;
  port: number;
  statusHref?: string;
  icon: LucideIcon;
  kind: "frontend" | "api" | "infra";
};

export const portalApps: PortalApp[] = [
  {
    name: "LipeCare Web",
    description: "Aplicacao principal para pacientes, profissionais e operacao clinica.",
    href: "http://localhost:3003",
    port: 3003,
    icon: LayoutDashboard,
    kind: "frontend"
  },
  {
    name: "LipeCare API",
    description: "Backend NestJS, contratos, auth, dados clinicos e integracoes.",
    href: "http://localhost:4000/health",
    statusHref: "http://localhost:4000/health",
    port: 4000,
    icon: Activity,
    kind: "api"
  }
];
