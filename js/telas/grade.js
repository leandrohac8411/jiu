import { hojeISO, segundaDaSemana, somarDias, deISO } from "../logica/datas.js";
import { semanaDoCiclo, CICLO_SEMANAS } from "../logica/ciclo.js";
import { salvarTurma, excluirTurma, adicionarAncora, chaveCurriculo } from "../dados.js";
import { esc, horaTexto, abrirFolha, perguntar, toast } from "../ui/util.js";
import { wm, turmasDoDia, etiquetaPrograma } from "./comum.js";

const NOMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
let diaEscolhido = null;

function temaDe(curriculo, programa, semana, aula) {
  const c = curriculo[chaveCurriculo(programa, semana)];
  const a = aula ? c?.[`aula${aula}`] : (c?.aulaA || c?.aulaB);
  return a?.tema || "";
}

export default {
  menu: "grade",
  vivo: true,
  montar(el, _p, { estado: e }) {
    const hoje = hojeISO();
    const seg = segundaDaSemana(hoje);
    const dias = [0, 1, 2, 3, 4, 5].map(i => somarDias(seg, i));
    if (!diaEscolhido || !dias.includes(diaEscolhido)) diaEscolhido = dias.includes(hoje) ? hoje : dias[0];
    const turmas = turmasDoDia(e.grade, diaEscolhido);

    const ciclos = ["GB1", "GB2"].map(p => {
      const s = semanaDoCiclo(diaEscolhido, e.ancoras, p);
      if (!s) return "";
      const tema = temaDe(e.curriculo, p, s);
      const prox = s % CICLO_SEMANAS + 1;
      const temaProx = temaDe(e.curriculo, p, prox);
      return `<div class="card cyc">
        <div class="k">Ciclo ${p} · semana ${s} de ${CICLO_SEMANAS}</div>
        <div class="cycbar" aria-hidden="true">${Array.from({ length: CICLO_SEMANAS }, (_, i) => `<i class="${i + 1 < s ? "done" : i + 1 === s ? "cur" : ""}"></i>`).join("")}</div>
        <h4>${esc(tema ? tema.replace(/^[^:]*:\s*/, "") : "Tema a registrar")}</h4>
        ${tema ? `<p>${esc(tema.split(":")[0])}</p>` : `<p>O tema entra quando vocês registrarem a primeira aula ${p} desta semana.</p>`}
        <div class="sec" style="font-weight:600"><span>Próxima · semana ${prox}</span><span>${esc(temaProx ? temaProx.replace(/^[^:]*:\s*/, "") : "a registrar")}</span></div>
        <button class="link" data-ajustar="${p}" style="text-align:left">Ajustar semana</button>
      </div>`;
    }).join("");

    el.innerHTML = `
      <div class="ttl">Grade${wm}</div>
      <div class="days">${dias.map(d => `<button data-dia="${d}" class="${d === diaEscolhido ? "on" : ""} ${d === hoje ? "tod" : ""}">${NOMES[new Date(d + "T12:00").getDay()]}<b>${deISO(d).dia}</b></button>`).join("")}</div>
      ${ciclos}
      <div class="cls">${turmas.map(t => `
        <button class="row" data-turma="${t.id}">
          <span class="t">${horaTexto(t.horario)}</span>
          <span class="d">${t.professor ? esc(t.professor) : "Professor a definir"}<small>${t.aula ? "Aula " + t.aula + " · " : ""}${t.duracaoMin || 60} min</small></span>
          ${etiquetaPrograma(t.programa)}
        </button>`).join("") || '<p class="vazio">Sem turmas neste dia.</p>'}</div>
      <button class="chip add" id="nova" style="align-self:center">+ turma</button>`;

    el.querySelectorAll("[data-dia]").forEach(b => b.onclick = () => { diaEscolhido = b.dataset.dia; this.montar(el, _p, { estado: e }); });
    el.querySelectorAll("[data-turma]").forEach(b => b.onclick = () => editarTurma(e.grade.find(t => t.id === b.dataset.turma)));
    el.querySelector("#nova").onclick = () => editarTurma({ diaSemana: new Date(diaEscolhido + "T12:00").getDay(), horario: "19:00", programa: "a definir", aula: null, professor: "", duracaoMin: 60, ativa: true });
    el.querySelectorAll("[data-ajustar]").forEach(b => b.onclick = () => ajustarSemana(b.dataset.ajustar, semanaDoCiclo(hoje, e.ancoras, b.dataset.ajustar), seg));
  }
};

function ajustarSemana(programa, atual, segunda) {
  abrirFolha((folha, fechar) => {
    folha.innerHTML = `<h3>Em que semana do ${programa} estamos?</h3>
      <p class="muted" style="margin:0">Use quando a academia pular ou repetir uma semana. Vale a partir desta semana.</p>
      <select class="input" id="sem">${Array.from({ length: CICLO_SEMANAS }, (_, i) => i + 1).map(n => `<option value="${n}" ${n === atual ? "selected" : ""}>Semana ${n}</option>`).join("")}</select>
      <div class="acoes"><button class="btn ghost" id="c">Cancelar</button><button class="btn" id="ok">Salvar</button></div>`;
    folha.querySelector("#c").onclick = fechar;
    folha.querySelector("#ok").onclick = async () => {
      await adicionarAncora({ programa, data: segunda, semana: Number(folha.querySelector("#sem").value) });
      fechar(); toast("Semana ajustada.");
    };
  });
}

function editarTurma(t) {
  abrirFolha((folha, fechar) => {
    const opt = (v, atual, txt = v) => `<option value="${v}" ${String(atual) === String(v) ? "selected" : ""}>${txt}</option>`;
    folha.innerHTML = `<h3>${t.id ? "Editar turma" : "Nova turma"}</h3>
      <div class="field"><label for="dia">Dia</label><select class="input" id="dia">${[1, 2, 3, 4, 5, 6, 0].map(d => opt(d, t.diaSemana, ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][d])).join("")}</select></div>
      <div class="field"><label for="hora">Horário</label><input class="input" id="hora" type="time" value="${t.horario}"></div>
      <div class="field"><label for="prog">Programa</label><select class="input" id="prog">${opt("a definir", t.programa)}${opt("GB1", t.programa)}${opt("GB2", t.programa)}</select></div>
      <div class="field"><label for="aula">Aula</label><select class="input" id="aula">${opt("", t.aula ?? "", "A definir (seg/ter = A, qua/qui = B)")}${opt("A", t.aula ?? "", "Sempre A")}${opt("B", t.aula ?? "", "Sempre B")}</select></div>
      <div class="field"><label for="prof">Professor</label><input class="input" id="prof" value="${esc(t.professor)}"></div>
      <div class="field"><label for="dur">Duração (min)</label><input class="input" id="dur" type="number" min="10" max="240" step="5" value="${t.duracaoMin || 60}"></div>
      <div class="acoes"><button class="btn ghost" id="c">Cancelar</button><button class="btn" id="ok">Salvar</button></div>
      ${t.id ? '<button class="out" id="del">Excluir turma</button>' : ""}`;
    const v = id => folha.querySelector("#" + id).value;
    folha.querySelector("#c").onclick = fechar;
    folha.querySelector("#ok").onclick = async () => {
      await salvarTurma({ ...t, diaSemana: Number(v("dia")), horario: v("hora") || t.horario, programa: v("prog"), aula: v("aula") || null, professor: v("prof").trim(), duracaoMin: Number(v("dur")) || 60, ativa: true });
      fechar(); toast("Turma salva.");
    };
    const del = folha.querySelector("#del");
    if (del) del.onclick = async () => {
      fechar();
      if (await perguntar("Excluir esta turma?", "As aulas já registradas nela continuam no diário.", "Excluir", "Cancelar")) { await excluirTurma(t.id); toast("Turma excluída."); }
    };
  });
}
