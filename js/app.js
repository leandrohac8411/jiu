// Entrada do app: login, estado e navegação por hash (#rota/param1/param2).
import { configurado, aoMudarUsuario, sair } from "./firebase.js";
import { USERS } from "./firebase-config.js";
import { menuInferior } from "./ui/icones.js";
import { toast, esc } from "./ui/util.js";
import { hojeISO } from "./logica/datas.js";

const $tela = document.getElementById("tela");
const $menu = document.getElementById("menu");

// Cada tela é um módulo em js/telas/<nome>.js que exporta default:
//   { menu: "inicio" | null, vivo: boolean, montar(el, params, ctx) -> (limpar?) }
// "vivo" = redesenha quando os dados mudam (telas de formulário não redesenham).
const TELAS = ["login", "inicio", "checkin", "grade", "diario", "aula", "evolucao", "perfil"];
const cache = {};
async function carregarTela(nome) {
  if (!cache[nome]) cache[nome] = (await import(`./telas/${nome}.js`)).default;
  return cache[nome];
}

export const ctx = { usuario: null, estado: null };
let limparAtual = null;
let telaAtual = null;
let rotaAtual = "";

export function irPara(rota, ...params) {
  const hash = "#" + [rota, ...params.map(p => encodeURIComponent(p))].join("/");
  if (location.hash === hash) desenhar(); else location.hash = hash;
}

function lerRota() {
  const decodificar = p => { try { return decodeURIComponent(p); } catch { return ""; } }; // "#%E0" não derruba o app
  const [rota, ...params] = location.hash.replace(/^#/, "").split("/").map(decodificar);
  return { rota: TELAS.includes(rota) ? rota : "inicio", params };
}

export async function desenhar() {
  let { rota, params } = lerRota();
  if (!ctx.usuario) rota = "login";
  else if (rota === "login") rota = "inicio";
  if (rota !== "login" && ctx.estado?.erro) {
    $tela.className = "sem-menu"; $menu.hidden = true;
    $tela.innerHTML = `<p class="aviso">${esc(ctx.estado.erro)}</p><button class="btn ghost" id="recarregar">Tentar de novo</button>`;
    $tela.querySelector("#recarregar").onclick = () => location.reload();
    return;
  }
  if (rota !== "login" && !ctx.estado?.pronto) return; // espera os dados chegarem

  const tela = await carregarTela(rota);
  if (typeof limparAtual === "function") limparAtual();
  const mesmaRota = location.hash === rotaAtual;
  const rolagem = mesmaRota ? window.scrollY : 0;
  rotaAtual = location.hash; telaAtual = tela;

  $tela.className = tela.classe || (tela.menu ? "" : "sem-menu");
  $tela.innerHTML = "";
  limparAtual = await tela.montar($tela, params, ctx);
  $menu.hidden = !tela.menu;
  if (tela.menu) $menu.innerHTML = menuInferior(tela.menu);
  window.scrollTo(0, rolagem);
}

// Chamado pelo estado quando algum dado muda.
export function dadosMudaram() {
  if (telaAtual?.vivo) desenhar();
}

window.addEventListener("hashchange", desenhar);

// App instalado volta do segundo plano no dia seguinte: redesenha com a data nova.
let diaDoDesenho = hojeISO();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const hoje = hojeISO();
  if (hoje !== diaDoDesenho) { diaDoDesenho = hoje; if (telaAtual?.vivo) desenhar(); }
});

if (!configurado) {
  $tela.innerHTML = '<p class="aviso">Falta configurar o Firebase em js/firebase-config.js.</p>';
} else {
  aoMudarUsuario(async user => {
    if (user && !USERS[(user.email || "").toLowerCase()]) {
      await sair();
      toast("Esta conta não tem acesso.");
      return;
    }
    if (ctx.estado?.parar) ctx.estado.parar();
    ctx.usuario = user ? { uid: user.uid, email: user.email.toLowerCase(), nome: USERS[user.email.toLowerCase()] } : null;
    ctx.estado = null;
    if (user) {
      const { iniciarEstado } = await import("./estado.js");
      ctx.estado = iniciarEstado(ctx.usuario, () => { if (ctx.estado?.pronto) { if (!telaAtual || telaAtual === cache.login) desenhar(); else dadosMudaram(); } });
    }
    desenhar();
  });
}

if ("serviceWorker" in navigator && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
