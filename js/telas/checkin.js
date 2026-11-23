// Check-in de uma aula: #checkin/<turmaId>/<data>, #checkin/novo/<data> ou #checkin/editar/<aulaId>.
// O check-in (aula nova) só vale no dia e a até 50 m da academia; editar depois pode, só aula com check-in.
import { hojeISO, dataValida } from "../logica/datas.js";
import { mesclarTecnicas } from "../logica/tecnicas.js";
import { aulaPrevista, sugerirFixarAula, CICLO_SEMANAS } from "../logica/ciclo.js";
import { CATEGORIAS } from "../logica/meujogo.js";
import { salvarAula, salvarFoto, excluirFoto, salvarCurriculo, salvarTurma } from "../dados.js";
import { comprimirImagem } from "../foto.js";
import { esc, temaCurto, posicaoDoTema, dataCurta, horaTexto, toast, abrirFolha, perguntar } from "../ui/util.js";
import { conteudoPrevisto, pintarFoto } from "./comum.js";
import { irPara } from "../app.js";
import { avaliarLocal, distanciaTexto, ACADEMIA } from "../logica/local.js";

// Pede a posição ao celular (o próprio sistema pergunta se pode usar a localização).
function pegarPosicao() {
  return new Promise((ok, falha) => {
    if (!navigator.geolocation) return falha({ code: 99 });
    navigator.geolocation.getCurrentPosition(
      p => ok({ lat: p.coords.latitude, lng: p.coords.longitude, precisao: p.coords.accuracy }),
      falha, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  });
}

const RES = [["nao", "Não saiu", "bad"], ["asvezes", "Às vezes", "mid"], ["bem", "Saiu bem", "good"]];

export default {
  menu: null,
  vivo: false,
  montar(el, params, { estado: e }) {
    const [modo, arg] = params;
    const editando = modo === "editar" ? e.aulas.find(a => a.id === arg) : null;
    if (modo === "editar" && !editando) { el.innerHTML = '<p class="vazio">Aula não encontrada.</p>'; return; }
    const hoje = hojeISO();
    // Regra: check-in só no dia da aula e na academia. Editar depois pode, mas só aula com check-in.
    const bloqueio = editando && editando.local?.verificado === false
      ? "Esta aula foi lançada sem check-in na academia, então não dá para editar."
      : !editando && dataValida(arg) && arg !== hoje
        ? "O check-in só vale no dia da aula, na academia. Não dá para lançar uma aula de outro dia." : "";
    if (bloqueio) {
      el.innerHTML = `<div class="ttl"><a class="back" href="#inicio" aria-label="Voltar">←</a>Check-in</div>
        <div class="local ruim"><span>📍 ${bloqueio}</span></div><a class="btn ghost" href="#inicio" style="text-decoration:none">Voltar ao início</a>`;
      return;
    }
    const turma = editando ? e.grade.find(t => t.id === editando.turmaId) || null
      : modo === "novo" ? null : e.grade.find(t => t.id === modo) || null;
    const data = editando ? editando.data : hoje;
    const programaFixo = !editando && modo !== "novo" && (turma?.programa === "GB1" || turma?.programa === "GB2");

    // ---------- estado do formulário ----------
    const f = editando ? {
      programa: editando.prevista?.programa || editando.realizada?.programa || "a definir",
      horario: editando.horario, professor: editando.professor || "",
      prevista: editando.prevista, sel: { ...editando.realizada },
      temaLivre: editando.realizada?.temaLivre || "",
      tecnicas: mesclarTecnicas(conteudoPrevisto(e.curriculo, editando.realizada)?.tecnicas || [], editando.tecnicas || []),
      dificuldade: editando.dificuldade, aprendi: editando.aprendi || "", revisar: editando.revisar || "",
      rolaSofri: [...(editando.rolaSofri || [])], duracaoMin: editando.duracaoMin || 60,
      fotoId: editando.fotoId || null, fotoNova: null
    } : {
      programa: turma?.programa || "a definir",
      horario: turma?.horario || "19:00", professor: turma?.professor || "",
      prevista: null, sel: null, temaLivre: "", tecnicas: [], dificuldade: null, aprendi: "", revisar: "",
      rolaSofri: [], duracaoMin: Number(turma?.duracaoMin) || 60, fotoId: null, fotoNova: null
    };

    const recalcularPrevista = () => {
      f.prevista = aulaPrevista(data, { programa: f.programa, aula: turma?.aula ?? null }, e.ancoras);
      f.sel = { programa: f.prevista.programa, semana: f.prevista.semana, aula: f.prevista.aula };
      f.temaLivre = "";
      carregarTecnicasDoCurriculo();
    };
    const carregarTecnicasDoCurriculo = () => {
      const c = conteudoPrevisto(e.curriculo, f.sel);
      // mantém as notas já dadas e as técnicas adicionadas à mão
      f.tecnicas = mesclarTecnicas(c?.tecnicas || [], f.tecnicas.filter(t => t.extra || t.resultado));
    };
    if (!editando && f.programa !== "a definir") recalcularPrevista();

    // ---------- localização: o check-in de hoje só vale na academia ----------
    const loc = { estado: "parado" };
    const precisaLocal = () => !editando;
    async function verificarLocal() {
      loc.estado = "buscando"; if (el.isConnected && el.querySelector("#salvar")) { guardarTextos(); desenhar(); }
      try {
        Object.assign(loc, avaliarLocal(await pegarPosicao()));
        loc.estado = loc.ok ? "ok" : "longe";
      } catch (err) {
        loc.estado = "erro";
        loc.motivo = err?.code === 1 ? "negado" : err?.code === 3 ? "tempo" : "sem";
      }
      if (el.isConnected) { guardarTextos(); desenhar(); }
    }
    const avisoLocal = () => {
      if (editando) return "";
      const tentar = '<button type="button" class="local-tentar" id="localTentar">Tentar de novo</button>';
      if (loc.estado === "ok") return `<div class="local ok"><span>📍 Você está na academia <small>(${distanciaTexto(loc.distancia)})</small></span></div>`;
      if (loc.estado === "longe") return `<div class="local ruim"><span>📍 Você está a <b>${distanciaTexto(loc.distancia)}</b> da academia. O check-in só vale a até ${ACADEMIA.raio} m da ${ACADEMIA.nome}.</span>${tentar}</div>`;
      if (loc.estado === "erro") return `<div class="local ruim"><span>📍 ${loc.motivo === "negado"
        ? "Libere a localização para fazer o check-in: Ajustes › Privacidade › Serviços de Localização › Sites do Safari › Perguntar ou Permitir."
        : loc.motivo === "tempo" ? "O GPS demorou para responder. Vá para um lugar aberto ou perto da porta."
        : "Este aparelho não informou a localização."}</span>${tentar}</div>`;
      return `<div class="local buscando"><span>📍 Conferindo se você está na academia…</span></div>`;
    };

    // ---------- desenho ----------
    function desenhar() {
      const definido = f.programa === "GB1" || f.programa === "GB2";
      const cont = definido ? conteudoPrevisto(e.curriculo, f.sel) : null;
      const igual = f.sel && f.prevista && !f.temaLivre && f.sel.semana === f.prevista.semana && f.sel.aula === f.prevista.aula;
      const titulo = f.temaLivre ? esc(f.temaLivre)
        : cont ? `Semana ${f.sel.semana}: ${esc(temaCurto(cont.tema))}`
        : definido ? `Semana ${f.sel?.semana ?? "?"} · tema a registrar` : "";
      const sub = cont && !f.temaLivre ? esc(posicaoDoTema(cont.tema)) : "";

      el.innerHTML = `
        <div class="ttl"><a class="back" href="#inicio" aria-label="Voltar">←</a>${editando ? "Editar aula" : "Check-in"}</div>
        ${avisoLocal()}
        <div class="plan">
          <div class="k">${dataCurta(data) + " · "}${modo === "novo" ? `<input id="hora" type="time" value="${esc(f.horario)}" aria-label="Horário" style="background:transparent;border:0;color:#fff;font:inherit;width:72px;color-scheme:dark">` : horaTexto(esc(f.horario))}${f.professor ? " · " + esc(f.professor) : ""}</div>
          ${!programaFixo ? `
            <p style="margin:8px 0 4px">${turma?.programa === "GB1+GB2" ? "Turma GB1 + GB2: qual currículo foi dado?" : "Qual programa?"}</p>
            <div class="yn">${["GB1", "GB2"].map(p => {
              const prev = aulaPrevista(data, { programa: p, aula: turma?.aula ?? null }, e.ancoras);
              const c = conteudoPrevisto(e.curriculo, prev);
              const dica = prev.semana ? `Sem. ${prev.semana}${c ? " · " + esc(temaCurto(c.tema)) : ""}` : "";
              return `<button data-prog="${p}" class="${f.programa === p ? "on" : ""}">${p}${dica ? `<small style="display:block;font-weight:600;font-size:10.5px;opacity:.8;margin-top:2px">${dica}</small>` : ""}</button>`;
            }).join("")}</div>` : ""}
          ${definido ? `
            <h4>${titulo}</h4>
            ${sub ? `<p>${sub}</p>` : ""}
            ${!f.temaLivre ? `<p style="margin-top:8px">${f.programa} · Aula <span class="ab">${["A", "B"].map(x => `<button data-ab="${x}" class="${f.sel?.aula === x ? "on" : ""}">${x}</button>`).join("")}</span>${!f.sel?.aula ? " <small>(escolha A ou B)</small>" : ""}</p>` : ""}
            <div class="yn"><button id="essa" class="${igual ? "on" : ""}">✓ Foi essa aula</button><button id="outra" class="${!igual ? "on" : ""}">Foi outra</button></div>` : ""}
        </div>

        ${definido ? `
        <div>
          <div class="k">Como saiu cada técnica</div>
          <div class="tech">
            ${f.tecnicas.map((t, i) => `<div class="tr"><div><b>${esc(t.nome)}</b><small>${esc(t.categoria)}</small></div>
              <div class="seg" role="group" aria-label="${esc(t.nome)}">${RES.map(([v, txt, cor]) =>
                `<button data-t="${i}" data-r="${v}" class="${t.resultado === v ? "on " + cor : ""}">${txt}</button>`).join("")}</div></div>`).join("")}
            <button class="chip add" id="addTec" style="align-self:flex-start">+ adicionar técnica</button>
          </div>
        </div>` : ""}

        <div>
          <div class="k">Dificuldade da aula</div>
          <div class="diff">${[1, 2, 3, 4, 5].map(n => `<button data-d="${n}" class="${f.dificuldade === n ? "on" : ""}">${n}</button>`).join("")}</div>
          <div class="diffl"><span>tranquila</span><span>muito difícil</span></div>
        </div>
        <div class="field"><label for="aprendi">O que aprendi</label><textarea class="input" maxlength="4000" id="aprendi" rows="3">${esc(f.aprendi)}</textarea></div>
        <div class="field"><label for="revisar">O que revisar</label><textarea class="input" maxlength="4000" id="revisar" rows="2">${esc(f.revisar)}</textarea></div>
        <div>
          <div class="k">No rola, onde sofri?</div>
          <div class="chips" style="margin-top:6px">${CATEGORIAS.map(c => `<button class="chip ${f.rolaSofri.includes(c) ? "on" : ""}" data-rola="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        </div>
        <div class="field"><label for="dur">Duração (min)</label><input class="input" id="dur" type="number" min="10" max="240" step="5" value="${f.duracaoMin}"></div>
        <label class="ph2" for="arquivo" style="cursor:pointer">
          <div class="img" id="prev">＋</div>
          <div><div class="k">Foto do dia</div><small class="muted">${f.fotoNova || f.fotoId ? "Toque para trocar" : "Toque para escolher (opcional)"}</small></div>
        </label>
        <input id="arquivo" type="file" accept="image/*" hidden>
        <p id="erro" class="aviso" hidden></p>
        <button class="btn" id="salvar">Salvar aula</button>`;

      ligar();
      const prev = el.querySelector("#prev");
      if (f.fotoNova) { prev.style.backgroundImage = `url(${f.fotoNova.dados})`; prev.textContent = ""; }
      else pintarFoto(e.uid, f.fotoId, prev);
    }

    const guardarTextos = () => {
      f.aprendi = el.querySelector("#aprendi")?.value ?? f.aprendi;
      f.revisar = el.querySelector("#revisar")?.value ?? f.revisar;
      f.duracaoMin = Number(el.querySelector("#dur")?.value) || f.duracaoMin;
      const h = el.querySelector("#hora"); if (h) f.horario = h.value || f.horario;
    };
    const redesenhar = () => { guardarTextos(); desenhar(); };

    function ligar() {
      el.querySelectorAll("[data-prog]").forEach(b => b.onclick = () => { f.programa = b.dataset.prog; recalcularPrevista(); redesenhar(); });
      el.querySelectorAll("[data-ab]").forEach(b => b.onclick = () => { f.sel.aula = b.dataset.ab; carregarTecnicasDoCurriculo(); redesenhar(); });
      const essa = el.querySelector("#essa");
      if (essa) essa.onclick = () => { f.sel = { ...f.prevista }; f.temaLivre = ""; carregarTecnicasDoCurriculo(); redesenhar(); };
      const outra = el.querySelector("#outra");
      if (outra) outra.onclick = () => escolherOutra();
      el.querySelectorAll("[data-t]").forEach(b => b.onclick = () => {
        const t = f.tecnicas[+b.dataset.t];
        t.resultado = t.resultado === b.dataset.r ? null : b.dataset.r;
        redesenhar();
      });
      const add = el.querySelector("#addTec"); if (add) add.onclick = () => adicionarTecnica();
      el.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { f.dificuldade = +b.dataset.d; redesenhar(); });
      el.querySelectorAll("[data-rola]").forEach(b => b.onclick = () => {
        const c = b.dataset.rola;
        f.rolaSofri = f.rolaSofri.includes(c) ? f.rolaSofri.filter(x => x !== c) : [...f.rolaSofri, c];
        redesenhar();
      });
      el.querySelector("#arquivo").onchange = async ev => {
        const file = ev.target.files?.[0];
        if (!file) return;
        guardarTextos();
        try {
          f.fotoNova = await comprimirImagem(file, 1000, 250_000);
          f.fotoNova.mini = (await comprimirImagem(file, 160, 12_000)).dados; // miniatura do Diário
        }
        catch { toast("Não consegui abrir esta foto. Tente outra."); }
        desenhar();
      };
      el.querySelector("#salvar").onclick = salvar;
      const tentar = el.querySelector("#localTentar"); if (tentar) tentar.onclick = () => verificarLocal();
    }

    function escolherOutra() {
      guardarTextos();
      abrirFolha((folha, fechar) => {
        folha.innerHTML = `<h3>Qual foi a aula?</h3>
          <div class="field"><label for="sSem">Semana do ciclo ${esc(f.programa)}</label>
            <select class="input" id="sSem">${Array.from({ length: CICLO_SEMANAS }, (_, i) => i + 1).map(n =>
              `<option value="${n}" ${f.sel?.semana === n ? "selected" : ""}>Semana ${n}${conteudoPrevisto(e.curriculo, { programa: f.programa, semana: n, aula: "A" }) ? "" : " (sem conteúdo)"}</option>`).join("")}</select></div>
          <div class="field"><label>Aula</label><div class="chips">${["A", "B"].map(x => `<button class="chip ${f.sel?.aula === x ? "on" : ""}" data-x="${x}">Aula ${x}</button>`).join("")}</div></div>
          <div class="field"><label for="sLivre">Ou escreva o tema (aula fora do currículo)</label><input class="input" maxlength="120" id="sLivre" value="${esc(f.temaLivre)}" placeholder="Ex.: drills de passagem"></div>
          <div class="acoes"><button class="btn ghost" id="cancelar">Cancelar</button><button class="btn" id="ok">Usar esta</button></div>`;
        let aula = f.sel?.aula || "A";
        folha.querySelectorAll("[data-x]").forEach(b => b.onclick = () => {
          aula = b.dataset.x;
          folha.querySelectorAll("[data-x]").forEach(o => o.classList.toggle("on", o === b));
        });
        folha.querySelector("#cancelar").onclick = fechar;
        folha.querySelector("#ok").onclick = () => {
          const livre = folha.querySelector("#sLivre").value.trim();
          f.temaLivre = livre;
          f.sel = { programa: f.programa, semana: Number(folha.querySelector("#sSem").value), aula };
          if (!livre) carregarTecnicasDoCurriculo(); else f.tecnicas = f.tecnicas.filter(t => t.extra);
          fechar(); desenhar();
        };
      });
    }

    function adicionarTecnica() {
      guardarTextos();
      abrirFolha((folha, fechar) => {
        let cat = null;
        folha.innerHTML = `<h3>Adicionar técnica</h3>
          <div class="field"><label for="tNome">Nome</label><input class="input" maxlength="150" id="tNome" placeholder="Ex.: Raspagem de gancho"></div>
          <div class="field"><label>Posição</label><div class="chips">${CATEGORIAS.map(c => `<button class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>
          <p class="aviso" id="tErro" hidden>Escreva o nome e escolha a posição.</p>
          <div class="acoes"><button class="btn ghost" id="cancelar">Cancelar</button><button class="btn" id="ok">Adicionar</button></div>`;
        folha.querySelectorAll("[data-c]").forEach(b => b.onclick = () => {
          cat = b.dataset.c; folha.querySelectorAll("[data-c]").forEach(o => o.classList.toggle("on", o === b));
        });
        folha.querySelector("#cancelar").onclick = fechar;
        folha.querySelector("#ok").onclick = () => {
          const nome = folha.querySelector("#tNome").value.trim();
          if (!nome || !cat) { folha.querySelector("#tErro").hidden = false; return; }
          f.tecnicas.push({ nome, categoria: cat, resultado: null, extra: true });
          fechar(); desenhar();
        };
        setTimeout(() => folha.querySelector("#tNome").focus(), 50);
      });
    }

    async function salvar() {
      guardarTextos();
      const erro = el.querySelector("#erro");
      const definido = f.programa === "GB1" || f.programa === "GB2";
      const falta = !definido ? "Escolha GB1 ou GB2." : !f.temaLivre && !f.sel?.aula ? "Escolha a aula A ou B." : !f.dificuldade ? "Escolha a dificuldade da aula." : "";
      const semLocal = precisaLocal() && loc.estado !== "ok"
        ? (loc.estado === "buscando" ? "Espere: ainda estou conferindo se você está na academia." : `O check-in de hoje só vale na academia (até ${ACADEMIA.raio} m).`) : "";
      if (falta || semLocal) {
        erro.textContent = falta || semLocal; erro.hidden = false; erro.scrollIntoView({ block: "center" });
        return;
      }
      const btn = el.querySelector("#salvar");
      btn.disabled = true; btn.textContent = "Salvando…";
      try {
        let fotoId = f.fotoId, fotoMini = editando?.fotoMini ?? null;
        if (f.fotoNova) {
          fotoId = await salvarFoto(e.uid, { aulaId: editando?.id || null, dados: f.fotoNova.dados, largura: f.fotoNova.largura, altura: f.fotoNova.altura });
          fotoMini = f.fotoNova.mini || null;
        }
        const prevista = f.prevista || { programa: f.programa, semana: f.sel?.semana ?? null, aula: f.sel?.aula ?? null };
        const realizada = { programa: f.programa, semana: f.sel?.semana ?? null, aula: f.temaLivre ? null : f.sel?.aula ?? null, ...(f.temaLivre ? { temaLivre: f.temaLivre } : {}) };
        const aula = {
          ...(editando ? { id: editando.id, ...(editando.criadoEm ? { criadoEm: editando.criadoEm } : {}) } : {}),
          data, horario: f.horario, professor: f.professor, duracaoMin: f.duracaoMin,
          turmaId: turma?.id || null,
          prevista, foiPrevista: !f.temaLivre && realizada.semana === prevista.semana && realizada.aula === prevista.aula,
          realizada,
          tecnicas: f.tecnicas.filter(t => t.resultado).map(({ nome, categoria, resultado }) => ({ nome, categoria, resultado })),
          dificuldade: f.dificuldade, aprendi: f.aprendi.trim(), revisar: f.revisar.trim(),
          rolaSofri: f.rolaSofri, fotoId, fotoMini,
          // Onde foi feito o check-in: confirmado na academia, ou lançado depois (sem local).
          ...(editando ? (editando.local ? { local: editando.local } : {})
            : { local: { verificado: true, distancia: loc.distancia, precisao: loc.precisao } })
        };
        const id = await salvarAula(e.uid, aula);
        // a foto antiga só sai depois que a aula já aponta para a nova
        if (f.fotoNova && f.fotoId) excluirFoto(e.uid, f.fotoId).catch(() => {});

        // Currículo vazio (GB2 no começo): o que foi registrado vira o currículo daquela semana.
        const novas = f.tecnicas.filter(t => t.extra).map(({ nome, categoria }) => ({ nome, categoria }));
        if (!f.temaLivre && realizada.semana && realizada.aula && !conteudoPrevisto(e.curriculo, realizada) && novas.length) {
          const ok = await perguntar(`Salvar como currículo da semana ${realizada.semana} (aula ${realizada.aula})?`,
            `Assim, na próxima volta do ciclo ${f.programa}, essa aula já aparece preenchida.`, "Salvar no currículo");
          if (ok) {
            const tema = await pedirTema(novas);
            if (tema !== null) await salvarCurriculo(f.programa, realizada.semana, realizada.aula, { tema, tecnicas: novas });
          }
        }
        // Aprende a aula A/B da turma depois de duas correções iguais.
        if (turma && !editando) {
          const daTurma = [{ ...aula, id }, ...e.aulas.filter(a => a.turmaId === turma.id && a.id !== id)
            .sort((a, b) => b.data.localeCompare(a.data))];
          const letra = sugerirFixarAula(daTurma, turma);
          if (letra && await perguntar(`Usar sempre aula ${letra} nesta turma?`, `${horaTexto(turma.horario)} — você corrigiu para ${letra} nas duas últimas vezes.`)) {
            await salvarTurma({ ...turma, aula: letra });
          }
        }
        toast(editando ? "Aula atualizada." : "Aula salva!");
        irPara(editando ? "aula" : "inicio", ...(editando ? [editando.id] : []));
      } catch (err) {
        console.error(err);
        btn.disabled = false; btn.textContent = "Salvar aula";
        erro.textContent = "Não consegui salvar. Confira a internet e tente de novo."; erro.hidden = false;
      }
    }

    function pedirTema(tecnicas) {
      return new Promise(resolve => abrirFolha((folha, fechar) => {
        folha.innerHTML = `<h3>Tema da aula</h3>
          <div class="field"><label for="tema">Como chamar esta aula?</label><input class="input" maxlength="150" id="tema" value="${esc(tecnicas.map(t => t.nome).join(" e "))}"></div>
          <button class="btn" id="ok">Salvar</button>`;
        folha.querySelector("#ok").onclick = () => { const v = folha.querySelector("#tema").value.trim(); fechar(); resolve(v); };
      }, () => resolve(null)));
    }

    desenhar();
    if (!editando) verificarLocal();
  }
};
