// Guarda uma cópia do app no celular para abrir mais rápido e sem internet.
// Arquivos do app: rede primeiro (pega atualizações), cópia se estiver offline.
// Biblioteca do Firebase (versão fixa): cópia direto.
const CACHE = "diario-tatame-v14";
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const APP_FILES = [
  "./", "index.html", "css/app.css", "manifest.webmanifest",
  "js/app.js", "js/firebase.js", "js/firebase-config.js", "js/estado.js", "js/dados.js", "js/carga.js", "js/foto.js",
  "js/logica/datas.js", "js/logica/ciclo.js", "js/logica/categorias.js", "js/logica/metas.js", "js/logica/meujogo.js",
  "js/ui/util.js", "js/ui/icones.js", "js/ui/faixa.js", "js/ui/graficos.js",
  "js/telas/comum.js", "js/telas/login.js", "js/telas/inicio.js", "js/telas/checkin.js", "js/telas/grade.js",
  "js/telas/diario.js", "js/telas/aula.js", "js/telas/evolucao.js", "js/telas/perfil.js",
  "img/logo-gb.png", "img/logo-gb-mark.png", "img/gracie-barra.png", "img/icon-192.png", "img/login-fundo-preto.jpg"
];
const SDK_FILES = ["firebase-app.js", "firebase-auth.js", "firebase-firestore.js"].map(f => SDK + f);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll([...APP_FILES, ...SDK_FILES])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.href.startsWith(SDK)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  event.respondWith(fetch(req).then(res => {
    const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match("index.html"))));
});
