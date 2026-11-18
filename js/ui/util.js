// Pequenas ajudas de interface.
import { deISO, diaSemana } from "../logica/datas.js";

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];
const dois = n => String(n).padStart(2, "0");

export const dataCurta = iso => { const { mes, dia } = deISO(iso); return `${DIAS[diaSemana(iso)]} ${dois(dia)}/${dois(mes)}`; };
export const dataLonga = iso => { const { ano, mes, dia } = deISO(iso); return `${dois(dia)}/${dois(mes)}/${ano}`; };
export const nomeMes = mes => MESES[mes - 1];
export const mesAno = iso => { const { ano, mes } = deISO(iso); return `${MESES[mes - 1][0].toUpperCase()}${MESES[mes - 1].slice(1)} ${ano}`; };
export const horaTexto = h => (h || "").replace(":", "h");
export const numero = n => String(n).replace(".", ",");

export function saudacao(d = new Date()) {
  const h = d.getHours();
  return h >= 5 && h < 12 ? "Bom dia," : h >= 12 && h < 18 ? "Boa tarde," : "Boa noite,";
}

export function iniciais(nome) {
  return (nome || "?").trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export function toast(texto) {
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status"); t.textContent = texto;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// Folha que sobe de baixo. conteudo(el, fechar) monta o que vai dentro.
export function abrirFolha(conteudo) {
  const fundo = document.createElement("div");
  fundo.className = "folha-fundo";
  const folha = document.createElement("div");
  folha.className = "folha"; folha.setAttribute("role", "dialog"); folha.setAttribute("aria-modal", "true");
  fundo.appendChild(folha);
  const fechar = () => fundo.remove();
  fundo.addEventListener("click", e => { if (e.target === fundo) fechar(); });
  document.body.appendChild(fundo);
  conteudo(folha, fechar);
  return fechar;
}

// Pergunta sim/não dentro da página (o app não usa confirm()).
export function perguntar(titulo, texto, sim = "Sim", nao = "Agora não") {
  return new Promise(resolve => {
    abrirFolha((el, fechar) => {
      el.innerHTML = `<h3>${esc(titulo)}</h3>${texto ? `<p class="muted" style="margin:0">${esc(texto)}</p>` : ""}
        <div class="acoes"><button class="btn ghost" data-r="0">${esc(nao)}</button><button class="btn" data-r="1">${esc(sim)}</button></div>`;
      el.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { fechar(); resolve(b.dataset.r === "1"); });
    });
  });
}
