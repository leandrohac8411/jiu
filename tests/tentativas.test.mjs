import { test } from "node:test";
import assert from "node:assert/strict";
import { vazio, registrarFalha, registrarSucesso, esperaRestante, tentativasRestantes, normalizar, LIMITE, BLOQUEIO_MS, JANELA_MS } from "../js/logica/tentativas.js";

const T0 = 1_800_000_000_000;

test("4 erros não bloqueiam; o 5º bloqueia por 1 minuto", () => {
  let e = vazio();
  for (let i = 0; i < LIMITE - 1; i++) e = registrarFalha(e, T0 + i * 1000);
  assert.equal(esperaRestante(e, T0 + 5000), 0);
  assert.equal(tentativasRestantes(e, T0 + 5000), 1);
  e = registrarFalha(e, T0 + 5000);
  assert.equal(esperaRestante(e, T0 + 5000), BLOQUEIO_MS);
  assert.equal(esperaRestante(e, T0 + 5000 + 30_000), 30_000);
  assert.equal(esperaRestante(e, T0 + 5000 + BLOQUEIO_MS), 0);
});

test("errar de novo logo depois do bloqueio bloqueia mais 1 minuto", () => {
  let e = vazio();
  for (let i = 0; i < LIMITE; i++) e = registrarFalha(e, T0);
  const depois = T0 + BLOQUEIO_MS + 1000;
  assert.equal(esperaRestante(e, depois), 0);
  e = registrarFalha(e, depois);
  assert.equal(esperaRestante(e, depois), BLOQUEIO_MS);
});

test("erros antigos (mais de 10 minutos) não contam", () => {
  let e = vazio();
  for (let i = 0; i < LIMITE - 1; i++) e = registrarFalha(e, T0);
  e = registrarFalha(e, T0 + JANELA_MS + 1);
  assert.equal(esperaRestante(e, T0 + JANELA_MS + 1), 0);
  assert.equal(e.falhas.length, 1);
});

test("acertar a senha zera tudo", () => {
  let e = vazio();
  for (let i = 0; i < LIMITE; i++) e = registrarFalha(e, T0);
  e = registrarSucesso();
  assert.equal(esperaRestante(e, T0), 0);
  assert.equal(tentativasRestantes(e, T0), LIMITE);
});

test("dado estragado no aparelho não quebra nem trava para sempre", () => {
  assert.deepEqual(normalizar(null), vazio());
  assert.deepEqual(normalizar("lixo"), vazio());
  assert.deepEqual(normalizar({ falhas: ["x", 5, NaN], ate: "amanhã" }), { falhas: [5], ate: 0 });
  // bloqueio gravado para o ano 3000 vale no máximo 1 minuto
  assert.equal(esperaRestante({ falhas: [], ate: T0 * 10 }, T0), BLOQUEIO_MS);
});
