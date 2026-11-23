import { ordenarAulas, paraRevisar } from "../logica/metas.js";
import { salvarFoto, salvarAula } from "../dados.js";
import { comprimirImagem } from "../foto.js";
import { esc, dataCurta, mesAno, toast } from "../ui/util.js";
import { pintarFoto } from "./comum.js";

const FILTROS = [["todas", "Todas"], ["dificeis", "Mais difíceis"], ["foto", "Com foto"], ["GB1", "GB1"], ["GB2", "GB2"]];
let filtro = "todas";

export const tituloAula = a => a.realizada?.temaLivre ||
  (a.tecnicas?.length ? a.tecnicas.slice(0, 2).map(t => t.nome).join(" · ") : `Semana ${a.realizada?.semana ?? "?"} · aula ${a.realizada?.aula ?? "?"}`);

export default {
  menu: "diario",
  vivo: true,
  montar(el, _p, { estado: e }) {
    const todas = ordenarAulas(e.aulas).reverse();
    const lista = todas.filter(a =>
      filtro === "todas" ? true : filtro === "dificeis" ? a.dificuldade >= 4 : filtro === "foto" ? !!a.fotoId : a.realizada?.programa === filtro);
    const revisar = paraRevisar(e.aulas);
    let mesAtual = "";
    const itens = lista.map(a => {
      const m = mesAno(a.data);
      const cab = m !== mesAtual ? `<div class="month">${m}</div>` : "";
      mesAtual = m;
      return `${cab}<div class="entry">
        <label class="img" data-foto="${a.fotoId || ""}" data-aula="${a.id}" ${a.fotoMini ? `style="background-image:url(${a.fotoMini})"` : ""} ${a.fotoId ? "" : 'title="Adicionar foto"'}>${a.fotoId ? "" : "＋"}
          ${a.fotoId ? "" : `<input type="file" accept="image/*" hidden data-up="${a.id}">`}</label>
        <a href="#aula/${a.id}" style="color:inherit;text-decoration:none;min-width:0">
          <small>${dataCurta(a.data)} · ${esc(a.realizada?.programa || "")}${a.realizada?.semana ? " · Semana " + a.realizada.semana : ""}</small>
          <h5>${esc(tituloAula(a))}</h5>
          <div class="dots" aria-label="Dificuldade ${a.dificuldade} de 5">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= a.dificuldade ? "f" : ""}"></i>`).join("")}</div>
        </a></div>`;
    }).join("");

    el.innerHTML = `
      <div class="ttl ttl-alto">Diário</div>
      <div class="chips">${FILTROS.map(([v, t]) => `<button class="chip ${filtro === v ? "on" : ""}" data-f="${v}">${t}</button>`).join("")}</div>
      ${revisar.length ? `<div class="review"><div class="k" style="color:var(--red)">Para revisar</div>
        <h4>${revisar.length} ${revisar.length === 1 ? "técnica" : "técnicas"} para treinar de novo</h4>
        <div class="chips">${revisar.map(n => `<span class="chip">${esc(n)}</span>`).join("")}</div></div>` : ""}
      ${itens || `<p class="vazio">${e.aulas.length ? "Nenhuma aula com este filtro." : "Nenhuma aula ainda. Faça o primeiro check-in pela tela Início."}</p>`}`;

    el.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { filtro = b.dataset.f; this.montar(el, _p, { estado: e }); });
    // Miniatura guardada na aula; aulas antigas sem miniatura carregam a foto só quando aparecem na tela.
    const obs = "IntersectionObserver" in window ? new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) { obs.unobserve(en.target); pintarFoto(e.uid, en.target.dataset.foto, en.target); }
    }), { rootMargin: "200px" }) : null;
    el.querySelectorAll("[data-foto]").forEach(div => {
      if (!div.dataset.foto) return;
      div.onclick = () => { location.hash = "#aula/" + div.dataset.aula; };
      if (!div.style.backgroundImage) obs ? obs.observe(div) : pintarFoto(e.uid, div.dataset.foto, div);
    });
    el.querySelectorAll("[data-up]").forEach(inp => inp.onchange = async ev => {
      const file = ev.target.files?.[0]; if (!file) return;
      const aula = e.aulas.find(a => a.id === inp.dataset.up);
      if (!aula || aula.local?.verificado === false) { toast("Só dá para pôr foto em aula com check-in."); return; }
      try {
        const foto = await comprimirImagem(file, 1000, 250_000);
        const fotoMini = (await comprimirImagem(file, 160, 12_000)).dados;
        const fotoId = await salvarFoto(e.uid, { aulaId: aula.id, ...foto });
        await salvarAula(e.uid, { ...aula, fotoId, fotoMini });
        toast("Foto adicionada.");
      } catch { toast("Não consegui abrir esta foto. Tente outra."); }
    });
  }
};
