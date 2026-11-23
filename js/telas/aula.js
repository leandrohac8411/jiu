import { numeroDaAula } from "../logica/metas.js";
import { excluirAula, excluirFoto, lerFoto } from "../dados.js";
import { esc, dataLonga, horaTexto, perguntar, toast } from "../ui/util.js";
import { pintarFoto } from "./comum.js";
import { tituloAula } from "./diario.js";
import { irPara } from "../app.js";
import { distanciaTexto } from "../logica/local.js";

const COR = { nao: "#c8201b", asvezes: "#d98a16", bem: "#1f8a5b" };
const TXT = { nao: "não saiu", asvezes: "às vezes", bem: "saiu bem" };

export default {
  menu: null,
  vivo: true,
  classe: "sem-padding",
  montar(el, [id], { estado: e }) {
    const a = e.aulas.find(x => x.id === id);
    if (!a) { el.innerHTML = '<p class="vazio">Aula não encontrada. <a class="link" href="#diario">Voltar ao diário</a></p>'; return; }
    const r = a.realizada || {};
    el.innerHTML = `
      <div class="hero-ph" id="hero">
        <div class="ph-top"><a class="back" href="#diario" aria-label="Voltar">←</a></div>
        <div class="ph-cap"><small>${dataLonga(a.data)} · ${horaTexto(a.horario)} · ${esc(r.programa || "")}</small>
          <b>${r.semana ? `Semana ${r.semana} · ` : ""}${esc(tituloAula(a))}</b></div>
      </div>
      <div class="aula-corpo">
        ${a.local ? `<div class="local ${a.local.verificado ? "ok" : "neutro"}"><span>📍 ${a.local.verificado ? `Check-in feito na academia <small>(${distanciaTexto(a.local.distancia ?? 0)})</small>` : "Lançada depois, sem local"}</span></div>` : ""}
        ${a.tecnicas?.length ? `<div class="chips">${a.tecnicas.map(t => `<span class="chip" style="background:${COR[t.resultado]};color:#fff" title="${TXT[t.resultado]}">${esc(t.nome)}</span>`).join("")}</div>` : ""}
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div><div class="k">Dificuldade</div><div class="dots" style="margin-top:6px">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= a.dificuldade ? "f" : ""}"></i>`).join("")}</div></div>
          <div style="text-align:right"><div class="k">Aula nº</div><b style="font-size:18px">${numeroDaAula(e.aulas, a.id)}</b></div>
        </div>
        ${a.aprendi ? `<div class="card"><div class="k">O que aprendi</div><div class="txt">${esc(a.aprendi)}</div></div>` : ""}
        ${a.revisar ? `<div class="card"><div class="k" style="color:var(--red)">Revisar</div><div class="txt">${esc(a.revisar)}</div></div>` : ""}
        ${a.rolaSofri?.length ? `<div class="card"><div class="k">No rola, sofri em</div><div class="txt">${a.rolaSofri.map(esc).join(", ")}</div></div>` : ""}
        ${a.local?.verificado === false ? "" : `<a class="btn ghost" href="#checkin/editar/${a.id}" style="text-decoration:none">Editar aula</a>`}
        <button class="out" id="del">Excluir aula</button>
      </div>`;
    const hero = el.querySelector("#hero");
    if (a.fotoId) {
      pintarFoto(e.uid, a.fotoId, hero);
      hero.style.cursor = "zoom-in";
      hero.onclick = async ev => {
        if (ev.target.closest(".back")) return;
        const dados = await lerFoto(e.uid, a.fotoId);
        if (!dados) return;
        const tela = document.createElement("div");
        tela.className = "tela-cheia";
        tela.innerHTML = `<img src="${dados}" alt="Foto da aula de ${dataLonga(a.data)}"><button class="back" aria-label="Fechar">✕</button>`;
        tela.querySelector("button").onclick = () => tela.remove();
        document.body.appendChild(tela);
      };
    } else {
      hero.style.background = "linear-gradient(135deg,#2c2c33,#5b5257)";
    }
    el.querySelector("#del").onclick = async () => {
      if (!await perguntar("Excluir esta aula?", "A foto e as anotações somem e a contagem de aulas é refeita. Não dá para desfazer.", "Excluir", "Cancelar")) return;
      await excluirAula(e.uid, a.id);
      if (a.fotoId) excluirFoto(e.uid, a.fotoId).catch(() => {});
      toast("Aula excluída.");
      irPara("diario");
    };
  }
};
