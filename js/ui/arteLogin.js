// Faixas vermelhas curvas nos cantos do login (como no modelo enviado pelo Leandro).
export const cantoSup = `<svg class="canto sup" viewBox="0 0 120 210" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="cs1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4a3d"/><stop offset="1" stop-color="#c8201b"/></linearGradient>
    <linearGradient id="cs2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3150f"/><stop offset="1" stop-color="#7d0c08"/></linearGradient>
  </defs>
  <path d="M0 0H120C70 40 26 110 0 210Z" fill="url(#cs1)"/>
  <path d="M0 0H92C52 34 18 96 0 176Z" fill="url(#cs2)"/>
  <path d="M106 0C60 40 22 106 0 196" fill="none" stroke="#fff" stroke-width="3.5"/>
  <path d="M0 0H62C34 28 12 70 0 120Z" fill="#fff" opacity=".1"/>
</svg>`;

export const cantoInf = `<svg class="canto inf" viewBox="0 0 220 130" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="ci1" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9e120d"/><stop offset="1" stop-color="#ff4a3d"/></linearGradient>
  </defs>
  <path d="M220 130H0C90 120 170 78 220 0Z" fill="url(#ci1)"/>
  <path d="M220 14C172 84 96 118 10 130" fill="none" stroke="#fff" stroke-width="3.5"/>
  <path d="M220 130H70C140 116 196 82 220 44Z" fill="#7d0c08" opacity=".55"/>
</svg>`;
