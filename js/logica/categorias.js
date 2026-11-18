// Categorias IBJJF (adulto/master, peso COM kimono).
// A IBJJF revisa essas tabelas de tempos em tempos: atualize aqui, num lugar só.
import { deISO } from "./datas.js";

// [idade mínima no ano, nome]
export const TABELA_IDADE = [
  [61, "Master 7"], [56, "Master 6"], [51, "Master 5"], [46, "Master 4"],
  [41, "Master 3"], [36, "Master 2"], [30, "Master 1"], [18, "Adulto"], [16, "Juvenil"]
];

// [limite em kg (inclusivo) ou null = sem limite, nome]
export const TABELA_PESO = {
  M: [[57.5, "Galo"], [64, "Pluma"], [70, "Pena"], [76, "Leve"], [82.3, "Médio"],
      [88.3, "Meio-pesado"], [94.3, "Pesado"], [100.5, "Super-pesado"], [null, "Pesadíssimo"]],
  F: [[48.5, "Galo"], [53.5, "Pluma"], [58.5, "Pena"], [64, "Leve"], [69, "Médio"],
      [74, "Meio-pesado"], [79.3, "Pesado"], [null, "Super-pesado"]]
};

export function categoriaIdade(nascimentoISO, hojeISO) {
  if (!nascimentoISO) return null;
  const idadeNoAno = deISO(hojeISO).ano - deISO(nascimentoISO).ano;
  const linha = TABELA_IDADE.find(([min]) => idadeNoAno >= min);
  return linha ? { nome: linha[1], idadeNoAno } : null;
}

export function categoriaPeso(kg, sexo) {
  const tabela = TABELA_PESO[sexo];
  if (!tabela || kg == null || Number.isNaN(Number(kg))) return null;
  const [limite, nome] = tabela.find(([lim]) => lim === null || Number(kg) <= lim);
  return { nome, limite };
}
