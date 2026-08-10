import assert from "node:assert/strict";
import test from "node:test";
import { assistantInstructions, type AiChatRequest } from "./ai-chat.service.js";

const request: AiChatRequest = {
  message: "Como posso cuidar melhor da minha rotina?",
  suggestedReply: "Vamos escolher um passo possível.",
  history: [],
  context: {
    language: "pt",
    brandName: "Clínica Exemplo",
    professionalName: "Dra. Exemplo",
    specialty: "Cuidado vascular",
    pillars: [],
    metrics: [],
    causeQuestions: []
  }
};

test("inclui os quatro pilares da base padrão", () => {
  const instructions = assistantInstructions(request);

  assert.match(instructions, /Alimentação e hidratação/);
  assert.match(instructions, /Movimento e fortalecimento/);
  assert.match(instructions, /Sono e ritmo biológico/);
  assert.match(instructions, /Gestão do estresse e autodesenvolvimento/);
  assert.match(instructions, /construir uma linha de base fazendo uma pergunta por vez/);
  assert.match(instructions, /um pequeno combinado para os sete dias seguintes/);
});

test("preserva limites clínicos e de práticas complementares", () => {
  const instructions = assistantInstructions(request);

  assert.match(instructions, /não substitui, consulta, exame físico, diagnóstico ou plano terapêutico/i);
  assert.match(instructions, /não prometer drenagem, desintoxicação, equilíbrio hormonal ou cura/i);
  assert.match(instructions, /nunca como mecanismo biomédico comprovado/i);
});

test("inclui memória clínica sem perder os limites de revisão humana", () => {
  const instructions = assistantInstructions({
    ...request,
    context: {
      ...request.context,
      clinicalSummary: "Dor 7/10 e sono 5/10.",
      activePlan: { commitment: "Caminhar três vezes na semana." },
      unresolvedQuestions: ["Confirmar a intensidade atual do inchaço."]
    }
  });

  assert.match(instructions, /Dor 7\/10 e sono 5\/10/);
  assert.match(instructions, /Caminhar três vezes na semana/);
  assert.match(instructions, /Confirmar a intensidade atual do inchaço/);
  assert.match(instructions, /revisão humana/i);
});
