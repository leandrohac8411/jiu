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
      <div class="lp-fundo" aria-hidden="true"></div>
      <div class="lp-conteudo">
        <header class="lp-marca">
          <div class="lp-linha-marca">
            <div class="lp-gb">
              <img class="lp-logo" src="img/logo-gracie-referencia.png" alt="Gracie Barra">
              <div class="lp-gb-texto"><strong>GRACIE BARRA</strong><span>GB SOBRADINHO</span></div>
            </div>
            <span class="lp-separador" aria-hidden="true"></span>
            <h1 class="lp-app">Diário de Tatame</h1>
          </div>
          <div class="lp-regua" aria-hidden="true"></div>
          <p class="lp-frase">Acesse sua jornada no <em>tatame</em></p>
        </header>
        <form id="f" class="lp-form" novalidate>
          <div class="lp-grupo"><label for="email">E-mail</label>
            <div class="lp-campo">${ic.email}<input id="email" type="email" placeholder="seu@email.com" autocomplete="username" inputmode="email" required></div></div>
          <div class="lp-grupo"><label for="senha">Senha</label>
            <div class="lp-campo">${ic.senha}<input id="senha" type="password" placeholder="Digite sua senha" autocomplete="current-password" required>
              <button type="button" class="lp-olho" id="olho" aria-label="Mostrar senha">${ic.olho}</button></div></div>
          <div class="lp-esqueci"><button type="button" id="esqueci">Esqueci minha senha</button></div>
          <button class="lp-entrar" type="submit" id="entrar">${ic.entrar}<span>ENTRAR</span></button>
        </form>
        <div class="lp-ou"><span>ou</span></div>
        <button class="lp-bio" id="bio" type="button">${ehIOS ? ic.faceid : ic.digital}<span>${ehIOS ? "Entrar com Face ID" : "Acesso com biometria"}</span></button>
        <p class="lp-aviso" id="erro" role="status" aria-live="polite"></p>
      </div>`;
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
      $("erro").textContent = "";
      $("entrar").disabled = true; btnTexto("ENTRANDO…");
      try {
        await entrar($("email").value, $("senha").value);
        if ("PasswordCredential" in window) {
          try { await navigator.credentials.store(new PasswordCredential({ id: $("email").value.trim(), password: $("senha").value })); } catch { /* opcional */ }
        }
      } catch {
        $("erro").textContent = "E-mail ou senha incorretos.";
       
        $("entrar").disabled = false; btnTexto("ENTRAR");
      }
    });
    $("esqueci").onclick = async () => {
      const email = $("email").value.trim();
      if (!email) { $("erro").textContent = "Digite seu e-mail acima para receber o link."; return; }
      try { await redefinirSenha(email); toast("Enviamos um link para o seu e-mail."); }
      catch { $("erro").textContent = "Não consegui enviar. Confira o e-mail."; }
    };
  }
};
