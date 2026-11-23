// Grade para levar ao GB Admin: só turmas ativas e só os campos que o painel usa
// (sem IDs nem dados internos do Diário).
export function gradeParaExportar(grade) {
  const turmas = (Array.isArray(grade) ? grade : [])
    .filter(t => t && typeof t === "object" && t.ativa !== false)
    .map(t => ({ diaSemana: t.diaSemana, horario: t.horario, programa: String(t.programa ?? ""), professor: String(t.professor ?? ""), duracaoMin: t.duracaoMin }));
  return { origem: "diario-tatame", versao: 1, turmas };
}
