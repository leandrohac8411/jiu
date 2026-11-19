import { entrar, redefinirSenha } from "../firebase.js";
import { toast } from "../ui/util.js";

export default {
  menu: null,
  vivo: false,
  classe: "sem-menu login",
  montar(el) {
    el.innerHTML = `
      <div class="login-card">
      <div class="marca" role="img" aria-label="Gracie Barra"></div>
      <p>GB Sobradinho</p>
      <form id="f" class="field" style="gap:12px" novalidate>
        <div class="field"><label for="email">E-mail</label>
          <input class="input" id="email" type="email" autocomplete="username" inputmode="email" required></div>
        <div class="field"><label for="senha">Senha</label>
          <input class="input" id="senha" type="password" autocomplete="current-password" required></div>
        <p id="erro" class="aviso" hidden></p>
        <button class="btn" type="submit" id="entrar">Entrar</button>
      </form>
      <button class="link" id="esqueci" type="button">Esqueci minha senha</button>
      </div>
      <div class="faixas" role="img" aria-label="Faixas: branca, azul, roxa, marrom e preta">
        <i class="b"></i><i class="az"></i><i class="rx"></i><i class="mr"></i><i class="pt"></i>
      </div>`;
    const $ = id => el.querySelector("#" + id);
    $("f").addEventListener("submit", async e => {
      e.preventDefault();
      $("erro").hidden = true;
      $("entrar").disabled = true; $("entrar").textContent = "Entrando…";
      try {
        await entrar($("email").value, $("senha").value);
      } catch {
        $("erro").textContent = "E-mail ou senha incorretos.";
        $("erro").hidden = false;
        $("entrar").disabled = false; $("entrar").textContent = "Entrar";
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
