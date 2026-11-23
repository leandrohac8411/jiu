import { test } from "node:test";
import assert from "node:assert/strict";
import { ACADEMIA, distanciaM, avaliarLocal, distanciaTexto } from "../js/logica/local.js";

// ~1 m de latitude = 1/111320 grau
const aMetros = (m, precisao = 5) => ({ lat: ACADEMIA.lat + m / 111320, lng: ACADEMIA.lng, precisao });

test("distância: mesmo ponto é zero e 1 grau de latitude ≈ 111 km", () => {
  assert.equal(Math.round(distanciaM(ACADEMIA, ACADEMIA)), 0);
  const d = distanciaM({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
  assert.ok(Math.abs(d - 111195) < 50);
});

test("dentro de 50 m libera, longe bloqueia", () => {
  assert.equal(avaliarLocal(aMetros(20)).ok, true);
  assert.equal(avaliarLocal(aMetros(50, 0)).ok, true);
  assert.equal(avaliarLocal(aMetros(80, 5)).ok, false);
  assert.equal(avaliarLocal({ lat: -15.6421, lng: -47.8124, precisao: 10 }).ok, false); // outro ponto de Sobradinho
});

test("margem de erro do GPS ajuda, mas no máximo 50 m a mais", () => {
  assert.equal(avaliarLocal(aMetros(80, 40)).ok, true);   // 80 ≤ 50 + 40
  assert.equal(avaliarLocal(aMetros(95, 2000)).ok, true); // 95 ≤ 50 + 50
  assert.equal(avaliarLocal(aMetros(120, 2000)).ok, false);
  const r = avaliarLocal(aMetros(30, 12.4));
  assert.equal(r.distancia, 30);
  assert.equal(r.precisao, 12);
});

test("texto da distância", () => {
  assert.equal(distanciaTexto(12), "12 m");
  assert.equal(distanciaTexto(2349), "2,3 km");
});
