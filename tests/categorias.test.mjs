import { test } from "node:test";
import assert from "node:assert/strict";
import { categoriaIdade, categoriaPeso } from "../js/logica/categorias.js";

test("idade conta a que a pessoa completa no ano", () => {
  assert.deepEqual(categoriaIdade("1992-12-31", "2026-01-01"), { nome: "Master 1", idadeNoAno: 34 });
});

test("faixas de idade nos limites", () => {
  assert.equal(categoriaIdade("1996-05-01", "2026-11-18").nome, "Master 1"); // 30
  assert.equal(categoriaIdade("1997-05-01", "2026-11-18").nome, "Adulto");   // 29
  assert.equal(categoriaIdade("2010-05-01", "2026-11-18").nome, "Juvenil");  // 16
  assert.equal(categoriaIdade("1990-01-01", "2026-11-18").nome, "Master 2"); // 36
  assert.equal(categoriaIdade("1960-01-01", "2026-11-18").nome, "Master 7"); // 66
});

test("abaixo de 16 anos não tem categoria", () => {
  assert.equal(categoriaIdade("2012-01-01", "2026-11-18"), null);
});

test("sem data de nascimento devolve null", () => {
  assert.equal(categoriaIdade(null, "2026-11-18"), null);
});

test("peso masculino com kimono", () => {
  assert.deepEqual(categoriaPeso(78.4, "M"), { nome: "Médio", limite: 82.3 });
  assert.equal(categoriaPeso(82.3, "M").nome, "Médio");
  assert.equal(categoriaPeso(57.5, "M").nome, "Galo");
  assert.deepEqual(categoriaPeso(101, "M"), { nome: "Pesadíssimo", limite: null });
});

test("peso feminino com kimono", () => {
  assert.equal(categoriaPeso(64, "F").nome, "Leve");
  assert.equal(categoriaPeso(48, "F").nome, "Galo");
  assert.deepEqual(categoriaPeso(80, "F"), { nome: "Super-pesado", limite: null });
});

test("sem peso ou sexo devolve null", () => {
  assert.equal(categoriaPeso(null, "M"), null);
  assert.equal(categoriaPeso(70, null), null);
});
