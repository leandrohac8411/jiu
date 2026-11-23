import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeParaExportar } from "../js/logica/exportar-grade.js";

test("exporta só turmas ativas e só os campos que o GB Admin usa", () => {
  const grade = [
    { id: "1-1230", diaSemana: 1, horario: "12:30", programa: "GB1", aula: "A", professor: "Prof. X", duracaoMin: 60, ativa: true },
    { id: "2-0700", diaSemana: 2, horario: "07:00", programa: "a definir", aula: null, professor: "", duracaoMin: 60 },
    { id: "3-1900", diaSemana: 3, horario: "19:00", programa: "GB2", professor: "Prof. Y", duracaoMin: 60, ativa: false }
  ];
  const r = gradeParaExportar(grade);
  assert.equal(r.origem, "diario-tatame");
  assert.equal(r.versao, 1);
  assert.equal(r.turmas.length, 2);
  assert.deepEqual(r.turmas[0], { diaSemana: 1, horario: "12:30", programa: "GB1", professor: "Prof. X", duracaoMin: 60 });
  assert.ok(r.turmas.every(t => !("aula" in t) && !("id" in t) && !("ativa" in t)));
});

test("grade vazia ou estragada não quebra", () => {
  assert.deepEqual(gradeParaExportar(null).turmas, []);
  assert.deepEqual(gradeParaExportar([null, 5]).turmas, []);
});
