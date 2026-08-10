import assert from "node:assert/strict";
import test from "node:test";
import { buildClinicalSummary, detectClinicalSignals } from "./clinical.service.js";

test("gera um resumo clínico estruturado a partir do acompanhamento", () => {
  const summary = buildClinicalSummary({
    name: "Marina Almeida",
    status: "Em acompanhamento",
    lastSituation: "Avaliação inicial concluída",
    engagement: 8,
    answers: { wellbeing: 6, pain: 7, swelling: 8, sleep: 5, priority: "Reduzir a dor" },
    symptom: { painLevel: 7, notes: "Dor no fim do dia", recordedAt: new Date("2026-08-10") },
    measurement: null,
    recentMessages: [{ externalId: "msg-1", text: "Hoje a dor aumentou.", sentAt: new Date("2026-08-10") }],
    checkInExternalId: "checkin-1",
    symptomExternalId: "symptom-1"
  });

  assert.match(summary.narrative, /dor 7\/10/);
  assert.match(summary.narrative, /inchaço 8\/10/);
  assert.match(summary.narrative, /Reduzir a dor/);
  assert.deepEqual(summary.structured.scores, { "bem-estar": 6, dor: 7, inchaço: 8, sono: 5 });
  assert.ok(summary.sourceReferences.some((reference) => reference?.id === "msg-1"));
});

test("detecta dor alta, baixo engajamento e linguagem de urgência", () => {
  const signals = detectClinicalSignals({
    symptomExternalId: "symptom-1",
    pain: 9,
    engagement: 3,
    messages: [{ externalId: "msg-1", text: "Estou com falta de ar e dor no peito." }]
  });

  assert.ok(signals.some((signal) => signal.type === "HIGH_PAIN" && signal.severity === "CRITICAL"));
  assert.ok(signals.some((signal) => signal.type === "LOW_ENGAGEMENT"));
  assert.ok(signals.some((signal) => signal.type === "URGENT_LANGUAGE" && signal.severity === "CRITICAL"));
});
