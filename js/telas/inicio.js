import { hojeISO } from "../logica/datas.js";
import { aulaPrevista, semanaDoCiclo } from "../logica/ciclo.js";
import { progressoRoxa, progressoSemana, progressoMes, horasTatame } from "../logica/metas.js";
import { faixaSVG } from "../ui/faixa.js";
import { anelSVG } from "../ui/graficos.js";
import { esc, temaCurto, saudacao, iniciais, dataCurta, horaTexto, numero } from "../ui/util.js";
import { turmasDoDia, conteudoPrevisto, pintarFoto, minutosAgora, minutosDe } from "./comum.js";

export default {
  menu: "inicio",
  vivo: true,
  montar(el, _p, { estado: e }) {
    const hoje = hojeISO();
    const perfil = e.perfil;
    const graus = perfil.graus?.length || 0;
    const roxa = progressoRoxa(e.aulas, perfil.metaAulasRoxa);
    const sem = progressoSemana(e.aulas, hoje, perfil.metaSemanal);
    const mes = progressoMes(e.aulas, hoje, perfil.metaSemanal);
    const horas = horasTatame(e.aulas);
    const agora = minutosAgora();
    const turmas = turmasDoDia(e.grade, hoje);
    const semGB1 = semanaDoCiclo(hoje, e.ancoras, "GB1");
    let proxMarcada = false;

    const linhas = turmas.map(t => {
      const feito = e.aulas.find(a => a.turmaId === t.id && a.data === hoje);
      const passou = minutosDe(t.horario) + (Number(t.duracaoMin) || 60) < agora;
      const prev = aulaPrevista(hoje, t, e.ancoras);
      const cont = conteudoPrevisto(e.curriculo, prev);
      const mista = prev.programa === "GB1+GB2";
      const temaDe = p => { const c = conteudoPrevisto(e.curriculo, aulaPrevista(hoje, { ...t, programa: p }, e.ancoras)); return c ? temaCurto(c.tema) : "tema a registrar"; };
      let sub = mista ? `GB1: ${temaDe("GB1")} · GB2: ${temaDe("GB2")}` :
        prev.programa === "a definir" ? "GB1 ou GB2?" :
        cont ? temaCurto(cont.tema) : `Semana ${prev.semana ?? "?"} · tema a registrar`;
      const prog = mista ? "GB1 + GB2" : prev.programa === "a definir" ? "Turma" : prev.programa;
      const prof = t.professor ? ` · ${esc(t.professor)}` : "";
      let cls = "row", acao = "Check-in", destino = `#checkin/${t.id}/${hoje}`;
      if (feito) { cls += " feito"; acao = "Feito ✓"; destino = `#aula/${feito.id}`; }
      else if (passou) { cls += " past"; acao = "Check-in"; }
      else if (!proxMarcada) { cls += " next"; proxMarcada = true; }
      return `<a class="${cls}" href="${destino}" style="text-decoration:none;color:inherit">
        <span class="t">${esc(horaTexto(t.horario))}</span>
        <span class="d">${prog}${prof}<small>${esc(sub)}</small></span>
        <span class="go">${acao}</span></a>`;
    }).join("");

    el.innerHTML = `
      <div class="hrow">
        <div class="logo" role="img" aria-label="Gracie Barra"></div>
        <div class="who"><small>${saudacao()}</small><b>${esc(perfil.nome)}</b></div>
        <a href="#perfil" class="foto" id="foto" aria-label="Perfil"><span class="ini">${esc(iniciais(perfil.nome))}</span><i>📷</i></a>
      </div>
      <div class="beltwrap">${faixaSVG(graus)}<div class="lbl"><span>Faixa azul</span><span>${graus} de 4 graus</span></div></div>
      <div class="prog">
        <div class="ptop">
          <div class="ring">${anelSVG(roxa.fracao)}<b>${roxa.feitas}<small>de ${roxa.meta}</small></b></div>
          <div><h3>Aulas realizadas</h3>
            <div class="journey" aria-label="Da azul para a roxa"><span class="mb az"></span><span class="jt"><span style="width:${(roxa.fracao * 100).toFixed(1)}%"></span></span><span class="mb rx"></span></div></div>
        </div>
        <div class="stats">
          <div><b>${sem.feitas}/${sem.meta}</b><small>Semana</small></div>
          <div><b>${mes.feitas}/${mes.meta}</b><small>Mês</small></div>
          <div><b>${numero(horas)}h</b><small>Tatame</small></div>
        </div>
      </div>
      <div class="sec"><span>Grade de hoje · ${dataCurta(hoje)}</span>${semGB1 ? `<span style="color:var(--red)">Semana ${semGB1}</span>` : ""}</div>
      <div class="cls">${linhas || '<p class="vazio">Sem treino hoje. Bom descanso!</p>'}</div>
      <a class="link" href="#checkin/novo/${hoje}" style="text-align:center">+ Check-in de aula fora da grade</a>`;
    pintarFoto(e.uid, perfil.fotoPerfilId, el.querySelector("#foto"));
  }
};
