// Ciclo do currículo GB: 16 semanas, cada programa (GB1, GB2) com a sua âncora.
import { segundaDaSemana, diasEntre, diaSemana } from "./datas.js";

export const CICLO_SEMANAS = 16;

// Âncora = { programa, data: "YYYY-MM-DD" (segunda), semana }.
// Vale a âncora mais recente que já começou; se a data é anterior a todas, usa a mais antiga.
function ancoraPara(iso, ancoras, programa) {
  const doPrograma = ancoras.filter(a => a.programa === programa)
    .sort((a, b) => a.data.localeCompare(b.data));
  if (!doPrograma.length) return null;
  const segunda = segundaDaSemana(iso);
  const validas = doPrograma.filter(a => segundaDaSemana(a.data) <= segunda);
  return validas.length ? validas[validas.length - 1] : doPrograma[0];
}

export function semanaDoCiclo(iso, ancoras, programa) {
  if (programa !== "GB1" && programa !== "GB2") return null;
  const a = ancoraPara(iso, ancoras, programa);
  if (!a) return null;
  const semanas = Math.floor(diasEntre(segundaDaSemana(a.data), segundaDaSemana(iso)) / 7);
  return (((a.semana - 1 + semanas) % CICLO_SEMANAS) + CICLO_SEMANAS) % CICLO_SEMANAS + 1;
}

// Padrão enquanto a turma não tem aula fixa: seg/ter = A, qua/qui = B.
export function aulaPadrao(iso) {
  const d = diaSemana(iso);
  return d === 1 || d === 2 ? "A" : d === 3 || d === 4 ? "B" : null;
}

export function aulaPrevista(iso, turma, ancoras) {
  const programa = turma?.programa || "a definir";
  return {
    programa,
    semana: semanaDoCiclo(iso, ancoras, programa),
    aula: turma?.aula ?? aulaPadrao(iso)
  };
}

// aulasDaTurma: check-ins daquela turma, do mais recente para o mais antigo.
export function sugerirFixarAula(aulasDaTurma, turma) {
  if (turma?.aula) return null;
  const [a, b] = aulasDaTurma;
  if (!a || !b) return null;
  const corrigida = x => x.realizada?.aula && x.realizada.aula !== x.prevista?.aula;
  if (corrigida(a) && corrigida(b) && a.realizada.aula === b.realizada.aula) return a.realizada.aula;
  return null;
}

// Programas de uma turma: "GB1", "GB2", mista "GB1+GB2" ou "a definir".
export function programasDaTurma(turma) {
  const p = turma?.programa || "";
  return ["GB1", "GB2"].filter(x => p.includes(x));
}
