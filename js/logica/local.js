// Check-in só na academia: distância entre o celular e a GB Sobradinho (Q 12, loja 2).
export const ACADEMIA = { nome: "GB Sobradinho", lat: -15.6496791, lng: -47.7906608, raio: 50 };

// Distância em metros entre dois pontos {lat, lng} (fórmula de haversine).
export function distanciaM(a, b) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// O GPS dentro de prédio erra. Aceita a margem de erro que o próprio celular informa,
// mas no máximo mais 50 m (sinal ruim de 1 km não libera ninguém de casa).
export function avaliarLocal(pos, alvo = ACADEMIA) {
  const distancia = Math.round(distanciaM(pos, alvo));
  const precisao = Math.round(Number(pos.precisao) || 0);
  return { ok: distancia <= alvo.raio + Math.min(precisao, alvo.raio), distancia, precisao };
}

export const distanciaTexto = m => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);
