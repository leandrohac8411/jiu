// Bloqueio de login: depois de 5 senhas erradas em 10 minutos, espera 1 minuto.
// Cada erro a mais depois disso (ainda dentro dos 10 minutos) bloqueia mais 1 minuto.
// Fica guardado no aparelho; a proteção de verdade é a do Firebase, que também barra
// excesso de tentativas no servidor (erro auth/too-many-requests).
export const LIMITE = 5, JANELA_MS = 10 * 60 * 1000, BLOQUEIO_MS = 60 * 1000;

export const vazio = () => ({ falhas: [], ate: 0 });

// Lê o que veio do armazenamento sem confiar no formato.
export function normalizar(bruto) {
  const e = bruto && typeof bruto === "object" ? bruto : {};
  const falhas = Array.isArray(e.falhas) ? e.falhas.filter(n => Number.isFinite(n)).slice(-50) : [];
  return { falhas, ate: Number.isFinite(e.ate) ? e.ate : 0 };
}

// Quanto falta para liberar (ms). 0 = pode tentar.
export function esperaRestante(estado, agora) {
  const e = normalizar(estado);
  // Relógio do aparelho voltou para trás: não deixa um bloqueio "eterno" maior que 1 minuto.
  return Math.max(0, Math.min(e.ate - agora, BLOQUEIO_MS));
}

export function registrarFalha(estado, agora) {
  const e = normalizar(estado);
  const falhas = [...e.falhas.filter(t => agora - t < JANELA_MS && t <= agora), agora];
  return { falhas, ate: falhas.length >= LIMITE ? agora + BLOQUEIO_MS : e.ate };
}

export const registrarSucesso = () => vazio();

export const tentativasRestantes = (estado, agora) =>
  Math.max(0, LIMITE - normalizar(estado).falhas.filter(t => agora - t < JANELA_MS && t <= agora).length);
