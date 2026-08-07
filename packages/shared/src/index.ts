export const USER_ROLES = ["ADMIN", "PROFESSIONAL", "PATIENT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type HealthStatus = {
  status: "ok";
  service: string;
  timestamp: string;
};

export type WorkspaceIdentity = {
  professionalName: string;
  specialty: string;
  brandName: string;
  clinicName: string;
  website: string;
  social: string;
  bookingUrl: string;
  bookingContact: string;
  patientBenefit: string;
  logo: string;
  presentationType: "text" | "image" | "video";
  presentationTitle: string;
  presentationText: string;
  presentationMedia: string;
};

export type WorkspacePalette = {
  primary: string;
  primaryStrong: string;
  accent: string;
  lightBackground: string;
  lightSurface: string;
  lightText: string;
  lightMuted: string;
  darkBackground: string;
  darkSurface: string;
  darkText: string;
  darkMuted: string;
};

export type TenantWorkspaceData = {
  identity: WorkspaceIdentity;
  palette: WorkspacePalette;
  assistant: {
    name: string;
    welcomeMessage: string;
    voiceStyle: string;
  };
  protocol: {
    name: string;
    foundation: string;
    guidance: string;
    restrictions: string;
    pillars: Array<{ id: string; name: string; description: string; mediaUrl: string }>;
  };
  metrics: Array<{
    id: string;
    name: string;
    unit: string;
    direction: "up" | "down" | "neutral";
    acceptable: string;
    formula: string;
  }>;
  causeQuestions: Array<{
    id: string;
    group: string;
    question: string;
    answerType: "text" | "boolean" | "scale" | "number";
    frequency: string;
    direction: "up" | "down" | "neutral";
    acceptable: string;
  }>;
  automation: {
    interactionFrequency: string;
    planningDay: string;
    monthlyReminder: boolean;
    lowEngagementAction: string;
  };
};

export type PublicTenantBrand = {
  name: string;
  slug: string;
  identity: WorkspaceIdentity;
  palette: WorkspacePalette;
};

export type AuthenticatedSession = {
  csrfToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    patientId: string | null;
    canManageWorkspace: boolean;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
};

export type LoginResult =
  | ({ status: "authenticated" } & AuthenticatedSession)
  | {
      status: "tenant_selection_required";
      challengeToken: string;
      tenants: Array<{ name: string; slug: string; logo: string }>;
    };

export function createDefaultTenantWorkspace(input?: {
  clinicName?: string;
  professionalName?: string;
}): TenantWorkspaceData {
  const clinicName = input?.clinicName?.trim() || "LipeCare Clinic";
  const professionalName = input?.professionalName?.trim() || "Dra. Raquel Peres";
  return {
    identity: {
      professionalName,
      specialty: "Cirurgia vascular e cuidado do lipedema",
      brandName: clinicName,
      clinicName,
      website: "",
      social: "",
      bookingUrl: "",
      bookingContact: "",
      patientBenefit: "",
      logo: "/assets/lipecare-logo.png",
      presentationType: "text",
      presentationTitle: "Saúde vascular com cuidado próximo e contínuo.",
      presentationText: "Um ambiente reservado para acompanhar pessoas com lipedema, organizar a rotina clínica e manter o cuidado presente entre as consultas.",
      presentationMedia: ""
    },
    palette: {
      primary: "#c55777",
      primaryStrong: "#ab405f",
      accent: "#155b88",
      lightBackground: "#fff9f8",
      lightSurface: "#ffffff",
      lightText: "#392332",
      lightMuted: "#796b74",
      darkBackground: "#1c141a",
      darkSurface: "#2d2028",
      darkText: "#fff8f6",
      darkMuted: "#cdbdc4"
    },
    assistant: {
      name: "Lipe",
      welcomeMessage: "Que bom ter você aqui. Vamos acompanhar sua jornada com calma, clareza e sem julgamentos.",
      voiceStyle: "Humano, acolhedor, sereno, claro e respeitoso. Uma pergunta por vez, sem infantilizar e sem excesso de entusiasmo."
    },
    protocol: {
      name: "Protocolo LipeCare",
      foundation: "Acompanhamento integrativo centrado em constância, escuta do corpo, autonomia e hábitos sustentáveis.",
      guidance: "Organizar sintomas e apoiar quatro pilares: alimentação e hidratação, movimento e fortalecimento, sono e ritmo biológico, gestão do estresse e autodesenvolvimento.",
      restrictions: "Não diagnosticar, prescrever, indicar doses, interpretar exames, prometer cura ou desintoxicação, impor restrições alimentares ou substituir avaliação médica. Práticas complementares não devem ser apresentadas como mecanismos biomédicos comprovados.",
      pillars: [
        { id: "pillar-1", name: "Alimentação e hidratação", description: "Priorizar alimentos reais, variedade, fibras, hidratação e escolhas possíveis, sem culpa ou dietas rígidas.", mediaUrl: "" },
        { id: "pillar-2", name: "Movimento e fortalecimento", description: "Valorizar força orientada, atividades de baixo impacto e mobilidade, respeitando limites e sinais do corpo.", mediaUrl: "" },
        { id: "pillar-3", name: "Sono e ritmo biológico", description: "Construir uma rotina consistente de descanso, luz, desaceleração e ambiente noturno adequado.", mediaUrl: "" },
        { id: "pillar-4", name: "Estresse e autodesenvolvimento", description: "Apoiar respiração, pausas, escrita, conexão social e reconhecimento de pequenos avanços.", mediaUrl: "" }
      ]
    },
    metrics: [
      { id: "metric-1", name: "Dor", unit: "0 a 10", direction: "down", acceptable: "0 a 3", formula: "" },
      { id: "metric-2", name: "Inchaço ou peso nas pernas", unit: "0 a 10", direction: "down", acceptable: "0 a 3", formula: "" },
      { id: "metric-3", name: "Qualidade do sono", unit: "0 a 10", direction: "up", acceptable: "7 a 10", formula: "" },
      { id: "metric-4", name: "Bem-estar e energia", unit: "0 a 10", direction: "up", acceptable: "7 a 10", formula: "" },
      { id: "metric-5", name: "Peso", unit: "kg", direction: "neutral", acceptable: "Definido individualmente", formula: "" }
    ],
    causeQuestions: [
      { id: "question-1", group: "Sono", question: "Como foi sua qualidade de sono nesta semana?", answerType: "scale", frequency: "Semanal", direction: "up", acceptable: "7 a 10" },
      { id: "question-2", group: "Movimento", question: "Você conseguiu realizar algum movimento já orientado e liberado para você?", answerType: "boolean", frequency: "Semanal", direction: "up", acceptable: "Sim" },
      { id: "question-3", group: "Alimentação", question: "O que mais facilitou ou dificultou sua alimentação nesta semana?", answerType: "text", frequency: "Semanal", direction: "neutral", acceptable: "Resposta livre" },
      { id: "question-4", group: "Estresse", question: "Quanto o estresse interferiu no seu bem-estar nesta semana?", answerType: "scale", frequency: "Semanal", direction: "down", acceptable: "0 a 3" }
    ],
    automation: {
      interactionFrequency: "Semanal",
      planningDay: "Domingo",
      monthlyReminder: true,
      lowEngagementAction: "Retomar com uma pergunta simples e sugerir contato com o profissional quando necessário."
    }
  };
}

