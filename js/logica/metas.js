// Contagem de aulas e metas. Nada disso é guardado: tudo sai da lista de aulas,
// então excluir ou editar uma aula corrige os números sozinho.
import { segundaDaSemana, somarDias, deISO, diasNoMes } from "./datas.js";

const fracaoDe = (feitas, meta) => (meta > 0 ? Math.min(1, feitas / meta) : 0);

export function ordenarAulas(aulas) {
  return [...aulas].sort((a, b) =>
    a.data.localeCompare(b.data) || (a.horario || "").localeCompare(b.horario || ""));
}

export function numeroDaAula(aulas, id) {
  return ordenarAulas(aulas).findIndex(a => a.id === id) + 1;
}

export function progressoRoxa(aulas, metaAulasRoxa) {
  const feitas = aulas.length;
  return { feitas, meta: metaAulasRoxa, fracao: fracaoDe(feitas, metaAulasRoxa) };
}

export function progressoSemana(aulas, hojeISO, metaSemanal) {
  const ini = segundaDaSemana(hojeISO), fim = somarDias(ini, 6);
  const feitas = aulas.filter(a => a.data >= ini && a.data <= fim).length;
  return { feitas, meta: metaSemanal, fracao: fracaoDe(feitas, metaSemanal) };
}

export function progressoMes(aulas, hojeISO, metaSemanal) {
  const { ano, mes } = deISO(hojeISO);
  const prefixo = hojeISO.slice(0, 7);
  const feitas = aulas.filter(a => a.data.startsWith(prefixo)).length;
  const meta = metaSemanal * Math.round(diasNoMes(ano, mes) / 7);
  return { feitas, meta, fracao: fracaoDe(feitas, meta) };
}

export function horasTatame(aulas) {
  const min = aulas.reduce((s, a) => s + (Number(a.duracaoMin) || 0), 0);
  return Math.round(min / 6) / 10;
}

export function diasTreinados(aulas, ano, mes) {
  const prefixo = `${ano}-${String(mes).padStart(2, "0")}`;
  return new Set(aulas.filter(a => a.data.startsWith(prefixo)).map(a => deISO(a.data).dia));
}

export function paraRevisar(aulas, n = 10) {
  const recentes = ordenarAulas(aulas).slice(-n).reverse();
  const nomes = [];
  for (const a of recentes) {
    for (const t of a.tecnicas || []) {
      if ((t.resultado === "nao" || a.dificuldade >= 4) && !nomes.includes(t.nome)) nomes.push(t.nome);
    }
  }
  return nomes.slice(0, 5);
}
