import { entrar, redefinirSenha } from "../firebase.js";
import { toast } from "../ui/util.js";
import { cantoSup, cantoInf, noFaixa } from "../ui/arteLogin.js";

const ic = {
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
  senha: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  olho: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  olhoFechado: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20L20 4"/></svg>',
  entrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M3 12h11M10 8l4 4-4 4"/></svg>'
};

export default {
  menu: null,
  vivo: false,
  classe: "sem-menu login",
  montar(el) {
    el.innerHTML = `
      ${cantoSup}${cantoInf}
      <div class="login-corpo">
        <div class="lg-topo">
          <div class="logo" role="img" aria-label="Gracie Barra"></div>
          <div class="lg-gb"><b>GRACIE BARRA</b><span>GB SOBRADINHO</span></div>
          <div class="lg-div"></div>
          <div class="lg-titulo">Diário de Tatame</div>
        </div>
        <div class="lg-linha"></div>
        <h1 class="lg-h">Acesse sua jornada no <em>tatame</em></h1>
        <form id="f" class="field" style="gap:12px" novalidate>
          <div class="campo">${ic.email}<input class="input" id="email" type="email" placeholder="E-mail" aria-label="E-mail" autocomplete="username" inputmode="email" required></div>
          <div class="campo">${ic.senha}<input class="input" id="senha" type="password" placeholder="Senha" aria-label="Senha" autocomplete="current-password" required>
            <button type="button" class="olho" id="olho" aria-label="Mostrar senha">${ic.olho}</button></div>
          <button class="lg-esqueci" id="esqueci" type="button">Esqueci minha senha</button>
          <p id="erro" class="aviso" hidden></p>
          <button class="btn entrar" type="submit" id="entrar">${ic.entrar}<span>ENTRAR</span></button>
        </form>
      </div>
      <div class="lg-arte">
        ${noFaixa}
        <div class="faixas" role="img" aria-label="Faixas: branca, azul, roxa, marrom e preta">
          <i class="b"></i><i class="az"></i><i class="rx"></i><i class="mr"></i><i class="pt"></i>
        </div>
        <div class="lg-lema">DISCIPLINA<i></i>CONSTÂNCIA<i></i>EVOLUÇÃO</div>
      </div>`;
    const $ = id => el.querySelector("#" + id);
    const btnTexto = t => { $("entrar").querySelector("span").textContent = t; };
    $("olho").onclick = () => {
      const ver = $("senha").type === "password";
      $("senha").type = ver ? "text" : "password";
      $("olho").innerHTML = ver ? ic.olhoFechado : ic.olho;
      $("olho").setAttribute("aria-label", ver ? "Esconder senha" : "Mostrar senha");
    };
    $("f").addEventListener("submit", async e => {
      e.preventDefault();
      $("erro").hidden = true;
      $("entrar").disabled = true; btnTexto("ENTRANDO…");
      try {
        await entrar($("email").value, $("senha").value);
      } catch {
        $("erro").textContent = "E-mail ou senha incorretos.";
        $("erro").hidden = false;
        $("entrar").disabled = false; btnTexto("ENTRAR");
      }
    });
    $("esqueci").onclick = async () => {
      const email = $("email").value.trim();
      if (!email) { $("erro").textContent = "Digite seu e-mail acima para receber o link."; $("erro").hidden = false; return; }
      try { await redefinirSenha(email); toast("Enviamos um link para o seu e-mail."); }
      catch { $("erro").textContent = "Não consegui enviar. Confira o e-mail."; $("erro").hidden = false; }
    };
  }
};
