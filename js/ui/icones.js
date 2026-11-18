// Ícones de traço do menu inferior (mesmos do mockup).
export const ICONES = {
  inicio: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  grade: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h3M13.5 14h3M7.5 17.5h3"/>',
  diario: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>',
  evolucao: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'
};

const ITENS = [
  ["inicio", "Início"], ["grade", "Grade"], ["diario", "Diário"], ["evolucao", "Evolução"], ["perfil", "Perfil"]
];

export function menuInferior(ativo) {
  return '<nav class="nav" aria-label="Menu">' + ITENS.map(([rota, nome]) =>
    `<a href="#${rota}" class="${rota === ativo ? "on" : ""}"${rota === ativo ? ' aria-current="page"' : ""}>` +
    `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[rota]}</svg>${nome}</a>`
  ).join("") + "</nav>";
}
