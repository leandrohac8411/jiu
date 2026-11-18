# Diário de Tatame — plano de construção

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** construir o PWA privado em que Leandro e Stephany registram as aulas de jiu-jítsu na GB Sobradinho: check-in com a aula prevista do ciclo GB, foto, técnicas, evolução até a roxa e o perfil técnico "Meu jogo".

**Arquitetura:** site estático em HTML/CSS/JS puros (módulos ES), sem build, servido pela Vercel. Firebase Auth (e-mail e senha) e Firestore (dados e fotos em base64), com o SDK carregado da gstatic, versão fixa 10.12.2, como no app Compras. A lógica pura (ciclo, categorias, metas, Meu jogo) fica em `js/logica/`, sem nenhuma dependência do navegador, e é testada com `node --test`. As telas ficam em `js/telas/`, uma por arquivo, trocadas por hash (`#inicio`, `#checkin`…).

**Tecnologias:** JavaScript ES2022, Firebase JS SDK 10.12.2 (CDN), `node:test` (Node 24, sem dependências) e `firebase-admin` apenas no script de carga local.

**Documento do projeto:** `docs/superpowers/specs/2026-11-18-diario-tatame-design.md`. **Mockup aprovado:** `mockup/index.html`, que é a referência visual de cada tela (CSS, SVG da faixa, ícones do menu, anel, meia-lua, radar).

## Restrições globais

- Repositório GitHub **privado**. `tools/carga/curriculo.json`, `tools/carga/service-account.json` e `node_modules/` ficam no `.gitignore`.
- Sem cadastro aberto. Só os e-mails de `USERS` em `js/firebase-config.js` entram: `leandrohacarvalho@gmail.com` → "Leandro" e `strandrade@gmail.com` → "Stephany" (os mesmos do app Compras). As mesmas duas contas aparecem em `firestore.rules`.
- Cores: fundo `#faf9f8`, texto `#151517`, vermelho GB `#c8201b`, azul da faixa `#2449c9`, roxo `#6b2fa8`, verde "saiu bem" `#1f8a5b`, laranja "às vezes" `#d98a16`. Fontes: Sora (interface) e Manrope (apoio), pelo Google Fonts.
- Logo: `img/logo-gb.png` no Login, `img/logo-gb-mark.png` no Início e como ícone do PWA, `img/gracie-barra.png` à direita do título das demais telas e no topo do Perfil (só a escrita).
- Toda a interface é em português do Brasil. Datas aparecem como `dd/mm/aaaa` ou `Qua 18/11`.
- Âncoras iniciais: GB1 e GB2 com `{ data: "2026-11-16", semana: 12 }`. O ciclo tem 16 semanas.
- Metas padrão: 2 aulas por semana e 175 aulas até a roxa. Duração padrão de turma: 60 min.
- Fotos: **uma por aula**, JPEG com lado maior de até 1000 px e no máximo 250 KB, num documento próprio em `usuarios/{uid}/fotos/{id}`. Foto de perfil: lado maior de 400 px.
- Datas sempre como string local `YYYY-MM-DD`, nunca `Date` em UTC, para a aula das 23h não cair no dia seguinte.

## Foco da revisão

1. **Turma "a definir" ou currículo vazio (GB2):** o check-in pergunta GB1/GB2, mostra "Semana N · tema a registrar", salva normalmente e oferece "salvar como currículo da semana N?". Testes nas Tarefas 2 e 8.
2. **Virada de semana e fuso:** domingo 22/11/2026 ainda é a semana 12 e segunda 23/11 já é a 13. Uma aula às 23h50 conta no dia certo. Testes na Tarefa 2.
3. **Excluir ou editar uma aula:** o número da aula, a contagem para a roxa e as metas são recalculados a partir da lista, nunca guardados. Testes na Tarefa 4.
4. **Usuário sem nenhuma aula, ou meta 0:** nada mostra `NaN`, e o Meu jogo mostra "sem dados". Testes nas Tarefas 4 e 5.
5. **Foto grande ou em HEIC do iPhone:** a compressão fica abaixo de 250 KB. Se o navegador não conseguir ler a imagem, aparece "Não consegui abrir esta foto. Tente outra." e a aula é salva sem foto. Verificação manual na Tarefa 8.

---

### Task 0: Preparar Firebase, GitHub e Vercel (o Leandro faz, com o passo a passo)

**Arquivos:** nenhum.

- [ ] **Passo 1:** criar no console do Firebase o projeto `diario-tatame`. Ativar Authentication → E-mail/senha. Criar as duas contas com os e-mails das restrições globais. Criar o Firestore em modo produção, região `southamerica-east1`.
- [ ] **Passo 2:** registrar um App da Web e copiar o `firebaseConfig` (vai para a Tarefa 1).
- [ ] **Passo 3:** em Configurações → Contas de serviço, gerar uma chave privada e salvar como `C:\xampp\htdocs\diario-tatame\tools\carga\service-account.json` (fora do git).
- [ ] **Passo 4:** criar o repositório **privado** `diario-tatame` no GitHub. O deploy na Vercel fica para a Tarefa 11.

Verificação: o login das duas contas aparece em Authentication → Usuários.

### Task 1: Esqueleto do app, login e navegação

**Arquivos:**
- Criar: `index.html`, `css/app.css`, `js/firebase-config.js`, `js/firebase.js`, `js/app.js`, `js/ui/icones.js`, `js/telas/login.js`, `package.json`, `.gitignore`, `README.md`
- Copiar: `mockup/assets/logo-gb.png`, `logo-gb-mark.png` e `gracie-barra.png` → `img/` (o mockup continua usando os originais)
- Teste: `tests/smoke.test.mjs`

**Interfaces:**
- Produz:
  - `js/firebase.js`: exporta `auth`, `db` e `entrar(email, senha)`, `sair()`, `aoMudarUsuario(cb)`;
  - `js/app.js`: exporta `irPara(rota, params)`, `registrarTela(nome, { montar(el, params, ctx) })` e `ctx = { uid, nome, db }`;
  - `js/ui/icones.js`: exporta `ICONES` (svg do menu, copiados do mockup) e `menuInferior(ativo)`.

- [ ] **Passo 1:** `git init` em `C:\xampp\htdocs\diario-tatame`. Criar `.gitignore` (`node_modules/`, `.vercel/`, `tools/carga/curriculo.json`, `tools/carga/service-account.json`, `*.log`) e `package.json` (`{"name":"diario-tatame","private":true,"type":"module","scripts":{"test":"node --test tests/"}}`).
- [ ] **Passo 2:** escrever `tests/smoke.test.mjs`, que importa `js/logica/datas.js` e verifica `hojeISO(new Date(2026,10,18,23,50)) === "2026-11-18"`. Rodar `npm test` → FALHA (o módulo ainda não existe).
- [ ] **Passo 3:** criar `js/logica/datas.js` com:
  - `hojeISO(d: Date) -> string` (data local);
  - `deISO(s) -> {ano, mes, dia}`;
  - `diaSemana(iso) -> 0..6` (0 = domingo);
  - `segundaDaSemana(iso) -> iso`;
  - `diasEntre(isoA, isoB) -> number`, calculado com `Date.UTC` sobre as partes, sem depender do fuso.
  Rodar `npm test` → PASSA.
- [ ] **Passo 4:** montar o `index.html`:
  - `<main id="tela">` e `<nav id="menu">`;
  - fontes Sora e Manrope;
  - `css/app.css` com os tokens e componentes do mockup (`.card`, `.chip`, `.btn`, `.row`, `.nav`, `.ttl`, `.seg`, `.belt`), copiados de `mockup/index.html` e sem a moldura de celular.
- [ ] **Passo 5:** escrever `js/app.js`:
  - o roteador por hash usa `#rota/param1/param2`;
  - sem usuário logado, vai para `#login`;
  - um e-mail fora de `USERS` é desconectado com a mensagem "Esta conta não tem acesso.";
  - o menu inferior aparece em todas as telas, exceto `login`, `checkin` e `aula`.
- [ ] **Passo 6:** fazer a tela `login.js` igual à tela 1 do mockup:
  - logo grande, "GB Sobradinho", e-mail, senha, "Entrar" e "Esqueci minha senha" (`sendPasswordResetEmail`);
  - em caso de erro, mostra "E-mail ou senha incorretos.".
- [ ] **Passo 7:** verificar manualmente:
  - adicionar `{"name":"diario-tatame","runtimeExecutable":"python","runtimeArgs":["-m","http.server","8766","--directory","diario-tatame"],"port":8766}` ao `C:\xampp\htdocs\.claude\launch.json`;
  - abrir, entrar com uma das contas e ver a rota mudar para `#inicio`, com o menu de 5 itens e o item ativo em vermelho.
- [ ] **Passo 8:** commit: `feat: esqueleto, login e navegação`.

### Task 2: Ciclo GB (semana, aula A/B, aprendizado da turma)

**Arquivos:**
- Criar: `js/logica/ciclo.js`
- Teste: `tests/ciclo.test.mjs`

**Interfaces:**
- Consome: `datas.js` (Tarefa 1).
- Produz:
  - `semanaDoCiclo(iso, ancoras, programa) -> number | null`: usa a âncora mais recente desse programa com `data <= segunda da semana de iso`, e devolve `null` se o programa for `"a definir"` ou não tiver âncora;
  - `aulaPadrao(iso) -> "A" | "B" | null`: seg/ter = A, qua/qui = B, sex/sáb/dom = null;
  - `aulaPrevista(iso, turma, ancoras) -> { programa, semana, aula }`: o programa vem de `turma.programa`; a aula vem de `turma.aula ?? aulaPadrao(iso)`;
  - `sugerirFixarAula(aulasDaTurma, turma) -> "A" | "B" | null`;
  - `CICLO_SEMANAS = 16`.

- [ ] **Passo 1:** escrever os testes, com `ancoras = [{programa:"GB1",data:"2026-11-16",semana:12},{programa:"GB2",data:"2026-11-16",semana:12}]`:
  - `semanaDoCiclo("2026-11-17", ancoras, "GB1") === 12`;
  - `semanaDoCiclo("2026-11-22", ancoras, "GB1") === 12` (domingo);
  - `semanaDoCiclo("2026-11-23", ancoras, "GB1") === 13`;
  - `semanaDoCiclo("2026-12-14", ancoras, "GB1") === 16` e `semanaDoCiclo("2026-12-21", ancoras, "GB1") === 1` (o ciclo volta ao 1 depois da 16);
  - `semanaDoCiclo("2026-11-09", ancoras, "GB1") === 11` (antes da âncora, volta);
  - `semanaDoCiclo("2026-11-18", ancoras, "a definir") === null`;
  - com uma âncora nova `{programa:"GB1",data:"2026-11-30",semana:12}` (semana repetida), `semanaDoCiclo("2026-11-30", ...) === 12`;
  - `aulaPadrao("2026-11-16") === "A"`, `("2026-11-18") === "B"`, `("2026-11-20") === null`;
  - `aulaPrevista("2026-11-18", {programa:"GB1", aula:null}, ancoras)` deep-equals `{programa:"GB1", semana:12, aula:"B"}`;
  - `sugerirFixarAula([{realizada:{aula:"A"},prevista:{aula:"B"}},{realizada:{aula:"A"},prevista:{aula:"B"}}], {aula:null}) === "A"`;
  - com só uma correção, retorna `null`;
  - se a turma já tem `aula`, retorna `null`.
- [ ] **Passo 2:** rodar `npm test` → FALHA.
- [ ] **Passo 3:** implementar em `js/logica/ciclo.js`. A conta é `((semanaÂncora - 1 + floor(diasEntre(segundaÂncora, segundaDaData) / 7)) % 16 + 16) % 16 + 1`.
- [ ] **Passo 4:** rodar `npm test` → PASSA.
- [ ] **Passo 5:** commit: `feat: cálculo do ciclo GB e aula A/B`.

### Task 3: Categorias IBJJF de idade e peso

**Arquivos:**
- Criar: `js/logica/categorias.js`
- Teste: `tests/categorias.test.mjs`

**Interfaces:**
- Produz:
  - `categoriaIdade(nascimentoISO, hojeISO) -> { nome, idadeNoAno } | null`;
  - `categoriaPeso(kg, sexo: "M" | "F") -> { nome, limite: number | null }`;
  - `TABELA_IDADE` e `TABELA_PESO` exportadas, num único lugar.
- Valores:
  - idade: Juvenil 16–17, Adulto 18–29, Master 1 30–35, Master 2 36–40, Master 3 41–45, Master 4 46–50, Master 5 51–55, Master 6 56–60, Master 7 61+; abaixo de 16 retorna `null`;
  - peso masculino: 57,5 / 64 / 70 / 76 / 82,3 / 88,3 / 94,3 / 100,5 / acima (Galo, Pluma, Pena, Leve, Médio, Meio-pesado, Pesado, Super-pesado, Pesadíssimo);
  - peso feminino: 48,5 / 53,5 / 58,5 / 64 / 69 / 74 / 79,3 / acima (Galo … Pesado, Super-pesado).

- [ ] **Passo 1:** escrever os testes:
  - `categoriaIdade("1992-12-31","2026-01-01")` deep-equals `{nome:"Master 1", idadeNoAno:34}` (conta a idade completada no ano);
  - `categoriaIdade("1996-05-01","2026-11-18").nome === "Master 1"` (30);
  - `categoriaIdade("1997-05-01","2026-11-18").nome === "Adulto"` (29);
  - `categoriaIdade("2012-01-01","2026-11-18") === null` (14);
  - `categoriaPeso(78.4,"M")` deep-equals `{nome:"Médio", limite:82.3}`;
  - `categoriaPeso(82.3,"M").nome === "Médio"` (limite inclusivo);
  - `categoriaPeso(101,"M")` deep-equals `{nome:"Pesadíssimo", limite:null}`;
  - `categoriaPeso(64,"F").nome === "Leve"`;
  - `categoriaPeso(80,"F").nome === "Super-pesado"`.
- [ ] **Passo 2:** rodar `npm test` → FALHA.
- [ ] **Passo 3:** implementar.
- [ ] **Passo 4:** rodar `npm test` → PASSA.
- [ ] **Passo 5:** commit: `feat: categorias IBJJF de idade e peso`.

### Task 4: Contagem, metas e "para revisar"

**Arquivos:**
- Criar: `js/logica/metas.js`
- Teste: `tests/metas.test.mjs`

**Interfaces:**
- Consome: `datas.js`.
- Produz (a `aula` tem o formato do documento do projeto, seção 10):
  - `ordenarAulas(aulas) -> aulas[]`, por `data` e depois `horario`, crescente;
  - `numeroDaAula(aulas, id) -> number`;
  - `progressoRoxa(aulas, metaAulasRoxa) -> { feitas, meta, fracao }`, com `fracao` entre 0 e 1;
  - `progressoSemana(aulas, hojeISO, metaSemanal) -> { feitas, meta, fracao }`;
  - `progressoMes(aulas, hojeISO, metaSemanal) -> { feitas, meta, fracao }`, com `meta = metaSemanal * round(diasNoMês / 7)`;
  - `horasTatame(aulas) -> number`, a soma de `duracaoMin / 60` com 1 casa decimal;
  - `diasTreinados(aulas, ano, mes) -> Set<number>`;
  - `paraRevisar(aulas, n = 10) -> string[]`: nomes únicos de técnicas com `resultado === "nao"` ou de aulas com `dificuldade >= 4`, nas últimas `n` aulas, no máximo 5, as mais recentes primeiro.

- [ ] **Passo 1:** escrever os testes:
  - com 3 aulas (17/11, 18/11, 19/11), `numeroDaAula(...,"id-19") === 3`;
  - depois de remover a de 18/11 da lista, `numeroDaAula === 2`;
  - `progressoRoxa([],175)` deep-equals `{feitas:0, meta:175, fracao:0}`;
  - `progressoRoxa(x,0).fracao === 0`, sem `NaN`;
  - `progressoSemana` em `"2026-11-22"` (domingo) conta as aulas de 16 a 22/11 e não a de 23/11;
  - `progressoMes([], "2026-11-18", 2).meta === 8` (30/7 = 4,29 → 4);
  - `progressoMes([], "2026-12-01", 2).meta === 8` (31/7 = 4,43 → 4);
  - `horasTatame([{duracaoMin:60},{duracaoMin:90}]) === 2.5`;
  - `paraRevisar` com uma técnica "Relógio" com `resultado:"nao"` retorna `["Relógio"]`, sem repetir nomes.
- [ ] **Passo 2:** rodar `npm test` → FALHA.
- [ ] **Passo 3:** implementar.
- [ ] **Passo 4:** rodar `npm test` → PASSA.
- [ ] **Passo 5:** commit: `feat: contagem de aulas, metas e lista de revisão`.

### Task 5: Meu jogo (notas por posição)

**Arquivos:**
- Criar: `js/logica/meujogo.js`
- Teste: `tests/meujogo.test.mjs`

**Interfaces:**
- Consome: `ordenarAulas` (Tarefa 4).
- Produz:
  - `CATEGORIAS = ["Guarda","Raspagem","Passagem","Costas","Finalização","Defesa de costas","4 apoios","Quedas"]` (só acrescentar no fim; os nomes ficam gravados no banco);
  - `notasPorCategoria(aulas, janela = 20) -> { [categoria]: { nota: number | null, registros, sofri, aulas } }`;
  - `notasPorTecnica(aulas, janela = 20) -> [{ nome, categoria, nota, registros, nao }]`;
  - `precisaMelhorar(aulas) -> [{ titulo, nota, motivo }]`, no máximo 3, só itens com `registros >= 2` e `nota < 60`, do menor para o maior;
  - `indoBem(aulas) -> [{ titulo, nota, motivo }]`, no máximo 2, com `registros >= 2` e `nota >= 70`, do maior para o menor.
- Regra da nota (documento do projeto, seção 8):
  - pontos: `bem` = 1, `asvezes` = 0,5, `nao` = 0;
  - cada aula da janela com a categoria em `rolaSofri` adiciona um ponto 0;
  - `nota = round(média × 100)`, ou `null` sem registros.
- Motivos:
  - técnica: `Não saiu em ${nao} de ${registros} aulas` (ou `Saiu bem em ${bem} de ${registros} aulas` no Indo bem);
  - categoria em que `sofri > 0`: `Sofreu em ${sofri} de ${aulas} rolas`.

- [ ] **Passo 1:** escrever os testes:
  - `notasPorCategoria([])` dá `nota === null` em todas as 8 categorias;
  - uma aula com `tecnicas:[{nome:"Relógio",categoria:"Finalização",resultado:"nao"},{nome:"Mata-leão",categoria:"Finalização",resultado:"bem"}]` e `rolaSofri:["Defesa de costas"]` → Finalização com `nota === 50` e `registros === 2`, Defesa de costas com `nota === 0`, `sofri === 1` e `aulas === 1`;
  - com 25 aulas, só as 20 mais recentes contam;
  - `precisaMelhorar` com "Relógio" `nao` em 3 de 4 aulas inclui `{titulo:"Relógio", motivo:"Não saiu em 3 de 4 aulas"}`;
  - um item com só 1 registro não aparece.
- [ ] **Passo 2:** rodar `npm test` → FALHA.
- [ ] **Passo 3:** implementar.
- [ ] **Passo 4:** rodar `npm test` → PASSA.
- [ ] **Passo 5:** commit: `feat: cálculo do Meu jogo`.

### Task 6: Camada de dados, regras do Firestore e carga inicial

**Arquivos:**
- Criar: `js/dados.js`, `firestore.rules`, `tools/carga/carregar.mjs`, `tools/carga/package.json`, `tools/carga/grade.json`, `tools/carga/curriculo.exemplo.json`
- Criar (fora do git): `tools/carga/curriculo.json`

**Interfaces:**
- Consome: `ctx.db` e `ctx.uid` (Tarefa 1).
- Produz (`js/dados.js`, todas `async`):
  - perfil:
    - `lerPerfil(uid)`, que cria o documento padrão no primeiro acesso: `{ nome: USERS[email], faixa:{cor:"azul", desde:"2026-11"}, graus:[], metaSemanal:2, metaAulasRoxa:175, nascimento:null, sexo:null, telefone:"", fotoPerfilId:null }`;
    - `salvarPerfil(uid, parcial)`.
  - aulas: `ouvirAulas(uid, cb) -> unsubscribe` (todas as aulas do usuário, em tempo real), `salvarAula(uid, aula) -> id`, `excluirAula(uid, id)`.
  - fotos: `salvarFoto(uid, { aulaId, dados, largura, altura }) -> id`, `lerFoto(uid, id)`, `excluirFoto(uid, id)`.
  - pesos: `listarPesos(uid)`, `registrarPeso(uid, { data, kg })`.
  - grade: `ouvirGrade(cb)`, `salvarTurma(turma)`, `excluirTurma(id)`.
  - currículo: `lerCurriculo(programa, semana)`, `salvarCurriculo(programa, semana, aula: "A" | "B", { tema, tecnicas })`.
  - ciclo: `lerAncoras()`, `adicionarAncora({ programa, data, semana })`.
- Regras (`firestore.rules`):
  - a função `permitido()` é a mesma do app Compras, com os dois e-mails;
  - `usuarios/{uid}/{document=**}`: leitura e escrita se `permitido() && request.auth.uid == uid`;
  - `grade/**`, `curriculo/**` e `config/**`: leitura e escrita se `permitido()`;
  - qualquer outra coisa: negado.

- [ ] **Passo 1:** criar `tools/carga/grade.json` com as 15 turmas reais:
  - segunda e quarta: 12:30, 19:00, 20:00;
  - terça e quinta: 07:00, 19:00, 20:00;
  - sexta: 12:30, 19:00;
  - sábado: 10:00;
  - todas com `programa:"a definir"`, `aula:null`, `professor:""`, `duracaoMin:60`, `ativa:true`, `diaSemana` com 1 = segunda.
- [ ] **Passo 2:** escrever `carregar.mjs`, que usa `firebase-admin` e `service-account.json`:
  - grava `grade/` a partir de `grade.json`, só se a coleção estiver vazia;
  - grava `config/ciclo` com as duas âncoras das restrições globais;
  - grava `curriculo/{programa}-{semana}` a partir de `curriculo.json` (formato em `curriculo.exemplo.json`: `[{programa, semana, aulaA:{tema, tecnicas:[{nome, categoria}]}, aulaB:{…}}]`);
  - com `--dry-run`, só imprime o que gravaria.
- [ ] **Passo 3:** montar `curriculo.json` do GB1:
  - baixar o PDF do link nas anotações do Leandro (`GB1_Curriculum_Hi_res.pdf`);
  - transcrever as 16 semanas (aulas A e B e os nomes das técnicas, com uma das 8 `CATEGORIAS` em cada técnica);
  - conferir que as semanas 6, 9, 12 e 13 batem com o documento do projeto (seção 3 das anotações);
  - o GB2 fica fora, porque começa vazio.
- [ ] **Passo 4:** rodar a carga:
  - `cd tools/carga && npm i firebase-admin@12.7.0 && node carregar.mjs --dry-run` → deve listar 15 turmas, 2 âncoras e 16 semanas do GB1;
  - depois, sem `--dry-run`;
  - publicar as regras: colar `firestore.rules` no console do Firebase (Firestore → Regras) e publicar.
- [ ] **Passo 5:** verificar no console:
  - `grade` tem 15 documentos e `curriculo` tem `GB1-1` a `GB1-16`;
  - no app logado, `lerPerfil` cria `usuarios/{uid}`;
  - no console do navegador, ler `usuarios/<uid da outra pessoa>` retorna `permission-denied`.
- [ ] **Passo 6:** commit (o `curriculo.json` não entra): `feat: camada de dados, regras e carga inicial`.

### Task 7: Componentes visuais e tela Início

**Arquivos:**
- Criar: `js/ui/faixa.js`, `js/ui/graficos.js`, `js/telas/inicio.js`

**Interfaces:**
- Consome: `metas.js`, `ciclo.js`, `dados.js`.
- Produz:
  - `faixaSVG(graus: 0..4, { apagada = false }) -> string`, igual à função `belt()` do mockup;
  - `anelSVG(fracao) -> string`, com trilho branco a 28% e arco branco;
  - `meiaLuaSVG(fracao) -> string`;
  - `radarSVG(itens: [{rotulo, nota | null}]) -> string`, com `viewBox="-42 0 384 250"` como no mockup; nota `< 45` aparece em vermelho e `null` fica sem ponto.

- [ ] **Passo 1:** montar o topo da tela Início, igual à tela 2 do mockup:
  - logo `logo-gb-mark.png`;
  - "Boa noite / Bom dia / Boa tarde" (5–12 h, 12–18 h, resto), com o nome;
  - foto de perfil com aro azul (iniciais se não houver foto);
  - `faixaSVG(perfil.graus.length)` com "Faixa azul" e "N de 4 graus".
- [ ] **Passo 2:** montar o cartão vermelho:
  - `anelSVG(progressoRoxa.fracao)` com "N de 175" e "Aulas realizadas";
  - a barra azul → roxa preenchida pela mesma fração;
  - a linha "Semana x/y · Mês x/y · Tatame Nh".
- [ ] **Passo 3:** montar "Grade de hoje · Qua 18/11", com a semana do ciclo à direita:
  - as turmas do dia;
  - o tema previsto, vindo de `lerCurriculo`, ou "tema a registrar", ou "GB1 ou GB2?" quando o programa for "a definir";
  - turmas cujo horário + duração já passou aparecem apagadas;
  - o botão Check-in leva a `#checkin/{turmaId}/{hojeISO}`;
  - se a turma já tem check-in hoje, o botão vira "Feito ✓" e abre a aula.
- [ ] **Passo 4:** verificar no preview, com zero aulas:
  - o anel mostra "0 de 175", a linha mostra "0/2 · 0/8 · 0h", e não aparece `NaN`;
  - numa quarta, as turmas são 12h30, 19h e 20h.
- [ ] **Passo 5:** commit: `feat: tela Início`.

### Task 8: Check-in, foto e currículo que se completa

**Arquivos:**
- Criar: `js/telas/checkin.js`, `js/foto.js`

**Interfaces:**
- Consome: `aulaPrevista`, `sugerirFixarAula` (Tarefa 2), `CATEGORIAS` (Tarefa 5) e `dados.js`.
- Produz:
  - `comprimirImagem(file, ladoMax, bytesMax) -> Promise<{ dados: dataURL, largura, altura }>`, com canvas e JPEG, baixando a qualidade de 0,85 em passos de 0,1 até caber, e rejeitando com `Error("ilegivel")` se a imagem não carregar;
  - a rota `#checkin/{turmaId}/{data}`, ou `#checkin/novo/{data}` para uma aula fora da grade, com horário livre.

- [ ] **Passo 1:** montar o cabeçalho escuro, igual à tela 3 do mockup:
  - data, horário, programa e professor;
  - se o programa da turma for "a definir", primeiro aparecem os botões **GB1 / GB2**;
  - a aula prevista ("Semana N: tema") e a troca A/B com um toque;
  - **Foi essa aula / Foi outra**. "Foi outra" abre a escolha de semana (1–16), aula A/B, ou "Tema livre" com um campo de texto.
- [ ] **Passo 2:** montar as técnicas:
  - pré-carregadas de `curriculo.aulaX.tecnicas`, cada uma com o segmento Não saiu / Às vezes / Saiu bem (sem escolha = não registra);
  - "+ adicionar técnica" pede nome e categoria (as 8 `CATEGORIAS`).
- [ ] **Passo 3:** montar o resto do formulário:
  - dificuldade de 1 a 5 (obrigatória);
  - "O que aprendi" e "Revisar" (opcionais);
  - "No rola, onde sofri?", com chips de várias escolhas das 8 categorias;
  - duração (vem da turma, editável).
- [ ] **Passo 4:** montar a foto do dia:
  - `<input type="file" accept="image/*">`, depois `comprimirImagem(file, 1000, 250_000)`, com prévia;
  - em erro, mostrar "Não consegui abrir esta foto. Tente outra." e deixar salvar sem foto;
  - uma foto só; escolher outra substitui a anterior.
- [ ] **Passo 5:** fazer o "Salvar aula":
  - grava a foto (se houver), depois a aula, com `fotoId`, `prevista`, `foiPrevista`, `realizada`, `tecnicas`, `dificuldade`, `aprendi`, `revisar`, `rolaSofri`, `duracaoMin`, `turmaId` e `criadoEm`;
  - se `curriculo` daquela semana e aula estiver vazio e houver tema ou técnicas, pergunta "Salvar como currículo da semana N (aula X)?" e, se sim, chama `salvarCurriculo`;
  - se `sugerirFixarAula` retornar uma letra, pergunta "Usar sempre aula X nesta turma?" e, se sim, chama `salvarTurma` com `aula`;
  - por fim, volta para `#inicio`.
- [ ] **Passo 6:** verificar no preview:
  - check-in numa turma "a definir" → escolher GB2 → "Semana 12 · tema a registrar" → digitar um tema → salvar → aceitar a pergunta do currículo; o documento `curriculo/GB2-12` existe;
  - foto de 12 MP → o documento da foto tem menos de 350 000 caracteres;
  - um arquivo `.txt` renomeado para `.jpg` mostra a mensagem de erro e a aula salva sem foto.
- [ ] **Passo 7:** commit: `feat: check-in com foto e currículo que se completa`.

### Task 9: Grade, Diário e Aula aberta

**Arquivos:**
- Criar: `js/telas/grade.js`, `js/telas/diario.js`, `js/telas/aula.js`

**Interfaces:**
- Consome: `ciclo.js`, `metas.js` (`paraRevisar`, `numeroDaAula`), `dados.js`, `foto.js`.

- [ ] **Passo 1:** montar a tela Grade, igual à tela 4 do mockup:
  - dias de seg a sáb, com hoje marcado;
  - um cartão por programa com aulas no dia (GB1 e GB2): "Ciclo GBx · semana N de 16", a barra de 16 partes, o tema e "Ajustar semana";
  - "Ajustar semana" escolhe 1–16 e chama `adicionarAncora({programa, data: segundaDaSemana(hoje), semana})`;
  - a lista de turmas, com a etiqueta GB1 em vermelho claro, GB2 em azul claro e "a definir" em cinza;
  - tocar numa turma abre a edição: horário, programa, aula A/B/a definir, professor, duração, ativa e excluir;
  - um botão "+ turma";
  - "Próxima semana · N+1" com o tema.
- [ ] **Passo 2:** montar a tela Diário, igual à tela 5 do mockup:
  - quadro "Para revisar" com `paraRevisar`;
  - filtros Todas / Mais difíceis (dificuldade ≥ 4) / Com foto / GB1 / GB2;
  - lista agrupada por mês, do mais recente para o mais antigo;
  - miniatura carregada sob demanda com `lerFoto`, ou "+" se não houver foto (o "+" abre a escolha de foto e grava direto na aula);
  - tracinhos de dificuldade;
  - com zero aulas: "Nenhuma aula ainda. Faça o primeiro check-in pela tela Início.".
- [ ] **Passo 3:** montar a tela Aula aberta (`#aula/{id}`), igual à tela 5b do mockup:
  - foto no topo com data, turma e tema por cima; tocar abre em tela cheia com zoom por pinça (CSS `touch-action: pinch-zoom` sobre a imagem em tamanho natural);
  - chips das técnicas com a cor do resultado;
  - dificuldade e "Aula nº" (`numeroDaAula`);
  - "O que aprendi" e "Revisar";
  - "Editar aula" reabre o formulário do check-in já preenchido;
  - "Excluir aula" pede confirmação na própria tela e apaga a aula e a foto.
- [ ] **Passo 4:** verificar no preview:
  - criar 3 aulas, excluir a do meio e ver a última passar de "Aula nº 3" para "Aula nº 2", com o anel do Início em 2;
  - o filtro "Com foto" mostra só as aulas com foto.
- [ ] **Passo 5:** commit: `feat: Grade, Diário e Aula aberta`.

### Task 10: Evolução, Meu jogo e Perfil

**Arquivos:**
- Criar: `js/telas/evolucao.js`, `js/telas/perfil.js`

**Interfaces:**
- Consome: `metas.js`, `meujogo.js`, `categorias.js`, `graficos.js`, `faixa.js`, `dados.js`, `foto.js`.

- [ ] **Passo 1:** montar a Evolução, com as abas Histórico / Frequência / Meu jogo (telas 6 e 7 do mockup):
  - **Histórico:** as meias-luas de semana e mês; a linha do tempo com o próximo grau tracejado ("a critério do professor", só se houver menos de 4 graus), os graus do mais recente para o mais antigo (`faixaSVG(n)`, data e "Aula nº" da data) e "Graduação faixa azul · nov/2026" por último;
  - **Frequência:** calendário do mês com os dias treinados marcados em vermelho (`diasTreinados`) e setas para mudar o mês;
  - **Meu jogo:** `radarSVG` a partir de `notasPorCategoria`, "Precisa melhorar" e "Indo bem" com barras e motivos; sem dados: "Faça check-ins marcando como saiu cada técnica para ver seu jogo aqui.".
- [ ] **Passo 2:** montar o Perfil, igual à tela 8 do mockup:
  - escrita "GRACIE BARRA" no topo;
  - foto (troca com `comprimirImagem(file, 400, 80_000)`, guardada em `usuarios/{uid}/fotos` e referenciada em `fotoPerfilId`), nome e "GB Sobradinho";
  - faixa com "Faixa azul desde nov/2026" e "N de 4 graus";
  - "Registrar grau": número sugerido = graus + 1, data (padrão hoje) e professor opcional; desabilitado com 4 graus;
  - cartões de categoria de idade (`categoriaIdade`) e de peso (`categoriaPeso` com o último peso e o sexo), com "Informe nascimento / peso / sexo" quando faltar dado;
  - Peso com "Atualizar" (`registrarPeso`);
  - meta por semana (− / +, entre 1 e 7) e aulas até a roxa (campo numérico);
  - "Dados pessoais ›": nome, nascimento, sexo (M/F), telefone; o e-mail aparece só para leitura;
  - "Sair".
- [ ] **Passo 3:** verificar no preview:
  - nascimento 1992-05-10, sexo M e peso 78,4 → "Master 1 · 34 anos" e "Médio · 78,4 kg · até 82,3";
  - registrar o 1º grau → a faixa do Início ganha a fita branca e a Evolução mostra o marco;
  - Meu jogo com zero aulas mostra a mensagem de vazio, sem erro no console.
- [ ] **Passo 4:** commit: `feat: Evolução, Meu jogo e Perfil`.

### Task 11: PWA e publicação na Vercel

**Arquivos:**
- Criar: `manifest.webmanifest`, `sw.js`, `img/icon-192.png`, `img/icon-512.png`, `img/icon-maskable-512.png`, `img/apple-touch-icon.png`, `vercel.json`
- Modificar: `index.html` (link do manifest, `theme-color #faf9f8`, registro do service worker)

- [ ] **Passo 1:** gerar os ícones a partir de `img/logo-gb-mark.png` com um script Python/PIL único (não fica no repositório). O maskable usa margem de 10% e fundo `#c8201b`.
- [ ] **Passo 2:** criar o `manifest.webmanifest`: `name` "Diário de Tatame", `short_name` "Tatame", `display` standalone, `start_url` "./", `background_color` `#faf9f8`, `theme_color` `#c8201b`, `lang` pt-BR.
- [ ] **Passo 3:** criar o `sw.js` no mesmo modelo do app Compras: cache `diario-tatame-v1`, rede primeiro para os arquivos do app e cache primeiro para o SDK 10.12.2.
- [ ] **Passo 4:** criar o `vercel.json` com `{"headers":[{"source":"/sw.js","headers":[{"key":"Cache-Control","value":"no-cache"}]}]}`.
- [ ] **Passo 5:** push para o GitHub privado. O Leandro importa o repositório na Vercel (framework "Other", sem build) e adiciona o domínio `*.vercel.app` em Firebase → Authentication → Domínios autorizados.
- [ ] **Passo 6:** verificar:
  - `npm test` → todos passam;
  - no celular, abrir a URL da Vercel, "Adicionar à tela inicial", entrar com cada conta e fazer um check-in de teste com foto;
  - a Stephany não vê as aulas do Leandro.
- [ ] **Passo 7:** commit: `feat: PWA e publicação`.
