import { hojeISO, deISO, diasNoMes, diaSemana } from "../logica/datas.js";
import { progressoSemana, progressoMes, diasTreinados, ordenarAulas } from "../logica/metas.js";
import { CATEGORIAS, notasPorCategoria, precisaMelhorar, indoBem } from "../logica/meujogo.js";
import { meiaLuaSVG, radarSVG } from "../ui/graficos.js";
import { faixaSVG } from "../ui/faixa.js";
import { esc, dataLonga, nomeMes } from "../ui/util.js";

let aba = "historico";
let mesVisto = null; // { ano, mes }

const pct = f => Math.round(f * 100);

function numeroNaData(aulas, iso) {
  return ordenarAulas(aulas).filter(a => a.data <= iso).length;
}

function historico(e, hoje) {
  const p = e.perfil;
  const sem = progressoSemana(e.aulas, hoje, p.metaSemanal), mes = progressoMes(e.aulas, hoje, p.metaSemanal);
  const graus = [...(p.graus || [])].sort((a, b) => b.numero - a.numero);
  const n = graus.length;
  const desde = p.faixa?.desde || "2026-11";
  const [ay, am] = desde.split("-").map(Number);
  return `
    <div class="gauges">
      <div class="gauge">${meiaLuaSVG(sem.fracao)}<b>${pct(sem.fracao)}%</b><small>${sem.feitas} de ${sem.meta}<br>esta semana</small></div>
      <div class="gauge">${meiaLuaSVG(mes.fracao)}<b>${pct(mes.fracao)}%</b><small>${mes.feitas} de ${mes.meta}<br>este mês</small></div>
    </div>
    ${tabs()}
    <div class="tl">
      ${n < 4 ? `<div class="ev fut"><h4>${n + 1}º grau <span>a critério do professor</span></h4>${faixaSVG(n + 1, { apagada: true })}</div>` : ""}
      ${graus.map(g => `<div class="ev"><h4>${g.numero}º grau <span>${dataLonga(g.data)}</span></h4>${faixaSVG(g.numero)}
        <p>Aula ${numeroNaData(e.aulas, g.data)}${g.professor ? " · " + esc(g.professor) : ""}</p></div>`).join("")}
      <div class="ev"><h4>Graduação faixa azul <span>${nomeMes(am).slice(0, 3)}/${ay}</span></h4>${faixaSVG(0)}<p>Início da contagem das ${p.metaAulasRoxa} aulas</p></div>
    </div>`;
}

function frequencia(e, hoje) {
  const { ano, mes } = mesVisto;
  const marcados = diasTreinados(e.aulas, ano, mes);
  const primeiro = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const vazios = diaSemana(primeiro);
  const total = diasNoMes(ano, mes);
  const h = deISO(hoje);
  const dias = Array.from({ length: total }, (_, i) => i + 1).map(d =>
    `<span class="${marcados.has(d) ? "t" : ""} ${h.ano === ano && h.mes === mes && h.dia === d ? "hoje" : ""}">${d}</span>`).join("");
  return `${tabs()}
    <div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="calnav"><button data-m="-1" aria-label="Mês anterior">‹</button><span>${nomeMes(mes)[0].toUpperCase() + nomeMes(mes).slice(1)} ${ano}</span><button data-m="1" aria-label="Próximo mês">›</button></div>
      <div class="cal">${["D", "S", "T", "Q", "Q", "S", "S"].map(x => `<span class="h">${x}</span>`).join("")}${"<span></span>".repeat(vazios)}${dias}</div>
      <p class="muted" style="margin:0;font-size:12px">${marcados.size} ${marcados.size === 1 ? "dia treinado" : "dias treinados"} neste mês</p>
    </div>`;
}

function meuJogo(e) {
  const notas = notasPorCategoria(e.aulas);
  const tem = Object.values(notas).some(n => n.nota !== null);
  const pm = precisaMelhorar(e.aulas), ib = indoBem(e.aulas);
  const item = x => `<div class="nr"><b>${esc(x.titulo)}</b><span class="bar"><i style="width:${x.nota}%"></i></span><small>${esc(x.motivo)}</small></div>`;
  return `${tabs()}
    ${tem ? `<div class="card radar">${radarSVG(CATEGORIAS.map(c => ({ rotulo: c, nota: notas[c].nota })))}</div>
      <p class="muted" style="margin:-6px 0 0;font-size:11.5px;text-align:center">Últimas ${Math.min(20, e.aulas.length)} aulas</p>
      ${pm.length ? `<div class="need"><div class="k" style="color:var(--red)">Precisa melhorar</div>${pm.map(item).join("")}</div>` : ""}
      ${ib.length ? `<div class="need good"><div class="k" style="color:var(--good)">Indo bem</div>${ib.map(item).join("")}</div>` : ""}
      ${!pm.length && !ib.length ? '<p class="vazio">Ainda poucos registros. Cada técnica precisa aparecer em pelo menos 2 aulas.</p>' : ""}`
    : '<p class="vazio">Faça check-ins marcando como saiu cada técnica para ver seu jogo aqui.</p>'}`;
}

function tabs() {
  return `<div class="tabs" role="tablist">${[["historico", "Histórico"], ["frequencia", "Frequência"], ["jogo", "Meu jogo"]]
    .map(([v, t]) => `<button role="tab" aria-selected="${aba === v}" class="${aba === v ? "on" : ""}" data-aba="${v}">${t}</button>`).join("")}</div>`;
}

export default {
  menu: "evolucao",
  vivo: true,
  montar(el, params, ctx) {
    const e = ctx.estado, hoje = hojeISO();
    if (params[0] && ["historico", "frequencia", "jogo"].includes(params[0])) aba = params[0];
    if (!mesVisto) { const h = deISO(hoje); mesVisto = { ano: h.ano, mes: h.mes }; }
    const corpo = aba === "historico" ? historico(e, hoje) : aba === "frequencia" ? frequencia(e, hoje) : meuJogo(e);
    el.innerHTML = `<div class="ttl">${aba === "jogo" ? "Meu jogo" : "Evolução"}</div>${corpo}`;
    el.querySelectorAll("[data-aba]").forEach(b => b.onclick = () => { aba = b.dataset.aba; this.montar(el, [], ctx); });
    el.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
      let { ano, mes } = mesVisto; mes += Number(b.dataset.m);
      if (mes < 1) { mes = 12; ano--; } if (mes > 12) { mes = 1; ano++; }
      mesVisto = { ano, mes }; this.montar(el, [], ctx);
    });
  }
};
