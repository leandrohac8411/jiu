// Faixa azul desenhada: ponta preta e uma fita branca por grau (0 a 4).
export function faixaSVG(graus = 0, { apagada = false } = {}) {
  const g = Math.max(0, Math.min(4, Math.floor(Number(graus) || 0)));
  let fitas = "";
  for (let i = 0; i < g; i++) fitas += `<rect x="${214 + i * 13}" y="4" width="7" height="36" fill="#ffffff"/>`;
  return `<svg class="belt" viewBox="0 0 300 44" role="img" aria-label="Faixa azul, ${g} graus"${apagada ? ' style="opacity:.45"' : ""}>` +
    '<rect x="0" y="4" width="300" height="36" rx="4" fill="#2449c9"/>' +
    '<rect x="0" y="9" width="300" height="1.2" fill="#ffffff" opacity=".22"/>' +
    '<rect x="0" y="16" width="300" height="1.2" fill="#ffffff" opacity=".14"/>' +
    '<rect x="0" y="28" width="300" height="1.2" fill="#ffffff" opacity=".14"/>' +
    '<rect x="0" y="34.5" width="300" height="1.2" fill="#ffffff" opacity=".22"/>' +
    '<rect x="206" y="4" width="64" height="36" fill="#111111"/>' + fitas + "</svg>";
}
