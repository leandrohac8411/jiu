// Gráficos em SVG feitos à mão (sem biblioteca), iguais ao mockup.
const f2 = n => (Math.round(n * 100) / 100).toFixed(2);
const limitar = x => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0);

// Anel do cartão vermelho: trilho branco translúcido + arco branco.
export function anelSVG(fracao) {
  const c = 2 * Math.PI * 50, x = limitar(fracao) * c;
  return `<svg viewBox="0 0 120 120" aria-hidden="true">` +
    `<circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="14"/>` +
    (x > 0 ? `<circle cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="${f2(x)} ${f2(c)}"/>` : "") +
    `</svg>`;
}

// Meia-lua da Evolução (semana / mês).
export function meiaLuaSVG(fracao) {
  const c = Math.PI * 45, x = limitar(fracao) * c;
  const arco = 'd="M15 62 A45 45 0 0 1 105 62" fill="none" stroke-width="12" stroke-linecap="round"';
  return `<svg viewBox="0 0 120 70" aria-hidden="true"><path ${arco} stroke="#eeeae9"/>` +
    (x > 0 ? `<path ${arco} stroke="#c8201b" stroke-dasharray="${f2(x)} ${f2(c)}"/>` : "") + `</svg>`;
}

// Radar do Meu jogo. itens: [{ rotulo, nota (0–100) | null }]
export function radarSVG(itens) {
  const cx = 150, cy = 128, R = 88, n = itens.length;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const xy = p => `${f2(p[0])},${f2(p[1])}`;
  let h = "";
  for (const f of [0.25, 0.5, 0.75, 1]) h += `<polygon points="${itens.map((_, i) => xy(pt(i, R * f))).join(" ")}" fill="none" stroke="#ebe7e6"/>`;
  itens.forEach((_, i) => { const p = pt(i, R); h += `<line x1="${cx}" y1="${cy}" x2="${f2(p[0])}" y2="${f2(p[1])}" stroke="#ebe7e6"/>`; });
  const com = itens.map((it, i) => ({ ...it, i })).filter(it => it.nota !== null && it.nota !== undefined);
  if (com.length >= 3) {
    h += `<polygon points="${itens.map((it, i) => xy(pt(i, R * (it.nota ?? 0) / 100))).join(" ")}" fill="rgba(36,73,201,.18)" stroke="#2449c9" stroke-width="2" stroke-linejoin="round"/>`;
  }
  for (const it of com) {
    const p = pt(it.i, R * it.nota / 100);
    h += `<circle cx="${f2(p[0])}" cy="${f2(p[1])}" r="3.5" fill="${it.nota < 45 ? "#c8201b" : "#2449c9"}"/>`;
  }
  itens.forEach((it, i) => {
    const q = pt(i, R + 16), baixo = it.nota !== null && it.nota !== undefined && it.nota < 45;
    const anc = Math.abs(q[0] - cx) < 6 ? "middle" : q[0] > cx ? "start" : "end";
    h += `<text x="${f2(q[0])}" y="${f2(q[1] + 4)}" text-anchor="${anc}" font-size="10.5" font-weight="${baixo ? 700 : 600}" ` +
      `fill="${baixo ? "#c8201b" : it.nota == null ? "#b3adb3" : "#4b474e"}" font-family="Sora,sans-serif">${it.rotulo}</text>`;
  });
  return `<svg viewBox="-42 0 384 250" role="img" aria-label="Aproveitamento por posição">${h}</svg>`;
}
