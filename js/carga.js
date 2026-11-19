// Grade real da GB Sobradinho (treino adulto, descrição do grupo da academia em 18/11/2026)
// e âncoras do ciclo (semana de 16/11/2026 = semana 12 no GB1 e no GB2).
// Programa, aula A/B e professor ainda não são conhecidos: completar pela tela Grade.
const turma = (diaSemana, horario) => ({ diaSemana, horario, programa: "a definir", aula: null, professor: "", duracaoMin: 60, ativa: true });

export const GRADE_INICIAL = [
  ...[1, 3].flatMap(d => ["12:30", "19:00", "20:00"].map(h => turma(d, h))),
  ...[2, 4].flatMap(d => ["07:00", "19:00", "20:00"].map(h => turma(d, h))),
  turma(5, "12:30"), turma(5, "19:00"),
  turma(6, "10:00")
];

export const ANCORAS_INICIAIS = [
  { programa: "GB1", data: "2026-11-16", semana: 12 },
  { programa: "GB2", data: "2026-11-16", semana: 12 }
];

// ID fixo: gravar a carga duas vezes não duplica a grade.
export const idTurma = t => `${t.diaSemana}-${t.horario.replace(":", "")}`;
