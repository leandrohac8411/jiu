import { test } from "node:test";
import assert from "node:assert/strict";
import { faixaSVG } from "../js/ui/faixa.js";
import { anelSVG, meiaLuaSVG, radarSVG } from "../js/ui/graficos.js";

const conta = (s, re) => (s.match(re) || []).length;

test("faixa azul desenha uma fita branca por grau", () => {
  assert.equal(conta(faixaSVG(0), /fill="#ffffff"\/>/g), 0);
  assert.equal(conta(faixaSVG(3), /width="7" height="36" fill="#ffffff"/g), 3);
  assert.match(faixaSVG(2), /aria-label="Faixa azul, 2 graus"/);
});

test("graus fora de 0..4 são limitados", () => {
  assert.equal(conta(faixaSVG(9), /width="7" height="36" fill="#ffffff"/g), 4);
});

test("anel vazio não desenha arco e não tem NaN", () => {
  const s = anelSVG(0);
  assert.doesNotMatch(s, /NaN/);
  assert.match(anelSVG(0.5), /stroke-dasharray="157\.08 314\.16"/);
});

test("meia-lua proporcional", () => {
  assert.match(meiaLuaSVG(0.5), /stroke-dasharray="70\.69 141\.37"/);
  assert.doesNotMatch(meiaLuaSVG(NaN), /NaN/);
});

test("radar marca em vermelho nota baixa e pula sem dados", () => {
  const s = radarSVG([{ rotulo: "Guarda", nota: 80 }, { rotulo: "Costas", nota: 30 }, { rotulo: "Quedas", nota: null }]);
  assert.match(s, /viewBox="-42 0 384 250"/);
  assert.equal(conta(s, /<circle /g), 2);
  assert.match(s, />Costas<\/text>/);
  assert.match(s, /fill="#c8201b"[^>]*>Costas/);
});
