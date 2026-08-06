import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isReservedTenantSlug, normalizeTenantSlug, registerClinicSchema } from "./auth.schemas.js";

describe("contratos de cadastro de clínica", () => {
  it("normaliza nomes com acentos para um endereço estável", () => {
    assert.equal(normalizeTenantSlug("Clínica São José"), "clinica-sao-jose");
    assert.equal(normalizeTenantSlug("  Dra. Raquel & Equipe  "), "dra-raquel-equipe");
  });

  it("reserva endereços usados pelas rotas da plataforma", () => {
    assert.equal(isReservedTenantSlug("login"), true);
    assert.equal(isReservedTenantSlug("cadastro"), true);
    assert.equal(isReservedTenantSlug("raquel-peres"), false);
  });

  it("aceita um cadastro válido e rejeita slug ou senha inválidos", () => {
    const valid = {
      clinicName: "Clínica Aurora",
      adminName: "Dra. Ana Souza",
      email: "ANA@EXAMPLE.TEST",
      password: "SenhaSegura123",
      slug: "clinica-aurora"
    };
    assert.equal(registerClinicSchema.parse(valid).email, "ana@example.test");
    assert.equal(registerClinicSchema.safeParse({ ...valid, slug: "Clínica Aurora" }).success, false);
    assert.equal(registerClinicSchema.safeParse({ ...valid, password: "123" }).success, false);
  });
});
