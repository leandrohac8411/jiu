import { test } from "node:test";
import assert from "node:assert/strict";
import { GRADE_INICIAL, ANCORAS_INICIAIS } from "../js/carga.js";

test("grade real tem 15 turmas de adulto", () => {
  assert.equal(GRADE_INICIAL.length, 15);
  const quarta = GRADE_INICIAL.filter(t => t.diaSemana === 3).map(t => t.horario);
  assert.deepEqual(quarta, ["12:30", "19:00", "20:00"]);
  assert.deepEqual(GRADE_INICIAL.filter(t => t.diaSemana === 6).map(t => t.horario), ["10:00"]);
  assert.ok(GRADE_INICIAL.every(t => t.programa === "a definir" && t.duracaoMin === 60 && t.aula === null));
});

test("GB1 e GB2 começam na semana 12 em 16/11/2026", () => {
  assert.deepEqual(ANCORAS_INICIAIS.map(a => [a.programa, a.data, a.semana]),
    [["GB1", "2026-11-16", 12], ["GB2", "2026-11-16", 12]]);
});

import { idTurma } from "../js/carga.js";
test("id da turma é fixo (dia + horário), para a carga não duplicar", () => {
  assert.equal(idTurma({ diaSemana: 3, horario: "19:00" }), "3-1900");
  assert.equal(new Set(GRADE_INICIAL.map(idTurma)).size, 15);
});
