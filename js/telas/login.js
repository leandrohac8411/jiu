import { entrar, redefinirSenha } from "../firebase.js";
import { toast } from "../ui/util.js";

// iPhone/iPad: o botão vira "Entrar com Face ID" (a senha salva nas Chaves do iCloud é liberada pelo Face ID).
const ehIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const ic = {
  faceid: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M8.5 9v1.5M15.5 9v1.5M12 9v4.5h-1M9 16.5c1.8 1.4 4.2 1.4 6 0"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
  senha: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  olho: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  olhoFechado: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20L20 4"/></svg>',
  digital: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 4.8A8 8 0 0 1 20 11.5v1.5"/><path d="M4 9.5A8 8 0 0 1 5.6 6.4"/><path d="M4 13v-1.5"/><path d="M8 20.5c-1-1.6-1.5-3.4-1.5-5.5v-3.5a5.5 5.5 0 0 1 11 0V13"/><path d="M12 11.5V15c0 2.4.7 4.4 2 6"/><path d="M9.3 11.5a2.7 2.7 0 0 1 5.4 0V15c0 1.4.3 2.7.9 3.8"/><path d="M17.5 16.5c.1 1.3.4 2.4.9 3.4"/></svg>',
  entrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M3 12h11M10 8l4 4-4 4"/></svg>'
};

export default {
  menu: null,
  vivo: false,
  classe: "sem-menu login",
  montar(el) {
    el.innerHTML = `
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
        <div class="lg-ou"><span>OU</span></div>
        <button class="lg-bio" id="bio" type="button">${ehIOS ? ic.faceid : ic.digital}<span>${ehIOS ? "Entrar com Face ID" : "Acesso com biometria"}</span></button>
      </div>
      <div class="lg-arte" role="img" aria-label="Faixa azul amarrada sobre o kimono da Gracie Barra; faixas branca, azul, roxa, marrom e preta; disciplina, constância, evolução"></div>`;
    const $ = id => el.querySelector("#" + id);
    const btnTexto = t => { $("entrar").querySelector("span").textContent = t; };
    $("olho").onclick = () => {
      const ver = $("senha").type === "password";
      $("senha").type = ver ? "text" : "password";
      $("olho").innerHTML = ver ? ic.olhoFechado : ic.olho;
      $("olho").setAttribute("aria-label", ver ? "Esconder senha" : "Mostrar senha");
    };
    // "Biometria": usa a senha salva no celular (Chaves do iCloud / Gerenciador do Google),
    // que o próprio aparelho libera com Face ID ou digital.
    $("bio").onclick = async () => {
      if ("PasswordCredential" in window) {
        try {
          const c = await navigator.credentials.get({ password: true, mediation: "optional" });
          if (c?.password) { $("email").value = c.id; $("senha").value = c.password; $("f").requestSubmit(); return; }
        } catch { /* cai no plano B */ }
      }
      $("email").focus();
      toast(ehIOS
        ? "Escolha a senha salva em “Senhas”, acima do teclado. O iPhone confirma com o Face ID."
        : "Escolha a senha salva acima do teclado. O celular confirma com a digital.");
    };
    $("f").addEventListener("submit", async e => {
      e.preventDefault();
      $("erro").hidden = true;
      $("entrar").disabled = true; btnTexto("ENTRANDO…");
      try {
        await entrar($("email").value, $("senha").value);
        if ("PasswordCredential" in window) {
          try { await navigator.credentials.store(new PasswordCredential({ id: $("email").value.trim(), password: $("senha").value })); } catch { /* opcional */ }
        }
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
