import { test } from "node:test";
import assert from "node:assert/strict";
import { hojeISO, deISO, diaSemana, segundaDaSemana, diasEntre } from "../js/logica/datas.js";

test("hojeISO usa a data local, mesmo às 23h50", () => {
  assert.equal(hojeISO(new Date(2026, 10, 18, 23, 50)), "2026-11-18");
});

test("deISO separa ano, mês e dia", () => {
  assert.deepEqual(deISO("2026-11-18"), { ano: 2026, mes: 11, dia: 18 });
});

test("diaSemana: 0 = domingo", () => {
  assert.equal(diaSemana("2026-11-22"), 0);
  assert.equal(diaSemana("2026-11-16"), 1);
});

test("segundaDaSemana de um domingo é a segunda anterior", () => {
  assert.equal(segundaDaSemana("2026-11-22"), "2026-11-16");
  assert.equal(segundaDaSemana("2026-11-16"), "2026-11-16");
  assert.equal(segundaDaSemana("2026-11-01"), "2026-10-26");
});

test("diasEntre atravessa meses e anos", () => {
  assert.equal(diasEntre("2026-11-16", "2026-11-23"), 7);
  assert.equal(diasEntre("2026-12-28", "2027-01-04"), 7);
  assert.equal(diasEntre("2026-11-23", "2026-11-16"), -7);
});

import { dataValida } from "../js/logica/datas.js";
test("data válida: só YYYY-MM-DD de verdade", () => {
  assert.equal(dataValida("2026-11-18"), true);
  assert.equal(dataValida("2026-02-30"), false);
  assert.equal(dataValida("18/11/2026"), false);
  assert.equal(dataValida(undefined), false);
});
