import { hojeISO } from "../logica/datas.js";
import { categoriaIdade, categoriaPeso } from "../logica/categorias.js";
import { CATEGORIAS } from "../logica/meujogo.js";
import { salvarPerfil, salvarFoto, excluirFoto, listarPesos, registrarPeso, importarCurriculo } from "../dados.js";
import { comprimirImagem } from "../foto.js";
import { sair } from "../firebase.js";
import { faixaSVG } from "../ui/faixa.js";
import { esc, iniciais, numero, dataLonga, abrirFolha, perguntar, toast, nomeMes } from "../ui/util.js";
import { pintarFoto } from "./comum.js";

let pesos = null, pesosDe = null; // cache da última leitura (por usuário)

export default {
  menu: "perfil",
  vivo: true,
  montar(el, params, ctx) {
    const e = ctx.estado, p = e.perfil, hoje = hojeISO();
    if (pesosDe !== e.uid) { pesos = null; pesosDe = e.uid; }
    if (pesos === null) listarPesos(e.uid).then(l => { pesos = l; this.montar(el, params, ctx); }).catch(() => { pesos = []; });
    const ultimo = pesos?.[0];
    const graus = p.graus?.length || 0;
    const ci = categoriaIdade(p.nascimento, hoje);
    const cp = ultimo ? categoriaPeso(ultimo.kg, p.sexo) : null;
    const [ay, am] = (p.faixa?.desde || "2026-11").split("-").map(Number);

    el.innerHTML = `
      <div class="pf">
        <div class="logo pf-logo" role="img" aria-label="GB Sobradinho"></div>
        <label class="foto" for="arqFoto" style="cursor:pointer" aria-label="Trocar foto de perfil"><span class="ini">${esc(iniciais(p.nome))}</span><i>📷</i></label>
        <input id="arqFoto" type="file" accept="image/*" hidden>
        <h3>${esc(p.nome)}</h3><small class="muted">GB Sobradinho</small>
      </div>
      <div class="beltwrap">${faixaSVG(graus)}<div class="lbl"><span>Faixa azul desde ${nomeMes(am).slice(0, 3)}/${ay}</span><span>${graus} de 4 graus</span></div></div>
      <button class="btn dark" id="grau" ${graus >= 4 ? "disabled" : ""}>${graus >= 4 ? "Faixa com 4 graus" : "Registrar grau"}</button>
      <div class="cats">
        <button class="cat" id="catIdade"><small>Categoria de idade</small><b>${ci ? ci.nome : "—"}</b><span>${ci ? `${ci.idadeNoAno} anos no ano` : p.nascimento ? "abaixo de 16 anos" : "Informe o nascimento"}</span></button>
        <button class="cat" id="catPeso"><small>Categoria de peso</small><b>${cp ? cp.nome : "—"}</b><span>${cp ? `${numero(ultimo.kg)} kg${cp.limite ? " · até " + numero(cp.limite) : ""}` : !p.sexo ? "Informe o sexo" : "Informe o peso"}</span></button>
      </div>
      <div class="card kv">
        <div><span>Peso</span><span class="step"><b>${ultimo ? numero(ultimo.kg) + " kg" : "—"}</b><button class="link" id="peso" style="width:auto;height:auto;background:none">Atualizar</button></span></div>
        <div><span>Meta por semana</span><span class="step"><button id="menos" aria-label="Diminuir">−</button><b>${p.metaSemanal}</b><button id="mais" aria-label="Aumentar">+</button></span></div>
        <button id="roxa"><span>Aulas até a roxa</span><b>${p.metaAulasRoxa} ›</b></button>
        <button id="dados"><span>Dados pessoais</span><b>›</b></button>
        <button id="curriculo"><span>Importar currículo</span><b>›</b></button>
      </div>
      <button class="btn sair" id="sair"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M21 12H10M17 8l4 4-4 4"/></svg><span>Sair da conta</span></button>`;

    pintarFoto(e.uid, p.fotoPerfilId, el.querySelector(".foto"));
    const $ = id => el.querySelector("#" + id);

    $("arqFoto").onchange = async ev => {
      const file = ev.target.files?.[0]; if (!file) return;
      try {
        const foto = await comprimirImagem(file, 400, 80_000);
        const id = await salvarFoto(e.uid, foto);
        const antiga = p.fotoPerfilId;
        await salvarPerfil(e.uid, { fotoPerfilId: id });
        if (antiga) excluirFoto(e.uid, antiga).catch(() => {});
        toast("Foto atualizada.");
      } catch { toast("Não consegui abrir esta foto. Tente outra."); }
    };

    $("grau").onclick = () => formulario(`Registrar ${graus + 1}º grau`, [
      { id: "data", rotulo: "Data", tipo: "date", valor: hoje },
      { id: "prof", rotulo: "Professor (opcional)", valor: "" }
    ], async v => {
      await salvarPerfil(e.uid, { graus: [...(p.graus || []), { numero: graus + 1, data: v.data || hoje, professor: v.prof.trim() }] });
      toast(`${graus + 1}º grau registrado. Parabéns!`);
    });

    const pedirPeso = () => formulario("Atualizar peso", [
      { id: "kg", rotulo: "Peso em kg", tipo: "number", valor: ultimo ? ultimo.kg : "", passo: "0.1" }
    ], async v => {
      const kg = Number(String(v.kg).replace(",", "."));
      if (!(kg > 20 && kg < 250)) { toast("Peso inválido."); return; }
      await registrarPeso(e.uid, { data: hoje, kg });
      pesos = null; this.montar(el, params, ctx);
      toast("Peso registrado.");
    });
    $("peso").onclick = pedirPeso;
    $("catPeso").onclick = () => (p.sexo ? pedirPeso() : abrirDados());
    $("catIdade").onclick = () => abrirDados();

    const mudarMeta = d => salvarPerfil(e.uid, { metaSemanal: Math.max(1, Math.min(7, p.metaSemanal + d)) });
    $("menos").onclick = () => mudarMeta(-1);
    $("mais").onclick = () => mudarMeta(1);
    $("roxa").onclick = () => formulario("Aulas até a roxa", [
      { id: "n", rotulo: "Meta de aulas na faixa azul", tipo: "number", valor: p.metaAulasRoxa, passo: "1" }
    ], async v => {
      const n = Math.round(Number(v.n));
      if (!(n >= 1 && n <= 2000)) { toast("Número inválido."); return; }
      await salvarPerfil(e.uid, { metaAulasRoxa: n });
    });

    const abrirDados = () => formulario("Dados pessoais", [
      { id: "nome", rotulo: "Nome", valor: p.nome },
      { id: "nasc", rotulo: "Nascimento", tipo: "date", valor: p.nascimento || "" },
      { id: "sexo", rotulo: "Sexo (para a categoria de peso)", tipo: "select", opcoes: [["", "—"], ["M", "Masculino"], ["F", "Feminino"]], valor: p.sexo || "" },
      { id: "tel", rotulo: "Telefone", tipo: "tel", valor: p.telefone || "" },
      { id: "email", rotulo: "E-mail", valor: e.email, somenteLeitura: true }
    ], async v => {
      await salvarPerfil(e.uid, { nome: v.nome.trim() || p.nome, nascimento: v.nasc || null, sexo: v.sexo || null, telefone: v.tel.trim() });
      toast("Dados salvos.");
    });
    $("dados").onclick = abrirDados;

    $("curriculo").onclick = () => importar();
    $("sair").onclick = async () => { if (await perguntar("Sair do app?", "", "Sair", "Cancelar")) sair(); };
  }
};

function formulario(titulo, campos, aoSalvar) {
  abrirFolha((folha, fechar) => {
    folha.innerHTML = `<h3>${esc(titulo)}</h3>` + campos.map(c => `<div class="field"><label for="f_${c.id}">${esc(c.rotulo)}</label>${
      c.tipo === "select" ? `<select class="input" id="f_${c.id}">${c.opcoes.map(([v, t]) => `<option value="${v}" ${v === c.valor ? "selected" : ""}>${t}</option>`).join("")}</select>`
      : `<input class="input" id="f_${c.id}" type="${c.tipo || "text"}" value="${esc(c.valor)}" ${c.passo ? `step="${c.passo}" inputmode="decimal"` : ""} ${c.somenteLeitura ? "readonly" : ""}>`}</div>`).join("") +
      `<div class="acoes"><button class="btn ghost" id="c">Cancelar</button><button class="btn" id="ok">Salvar</button></div>`;
    folha.querySelector("#c").onclick = fechar;
    folha.querySelector("#ok").onclick = async () => {
      const v = {}; campos.forEach(c => { v[c.id] = folha.querySelector("#f_" + c.id).value; });
      fechar(); await aoSalvar(v);
    };
  });
}

// Lê um curriculo.json do aparelho (o arquivo nunca vai para o site).
function importar() {
  abrirFolha((folha, fechar) => {
    folha.innerHTML = `<h3>Importar currículo</h3>
      <p class="muted" style="margin:0">Escolha o arquivo <b>curriculo.json</b> que está no seu computador (pasta tools/carga). As semanas do arquivo substituem as que já existem.</p>
      <input class="input" id="arq" type="file" accept="application/json,.json">
      <p class="aviso" id="err" hidden></p>
      <button class="btn ghost" id="c">Fechar</button>`;
    folha.querySelector("#c").onclick = fechar;
    folha.querySelector("#arq").onchange = async ev => {
      const err = folha.querySelector("#err");
      try {
        const lista = JSON.parse(await ev.target.files[0].text());
        const ok = Array.isArray(lista) && lista.length && lista.every(s =>
          (s.programa === "GB1" || s.programa === "GB2") && s.semana >= 1 && s.semana <= 16 &&
          [s.aulaA, s.aulaB].every(a => !a || (Array.isArray(a.tecnicas) && a.tecnicas.every(t => t.nome && CATEGORIAS.includes(t.categoria)))));
        if (!ok) throw new Error("formato");
        await importarCurriculo(lista);
        fechar(); toast(`${lista.length} semanas importadas.`);
      } catch { err.textContent = "Arquivo inválido. Use o curriculo.json gerado para o app."; err.hidden = false; }
    };
  });
}
