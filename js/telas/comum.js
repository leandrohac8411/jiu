// Ajudas compartilhadas entre telas.
import { diaSemana } from "../logica/datas.js";
import { chaveCurriculo, lerFoto } from "../dados.js";


export function turmasDoDia(grade, iso) {
  const d = diaSemana(iso);
  return grade.filter(t => t.ativa !== false && Number(t.diaSemana) === d)
    .sort((a, b) => a.horario.localeCompare(b.horario));
}

// Conteúdo do currículo para { programa, semana, aula } (ou null).
export function conteudoPrevisto(curriculo, prev) {
  if (!prev || !prev.semana || !prev.aula) return null;
  const c = curriculo[chaveCurriculo(prev.programa, prev.semana)];
  const a = c?.[`aula${prev.aula}`];
  return a && (a.tema || a.tecnicas?.length) ? a : null;
}

export function etiquetaPrograma(p) {
  const tags = [];
  if (String(p).includes("GB1")) tags.push('<span class="tag gb1">GB1</span>');
  if (String(p).includes("GB2")) tags.push('<span class="tag gb2">GB2</span>');
  return tags.length ? `<span style="display:flex;gap:4px">${tags.join("")}</span>` : '<span class="tag">a definir</span>';
}

// Põe a foto (base64) como fundo de um elemento quando ela chegar.
export async function pintarFoto(uid, fotoId, el) {
  if (!fotoId || !el) return;
  try {
    const dados = await lerFoto(uid, fotoId);
    if (dados && el.isConnected) {
      el.style.backgroundImage = `url(${dados})`;
      el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center";
      el.querySelector(".ini")?.remove(); // iniciais no lugar da foto de perfil
      if (!el.children.length) el.textContent = ""; // só tira o "＋", nunca botões e legendas
    }
  } catch { /* sem foto, fica o placeholder */ }
}

export function minutosAgora(d = new Date()) { return d.getHours() * 60 + d.getMinutes(); }
export function minutosDe(h) { const [hh, mm] = (h || "0:0").split(":").map(Number); return hh * 60 + mm; }
