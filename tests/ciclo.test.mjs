import { test } from "node:test";
import assert from "node:assert/strict";
import { semanaDoCiclo, aulaPadrao, aulaPrevista, sugerirFixarAula, CICLO_SEMANAS } from "../js/logica/ciclo.js";

const ancoras = [
  { programa: "GB1", data: "2026-11-16", semana: 12 },
  { programa: "GB2", data: "2026-11-16", semana: 12 }
];

test("o ciclo tem 16 semanas", () => assert.equal(CICLO_SEMANAS, 16));

test("17/11/2026 é a semana 12 do GB1", () => {
  assert.equal(semanaDoCiclo("2026-11-17", ancoras, "GB1"), 12);
});

test("domingo 22/11 ainda é semana 12 e segunda 23/11 já é 13", () => {
  assert.equal(semanaDoCiclo("2026-11-22", ancoras, "GB1"), 12);
  assert.equal(semanaDoCiclo("2026-11-23", ancoras, "GB1"), 13);
});

test("depois da 16 o ciclo volta ao 1", () => {
  assert.equal(semanaDoCiclo("2026-12-14", ancoras, "GB1"), 16);
  assert.equal(semanaDoCiclo("2026-12-21", ancoras, "GB1"), 1);
});

test("antes da âncora conta para trás", () => {
  assert.equal(semanaDoCiclo("2026-11-09", ancoras, "GB1"), 11);
});

test("GB2 tem o próprio ciclo", () => {
  const a = [...ancoras, { programa: "GB2", data: "2026-11-23", semana: 1 }];
  assert.equal(semanaDoCiclo("2026-11-24", a, "GB2"), 1);
  assert.equal(semanaDoCiclo("2026-11-24", a, "GB1"), 13);
});

test("programa a definir ou sem âncora devolve null", () => {
  assert.equal(semanaDoCiclo("2026-11-18", ancoras, "a definir"), null);
  assert.equal(semanaDoCiclo("2026-11-18", [], "GB1"), null);
});

test("ajustar semana: a âncora mais recente vale (semana repetida)", () => {
  const a = [...ancoras, { programa: "GB1", data: "2026-11-30", semana: 12 }];
  assert.equal(semanaDoCiclo("2026-11-30", a, "GB1"), 12);
  assert.equal(semanaDoCiclo("2026-11-24", a, "GB1"), 13); // antes da nova âncora vale a antiga
});

test("aula padrão: seg/ter = A, qua/qui = B, sex/sáb/dom = null", () => {
  assert.equal(aulaPadrao("2026-11-16"), "A");
  assert.equal(aulaPadrao("2026-11-17"), "A");
  assert.equal(aulaPadrao("2026-11-18"), "B");
  assert.equal(aulaPadrao("2026-11-19"), "B");
  assert.equal(aulaPadrao("2026-11-20"), null);
  assert.equal(aulaPadrao("2026-11-21"), null);
});

test("aula prevista usa o programa e a aula fixa da turma, ou o padrão do dia", () => {
  assert.deepEqual(aulaPrevista("2026-11-18", { programa: "GB1", aula: null }, ancoras),
    { programa: "GB1", semana: 12, aula: "B" });
  assert.deepEqual(aulaPrevista("2026-11-18", { programa: "GB2", aula: "A" }, ancoras),
    { programa: "GB2", semana: 12, aula: "A" });
  assert.deepEqual(aulaPrevista("2026-11-18", { programa: "a definir", aula: null }, ancoras),
    { programa: "a definir", semana: null, aula: "B" });
});

test("sugere fixar a aula quando as duas últimas foram corrigidas para a mesma letra", () => {
  const corr = { realizada: { aula: "A" }, prevista: { aula: "B" } };
  assert.equal(sugerirFixarAula([corr, corr], { aula: null }), "A");
});

test("não sugere com uma correção só, nem se a turma já tem aula fixa", () => {
  const corr = { realizada: { aula: "A" }, prevista: { aula: "B" } };
  const ok = { realizada: { aula: "B" }, prevista: { aula: "B" } };
  assert.equal(sugerirFixarAula([corr], { aula: null }), null);
  assert.equal(sugerirFixarAula([corr, ok], { aula: null }), null);
  assert.equal(sugerirFixarAula([corr, corr], { aula: "B" }), null);
});

import { programasDaTurma } from "../js/logica/ciclo.js";
test("turma mista GB1+GB2 tem os dois programas", () => {
  assert.deepEqual(programasDaTurma({ programa: "GB1+GB2" }), ["GB1", "GB2"]);
  assert.deepEqual(programasDaTurma({ programa: "GB2" }), ["GB2"]);
  assert.deepEqual(programasDaTurma({ programa: "a definir" }), []);
});

test("turma mista não tem semana própria: o check-in pergunta o programa", () => {
  assert.equal(aulaPrevista("2026-11-18", { programa: "GB1+GB2", aula: null }, ancoras).semana, null);
});
