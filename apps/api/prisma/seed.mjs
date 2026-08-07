import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const workspace = {
  identity: {
    professionalName: "Dra. Raquel Peres",
    specialty: "Cirurgia vascular e cuidado do lipedema",
    brandName: "LipeCare",
    clinicName: "LipeCare Clinic",
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
    foundation: "Acompanhamento contínuo, escuta do corpo e construção de hábitos sustentáveis.",
    guidance: "Organizar sintomas, rotina, movimento, alimentação, sono e pontos de atenção para apoiar a consulta.",
    restrictions: "Não diagnosticar, prescrever, indicar doses, interpretar exames ou substituir avaliação médica.",
    pillars: [
      { id: "pillar-1", name: "Escuta do corpo", description: "Reconhecer sintomas, mudanças e situações que merecem atenção.", mediaUrl: "" },
      { id: "pillar-2", name: "Rotina possível", description: "Transformar orientações em ações pequenas e consistentes.", mediaUrl: "" }
    ]
  },
  metrics: [
    { id: "metric-1", name: "Dor", unit: "0 a 10", direction: "down", acceptable: "0 a 3", formula: "" },
    { id: "metric-2", name: "Peso", unit: "kg", direction: "neutral", acceptable: "Definido individualmente", formula: "" }
  ],
  causeQuestions: [
    { id: "question-1", group: "Rotina", question: "Como foi sua qualidade de sono?", answerType: "scale", frequency: "Semanal", direction: "up", acceptable: "7 a 10" },
    { id: "question-2", group: "Movimento", question: "Você conseguiu realizar a atividade planejada?", answerType: "boolean", frequency: "Semanal", direction: "up", acceptable: "Sim" }
  ],
  automation: {
    interactionFrequency: "Semanal",
    planningDay: "Domingo",
    monthlyReminder: true,
    lowEngagementAction: "Retomar com uma pergunta simples e sugerir contato com o profissional quando necessário."
  }
};

async function seed() {
  const passwordHash = await argon2.hash("123456", { type: argon2.argon2id });
  const tenant = await prisma.tenant.upsert({
    where: { slug: "raquel-peres" },
    update: { name: "LipeCare Clinic", isActive: true },
    create: { id: "tenant-demo-raquel", name: "LipeCare Clinic", slug: "raquel-peres", isActive: true }
  });
  await prisma.tenantWorkspace.upsert({
    where: { tenantId: tenant.id },
    update: workspace,
    create: { tenantId: tenant.id, ...workspace }
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@lipecare.test" } },
    update: { passwordHash, isActive: true },
    create: {
      id: "u-admin",
      tenantId: tenant.id,
      email: "admin@lipecare.test",
      passwordHash,
      name: "Dra. Helena Costa",
      role: "ADMIN"
    }
  });

  const professionalUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "profissional@lipecare.test" } },
    update: { passwordHash, isActive: true },
    create: {
      id: "u-pro",
      tenantId: tenant.id,
      email: "profissional@lipecare.test",
      passwordHash,
      name: "Dra. Raquel Peres",
      role: "PROFESSIONAL"
    }
  });
  const professional = await prisma.professional.upsert({
    where: { userId: professionalUser.id },
    update: { canManageTenantWorkspace: true },
    create: {
      id: "pro-raquel",
      tenantId: tenant.id,
      userId: professionalUser.id,
      specialty: "Cirurgia vascular e cuidado do lipedema",
      canManageTenantWorkspace: true
    }
  });

  const patientUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "paciente@lipecare.test" } },
    update: { passwordHash, isActive: true },
    create: {
      id: "u-patient",
      tenantId: tenant.id,
      email: "paciente@lipecare.test",
      passwordHash,
      name: "Marina Almeida",
      role: "PATIENT"
    }
  });
  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: { fullName: "Marina Almeida" },
    create: {
      id: "p-001",
      tenantId: tenant.id,
      userId: patientUser.id,
      fullName: "Marina Almeida",
      phone: "(11) 90000-1001"
    }
  });
  await prisma.patientProfessional.upsert({
    where: { patientId_professionalId: { patientId: patient.id, professionalId: professional.id } },
    update: {},
    create: { tenantId: tenant.id, patientId: patient.id, professionalId: professional.id }
  });
}

seed()
  .then(() => console.log("Clínica demo e credenciais criadas."))
  .catch((error) => {
    console.error("Falha ao criar os dados demo.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
