// Junta as técnicas do currículo com as que já estão no formulário,
// sem perder as notas dadas e sem perder as técnicas adicionadas à mão.
export function mesclarTecnicas(doCurriculo, atuais) {
  const porNome = new Map(atuais.map(t => [t.nome, t]));
  const base = doCurriculo.map(t => ({ nome: t.nome, categoria: t.categoria, resultado: porNome.get(t.nome)?.resultado ?? null }));
  const nomes = new Set(doCurriculo.map(t => t.nome));
  const extras = atuais.filter(t => !nomes.has(t.nome))
    .map(t => ({ nome: t.nome, categoria: t.categoria, resultado: t.resultado ?? null, extra: true }));
  return [...base, ...extras];
}
