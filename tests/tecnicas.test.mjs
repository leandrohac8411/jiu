import { test } from "node:test";
import assert from "node:assert/strict";
import { mesclarTecnicas } from "../js/logica/tecnicas.js";

const cur = [{ nome: "Relógio", categoria: "Finalização" }, { nome: "Mata-leão", categoria: "Finalização" }];

test("recarregar do currículo mantém as notas já dadas", () => {
  const atuais = [{ nome: "Relógio", categoria: "Finalização", resultado: "nao" }];
  assert.deepEqual(mesclarTecnicas(cur, atuais), [
    { nome: "Relógio", categoria: "Finalização", resultado: "nao" },
    { nome: "Mata-leão", categoria: "Finalização", resultado: null }
  ]);
});

test("técnica fora do currículo é mantida como extra, com a nota", () => {
  const atuais = [{ nome: "Kimura", categoria: "Finalização", resultado: "bem" }];
  const r = mesclarTecnicas(cur, atuais);
  assert.deepEqual(r[2], { nome: "Kimura", categoria: "Finalização", resultado: "bem", extra: true });
  assert.equal(r.length, 3);
});

test("sem currículo, só as atuais (todas extras)", () => {
  const r = mesclarTecnicas([], [{ nome: "Kimura", categoria: "Finalização", resultado: null, extra: true }]);
  assert.deepEqual(r, [{ nome: "Kimura", categoria: "Finalização", resultado: null, extra: true }]);
});
