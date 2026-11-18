// "Meu jogo": aproveitamento por posição nas últimas aulas.
// Pontos: Saiu bem = 1, Às vezes = 0,5, Não saiu = 0; cada aula em que a posição
// foi marcada em "no rola, onde sofri" conta mais um ponto 0.
import { ordenarAulas } from "./metas.js";

// Os nomes ficam gravados nas aulas: só ACRESCENTE no fim.
export const CATEGORIAS = ["Guarda", "Raspagem", "Passagem", "Costas", "Finalização", "Defesa de costas", "4 apoios", "Quedas"];

const PONTOS = { bem: 1, asvezes: 0.5, nao: 0 };
const MIN_REGISTROS = 2;
const media = l => (l.length ? Math.round(l.reduce((s, x) => s + x, 0) / l.length * 100) : null);
const janelaDe = (aulas, n) => ordenarAulas(aulas).slice(-n);

export function notasPorCategoria(aulas, janela = 20) {
  const ult = janelaDe(aulas, janela);
  const out = {};
  for (const c of CATEGORIAS) {
    const pontos = [];
    let sofri = 0;
    for (const a of ult) {
      for (const t of a.tecnicas || []) if (t.categoria === c && t.resultado in PONTOS) pontos.push(PONTOS[t.resultado]);
      if ((a.rolaSofri || []).includes(c)) { pontos.push(0); sofri++; }
    }
    out[c] = { nota: media(pontos), registros: pontos.length, sofri, aulas: ult.length };
  }
  return out;
}

export function notasPorTecnica(aulas, janela = 20) {
  const por = new Map();
  for (const a of janelaDe(aulas, janela)) {
    for (const t of a.tecnicas || []) {
      if (!(t.resultado in PONTOS)) continue;
      const x = por.get(t.nome) || { nome: t.nome, categoria: t.categoria, pontos: [], nao: 0, bem: 0 };
      x.pontos.push(PONTOS[t.resultado]);
      if (t.resultado === "nao") x.nao++;
      if (t.resultado === "bem") x.bem++;
      por.set(t.nome, x);
    }
  }
  return [...por.values()].map(({ pontos, ...x }) =>
    ({ nome: x.nome, categoria: x.categoria, nota: media(pontos), registros: pontos.length, nao: x.nao, bem: x.bem }));
}

export function precisaMelhorar(aulas) {
  const tecnicas = notasPorTecnica(aulas)
    .filter(t => t.registros >= MIN_REGISTROS && t.nota < 60)
    .map(t => ({ titulo: t.nome, nota: t.nota, motivo: `Não saiu em ${t.nao} de ${t.registros} aulas` }));
  const cats = Object.entries(notasPorCategoria(aulas))
    .filter(([, c]) => c.registros >= MIN_REGISTROS && c.nota < 60 && c.sofri > 0)
    .map(([nome, c]) => ({ titulo: nome, nota: c.nota, motivo: `Sofreu em ${c.sofri} de ${c.aulas} rolas` }));
  return [...cats, ...tecnicas].sort((a, b) => a.nota - b.nota).slice(0, 3);
}

export function indoBem(aulas) {
  return notasPorTecnica(aulas)
    .filter(t => t.registros >= MIN_REGISTROS && t.nota >= 70)
    .sort((a, b) => b.nota - a.nota || b.registros - a.registros)
    .slice(0, 2)
    .map(t => ({ titulo: t.nome, nota: t.nota, motivo: `Saiu bem em ${t.bem} de ${t.registros} aulas` }));
}
