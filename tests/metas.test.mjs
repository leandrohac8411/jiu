import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ordenarAulas, numeroDaAula, progressoRoxa, progressoSemana, progressoMes,
  horasTatame, diasTreinados, paraRevisar
} from "../js/logica/metas.js";

const aula = (id, data, extra = {}) => ({ id, data, horario: "19:00", duracaoMin: 60, tecnicas: [], dificuldade: 2, ...extra });

test("ordena por data e horário", () => {
  const l = ordenarAulas([aula("b", "2026-11-18"), aula("a", "2026-11-18", { horario: "07:00" }), aula("c", "2026-11-17")]);
  assert.deepEqual(l.map(a => a.id), ["c", "a", "b"]);
});

test("número da aula vem da ordem e é recalculado ao excluir", () => {
  const tres = [aula("id-17", "2026-11-17"), aula("id-18", "2026-11-18"), aula("id-19", "2026-11-19")];
  assert.equal(numeroDaAula(tres, "id-19"), 3);
  assert.equal(numeroDaAula(tres.filter(a => a.id !== "id-18"), "id-19"), 2);
});

test("progresso para a roxa sem aulas e com meta zero não gera NaN", () => {
  assert.deepEqual(progressoRoxa([], 175), { feitas: 0, meta: 175, fracao: 0 });
  assert.equal(progressoRoxa([aula("a", "2026-11-17")], 0).fracao, 0);
});

test("progresso para a roxa não passa de 100%", () => {
  const muitas = Array.from({ length: 5 }, (_, i) => aula("a" + i, "2026-11-17"));
  assert.equal(progressoRoxa(muitas, 3).fracao, 1);
});

test("semana vai de segunda a domingo", () => {
  const l = [aula("a", "2026-11-16"), aula("b", "2026-11-22"), aula("c", "2026-11-23"), aula("d", "2026-11-15")];
  assert.deepEqual(progressoSemana(l, "2026-11-22", 2), { feitas: 2, meta: 2, fracao: 1 });
});

test("meta do mês = meta semanal × semanas do mês arredondado", () => {
  assert.equal(progressoMes([], "2026-11-18", 2).meta, 8);  // 30/7 = 4,29 → 4
  assert.equal(progressoMes([], "2026-12-01", 2).meta, 8);  // 31/7 = 4,43 → 4
  assert.equal(progressoMes([aula("a", "2026-11-02"), aula("b", "2026-10-31")], "2026-11-18", 2).feitas, 1);
});

test("horas de tatame somam a duração", () => {
  assert.equal(horasTatame([{ duracaoMin: 60 }, { duracaoMin: 90 }]), 2.5);
  assert.equal(horasTatame([]), 0);
});

test("dias treinados do mês", () => {
  const s = diasTreinados([aula("a", "2026-11-17"), aula("b", "2026-11-17"), aula("c", "2026-12-01")], 2026, 11);
  assert.deepEqual([...s], [17]);
});

test("para revisar: técnicas que não saíram ou de aulas difíceis, sem repetir", () => {
  const l = [
    aula("a", "2026-11-17", { tecnicas: [{ nome: "Relógio", categoria: "Finalização", resultado: "nao" }] }),
    aula("b", "2026-11-18", { tecnicas: [{ nome: "Relógio", categoria: "Finalização", resultado: "nao" }, { nome: "Mata-leão", categoria: "Finalização", resultado: "bem" }] }),
    aula("c", "2026-11-19", { dificuldade: 5, tecnicas: [{ nome: "Raspagem da aranha", categoria: "Raspagem", resultado: "asvezes" }] })
  ];
  assert.deepEqual(paraRevisar(l), ["Raspagem da aranha", "Relógio"]);
});
