import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIAS, notasPorCategoria, notasPorTecnica, precisaMelhorar, indoBem } from "../js/logica/meujogo.js";

const t = (nome, categoria, resultado) => ({ nome, categoria, resultado });
const dia = i => `2026-${String(11 + Math.floor(i / 28)).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`;
const aula = (i, tecnicas = [], rolaSofri = []) => ({ id: "a" + i, data: dia(i), horario: "19:00", tecnicas, rolaSofri });

test("as 8 categorias de posição", () => {
  assert.deepEqual(CATEGORIAS, ["Guarda", "Raspagem", "Passagem", "Costas", "Finalização", "Defesa de costas", "4 apoios", "Quedas"]);
});

test("sem aulas, todas as categorias ficam sem nota", () => {
  const n = notasPorCategoria([]);
  assert.equal(Object.keys(n).length, 8);
  for (const c of CATEGORIAS) assert.equal(n[c].nota, null);
});

test("nota mistura técnicas e o rola", () => {
  const n = notasPorCategoria([aula(0,
    [t("Relógio", "Finalização", "nao"), t("Mata-leão", "Finalização", "bem")],
    ["Defesa de costas"])]);
  assert.equal(n["Finalização"].nota, 50);
  assert.equal(n["Finalização"].registros, 2);
  assert.equal(n["Defesa de costas"].nota, 0);
  assert.equal(n["Defesa de costas"].sofri, 1);
  assert.equal(n["Defesa de costas"].aulas, 1);
});

test("às vezes vale meio ponto", () => {
  const n = notasPorCategoria([aula(0, [t("Pegada de costas", "Costas", "asvezes")])]);
  assert.equal(n["Costas"].nota, 50);
});

test("só as 20 aulas mais recentes contam", () => {
  const velhas = Array.from({ length: 5 }, (_, i) => aula(i, [t("Kimura", "Finalização", "nao")]));
  const novas = Array.from({ length: 20 }, (_, i) => aula(i + 5, [t("Kimura", "Finalização", "bem")]));
  assert.equal(notasPorCategoria([...velhas, ...novas])["Finalização"].nota, 100);
});

test("nota por técnica", () => {
  const l = [aula(0, [t("Relógio", "Finalização", "nao")]), aula(1, [t("Relógio", "Finalização", "bem")])];
  assert.deepEqual(notasPorTecnica(l).find(x => x.nome === "Relógio"),
    { nome: "Relógio", categoria: "Finalização", nota: 50, registros: 2, nao: 1, bem: 1 });
});

test("precisa melhorar mostra o motivo", () => {
  const l = [
    aula(0, [t("Relógio", "Finalização", "nao")]), aula(1, [t("Relógio", "Finalização", "nao")]),
    aula(2, [t("Relógio", "Finalização", "nao")]), aula(3, [t("Relógio", "Finalização", "bem")])
  ];
  const item = precisaMelhorar(l).find(x => x.titulo === "Relógio");
  assert.equal(item.motivo, "Não saiu em 3 de 4 aulas");
  assert.equal(item.nota, 25);
});

test("precisa melhorar mostra o rola", () => {
  const l = Array.from({ length: 8 }, (_, i) => aula(i, [], i < 5 ? ["Defesa de costas"] : []));
  // 5 registros de rola, todos 0
  const item = precisaMelhorar(l).find(x => x.titulo === "Defesa de costas");
  assert.equal(item.motivo, "Sofreu em 5 de 8 rolas");
});

test("item com um registro só não aparece", () => {
  assert.deepEqual(precisaMelhorar([aula(0, [t("Relógio", "Finalização", "nao")])]), []);
});

test("indo bem, do maior para o menor, no máximo 2", () => {
  const l = [0, 1, 2].map(i => aula(i, [t("Guarda fechada", "Guarda", "bem"), t("Triângulo", "Finalização", "bem"), t("Kimura", "Finalização", "asvezes")]));
  const ib = indoBem(l);
  assert.ok(ib.length <= 2);
  assert.equal(ib[0].nota, 100);
  assert.match(ib[0].motivo, /^Saiu bem em 3 de 3 aulas$/);
});
