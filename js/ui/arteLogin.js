// Ilustrações do login: faixas vermelhas nos cantos e a faixa azul amarrada sobre o kimono.
export const cantoSup = `<svg class="canto sup" viewBox="0 0 150 170" aria-hidden="true">
  <defs><linearGradient id="cs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5352c"/><stop offset="1" stop-color="#a8150f"/></linearGradient></defs>
  <path d="M0 0H138C92 18 40 66 0 168Z" fill="url(#cs)"/>
  <path d="M0 0H150C110 10 62 46 28 98C18 114 8 134 0 152" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>
  <path d="M0 0H122C82 20 36 70 0 150Z" fill="#fff" opacity=".12"/>
</svg>`;

export const cantoInf = `<svg class="canto inf" viewBox="0 0 170 150" aria-hidden="true">
  <defs><linearGradient id="ci" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a8150f"/><stop offset="1" stop-color="#e5352c"/></linearGradient></defs>
  <path d="M170 150H20C80 132 140 84 170 0Z" fill="url(#ci)"/>
  <path d="M170 18C142 92 92 134 8 150" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>
</svg>`;

const tramaFaixa = (id, ang) =>
  `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})">` +
  `<rect width="5" height="5" fill="none"/><path d="M0 1.2H5M0 3.7H5" stroke="#fff" stroke-opacity=".13" stroke-width="1.1"/>` +
  `<path d="M2.5 0V5" stroke="#000" stroke-opacity=".08" stroke-width=".8"/></pattern>`;

export const noFaixa = `<svg class="no" viewBox="0 0 400 250" role="img" aria-label="Faixa azul amarrada sobre o kimono">
  <defs>
    <linearGradient id="az" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3563f2"/><stop offset=".55" stop-color="#2148d4"/><stop offset="1" stop-color="#16339e"/></linearGradient>
    <linearGradient id="azN" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a3cb4"/><stop offset=".5" stop-color="#2d58ea"/><stop offset="1" stop-color="#16339e"/></linearGradient>
    ${tramaFaixa("t1", -8)}${tramaFaixa("t2", -48)}${tramaFaixa("t3", 82)}${tramaFaixa("t4", -14)}
    <pattern id="gi" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <rect width="6" height="6" fill="#f6f5f2"/><path d="M0 3H6M3 0V6" stroke="#d9d6d0" stroke-width=".9"/><circle cx="3" cy="3" r=".9" fill="#e7e4de"/>
    </pattern>
    <linearGradient id="giS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".97"/></linearGradient>
    <filter id="sombra" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
    <clipPath id="patchClip"><circle cx="338" cy="138" r="52"/></clipPath>
  </defs>

  <!-- faixa que passa por trás, para a direita -->
  <path d="M232 98C282 82 328 70 404 52L408 102C334 112 286 124 242 146Z" fill="url(#az)"/>
  <path d="M232 98C282 82 328 70 404 52L408 102C334 112 286 124 242 146Z" fill="url(#t4)"/>

  <!-- kimono -->
  <path d="M206 252C222 190 246 128 280 86C312 48 360 28 404 22V252Z" fill="url(#gi)"/>
  <path d="M206 252C222 190 246 128 280 86C312 48 360 28 404 22V252Z" fill="url(#giS)"/>
  <path d="M262 112C300 96 352 92 404 98" fill="none" stroke="#cfcbc4" stroke-width="2" opacity=".7"/>
  <path d="M250 150C292 140 350 146 404 160" fill="none" stroke="#d8d4ce" stroke-width="1.6" opacity=".6"/>
  <!-- patch GB bordado -->
  <g transform="rotate(-10 338 138)">
    <circle cx="338" cy="140" r="57" fill="#000" opacity=".14" filter="url(#sombra)"/>
    <circle cx="338" cy="138" r="55" fill="#b81d18"/>
    <image href="img/logo-gb.png" x="286" y="86" width="104" height="104" clip-path="url(#patchClip)"/>
    <circle cx="338" cy="138" r="54" fill="none" stroke="#8e130f" stroke-width="2" stroke-dasharray="2 2"/>
  </g>

  <!-- sombra da faixa sobre o kimono -->
  <ellipse cx="200" cy="168" rx="150" ry="34" fill="#0b1a4f" opacity=".22" filter="url(#sombra)"/>

  <!-- ponta que vem da esquerda -->
  <path d="M-24 126C60 108 150 98 236 94L244 146C152 152 62 166 -24 184Z" fill="url(#az)"/>
  <path d="M-24 126C60 108 150 98 236 94L244 146C152 152 62 166 -24 184Z" fill="url(#t1)"/>
  <path d="M-24 133C60 115 150 105 236 101" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.4"/>
  <path d="M-24 177C62 159 152 145 244 139" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.4"/>

  <!-- ponta que desce -->
  <path d="M196 128C150 168 96 214 30 262L96 272C150 226 196 190 250 150Z" fill="url(#az)"/>
  <path d="M196 128C150 168 96 214 30 262L96 272C150 226 196 190 250 150Z" fill="url(#t2)"/>

  <!-- nó -->
  <path d="M194 74C226 60 262 68 272 94L262 178C246 194 212 196 198 178Z" fill="#0d2470" opacity=".35" filter="url(#sombra)"/>
  <path d="M192 70C224 56 258 64 268 90L258 174C242 190 210 192 196 174Z" fill="url(#azN)"/>
  <path d="M192 70C224 56 258 64 268 90L258 174C242 190 210 192 196 174Z" fill="url(#t3)"/>
  <path d="M200 76C226 66 252 72 260 92" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
  <path d="M204 170C216 182 240 182 252 170" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>

  <!-- esmaece embaixo -->
  <rect x="0" y="150" width="400" height="100" fill="url(#fade)"/>
</svg>`;
