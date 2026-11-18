# Diário de Tatame — documento do projeto

**Data:** 18/11/2026
**Autor:** Leandro (com Claude)
**Status:** rascunho para aprovação (revisado após a leitura independente)
**Mockup aprovado:** `diario-tatame/mockup/index.html` (cópia local com a logo da GB) e https://claude.ai/artifact/G7LSaUf1D3kViirU9oncx7 (sem a logo)

> "Diário de Tatame" é um nome provisório.

---

## 1. Por que existe

Leandro e Stephany treinam jiu-jítsu na **Gracie Barra Sobradinho**. A unidade não usa o GB App/GB Aluno, então não existe registro oficial de presença nem do conteúdo das aulas ao qual eles tenham acesso. Um amigo faixa roxa usa um app para acompanhar os treinos, e o Leandro quer o mesmo, feito sob medida:

- saber **qual aula do currículo GB estava prevista** e confirmar se foi ela mesma;
- registrar **presença, o que aprendeu, a dificuldade e uma foto do dia**;
- enxergar a **evolução**: quantas aulas faltam para a roxa (meta pessoal de 175), frequência e graus;
- ter um **perfil técnico**: onde vai bem e o que precisa melhorar em cada posição.

Os dois **acabaram de pegar a faixa azul**, sem grau e com zero aulas contadas. A contagem começa do zero no primeiro check-in.

## 2. Para quem

Só **duas pessoas**: Leandro e Stephany. Cada um tem o próprio login e vê apenas os próprios dados. A grade de horários e o cronograma GB são **compartilhados** entre os dois.

## 3. Objetivos, não-objetivos e anti-objetivos

**Objetivos**
- O check-in no vestiário leva menos de 1 minuto: quase tudo com toques e pouco texto.
- O app abre no celular como um aplicativo: instalável na tela inicial (PWA), com ícone próprio.
- A previsão da aula do dia vem do ciclo GB e acerta sem ajuste manual nas semanas normais.
- Os dados ficam guardados com segurança, de graça ou quase de graça.

**Não-objetivos**
- Não haverá cadastro aberto, outras academias, outros alunos nem painel de professor.
- Não haverá publicação em lojas de apps (Play Store/App Store).
- Não haverá integração com o sistema oficial da GB.
- O app não funcionará offline na primeira versão. Se a persistência offline do Firestore vier de graça, é bônus.

**Anti-objetivos** (o que faria o projeto falhar mesmo funcionando)
- O check-in ficar longo ou chato a ponto de ninguém preencher.
- A contagem para a roxa parecer uma **promessa de graduação**. É uma meta pessoal, e quem gradua é o professor.
- O visual ficar com cara de operadora de telefonia (como a Claro). Foi esse o motivo de tirar os blocos vermelhos grandes.
- O conteúdo do currículo GB ou a marca GB ficarem expostos publicamente.

## 4. Restrições

- **Plataforma decidida pelo Leandro:** código no **GitHub**, hospedagem na **Vercel** e **Firebase** para login (e-mail e senha) e banco de dados (Firestore).
- **Marca GB:** a logo e a escrita "Gracie Barra" entram no app porque o uso é pessoal e privado. Por isso:
  - o **repositório do GitHub deve ser privado**;
  - nenhuma página sem login deve mostrar conteúdo além da tela de login;
  - se um dia o app ficar público, é preciso autorização da GB.
- **Currículo GB:** é material da Gracie Barra. Fica dentro do Firestore, acessível só com login.
- **Custo:** a meta é custo zero. O único ponto que pode exigir cartão é o armazenamento de fotos (seção 9).
- O Leandro já fez um app parecido, o **Compras da Família** (`C:\xampp\htdocs\compras`: HTML/JS, Firebase Auth e Firestore). Vale reaproveitar o que der de lá.

## 5. Caminhos considerados

| Caminho | Prós | Contras |
|---|---|---|
| **1. Página web + Firebase** (escolhido, hospedado na Vercel) | Estrutura que o Leandro já conhece, grátis, abre como app no celular | Fotos em tamanho grande exigem o plano Blaze |
| 2. Página web + Supabase | 1 GB grátis para fotos, banco com tabelas | Ferramenta nova; o projeto grátis "adormece" após uma semana sem uso |
| 3. Laravel + MySQL na Umbler | Controle total, fotos no servidor | Mensalidade, deploy por FTP, dá mais trabalho para parecer app no celular |

**Escolhido: 1**, com a hospedagem na Vercel no lugar do GitHub Pages, por decisão do Leandro.

## 6. Visual (decidido)

Estilo **"Kimono puro"**, conforme o mockup aprovado:
- **Base:** fundo quase branco (#faf9f8), texto quase preto (#151517) e **vermelho GB (#c8201b)** só nos detalhes (botões, item ativo, traço sob o nome).
- **Azul da faixa (#2449c9):** aparece na faixa desenhada, no aro da foto de perfil e no gráfico de radar. O roxo (#6b2fa8) só aparece na meta azul → roxa.
- **Cartão de aulas vermelho** na tela inicial, com o anel "0 de 175".
- **Fontes:** Sora para títulos e interface, Manrope de apoio.
- **Faixa desenhada em SVG:** azul com a ponta preta, e cada grau vira uma fita branca na ponta (de 0 a 4).
- **Menu inferior flutuante** com ícones e cinco itens: Início, Grade, Diário, Evolução, Perfil.
- **Logo GB:**
  - logo completa no Login;
  - versão só com o triângulo no Início (o texto não fica legível em tamanho pequeno);
  - escrita "GRACIE BARRA" à direita do título nas outras páginas, e só a escrita no topo do Perfil;
  - arquivos limpos em `mockup/assets/` (`logo-gb.png`, `logo-gb-mark.png`, `gracie-barra.png`). O ideal é trocar por um arquivo oficial em alta resolução.

## 7. Telas

1. **Login:** e-mail e senha, "Esqueci minha senha" (reset do Firebase). Não há botão de cadastro, porque as contas são criadas no console do Firebase.
2. **Início:**
   - saudação com o nome, foto com aro azul e a faixa desenhada com os graus;
   - cartão vermelho com o anel de **aulas realizadas / meta** (0 de 175) e a barra azul → roxa;
   - a linha **Semana x/meta · Mês x/meta · horas de tatame**;
   - lista das **turmas de hoje** com o tema previsto. As que já passaram ficam apagadas, e cada uma tem o botão Check-in.
3. **Check-in** (abre a partir de uma turma):
   - cabeçalho com data, horário, programa, professor e a **aula prevista** (semana do ciclo e tema), com os botões **"Foi essa aula" / "Foi outra"**. "Foi outra" deixa escolher outra semana ou aula do currículo, ou digitar um tema livre;
   - **técnicas** da aula, pré-carregadas do currículo, cada uma com **Não saiu / Às vezes / Saiu bem**, mais "+ adicionar técnica" (nome livre e categoria);
   - **dificuldade** da aula de 1 a 5;
   - **o que aprendi** e **o que revisar** (textos livres e opcionais);
   - **no rola, onde sofri:** escolha de várias categorias de posição;
   - **foto do dia** (uma por aula) e o botão **Salvar aula**.
   - Também dá para fazer check-in de uma aula fora da grade, com data e horário livres, porque às vezes a turma muda.
4. **Grade:**
   - dias da semana (seg–sáb) com o dia de hoje marcado;
   - cartão do **ciclo GB1, semana N de 16**, com a barra de progresso do ciclo, o tema da semana e o botão **"Ajustar semana"**;
   - lista de turmas do dia com horário, professor e etiqueta GB1/GB2;
   - prévia da próxima semana do ciclo;
   - a grade e o currículo são editáveis pelos dois usuários.
5. **Diário:**
   - lista de aulas por mês, com miniatura da foto (ou "+" se não tiver), data, turma, semana, tema e os tracinhos de dificuldade;
   - filtros: Todas, Mais difíceis, Com foto, GB1/GB2;
   - quadro **"Para revisar"** com as técnicas de dificuldade 4–5 ou com "Não saiu" recente.
   - **5b. Aula aberta:** foto grande no topo (toque abre em tela cheia com zoom), técnicas, dificuldade, número da aula, "o que aprendi", "revisar" e o botão Editar.
6. **Evolução:** com três abas.
   - **Histórico:** dois medidores em meia-lua (semana e mês contra a meta) e a linha do tempo dos marcos com a faixa desenhada: graduação, 1º, 2º grau… O próximo grau aparece tracejado, "a critério do professor".
   - **Frequência:** calendário com os dias treinados.
   - **Meu jogo:** gráfico de radar por categoria de posição, a lista **Precisa melhorar** (as 2–3 piores, com o motivo em texto, por exemplo "Relógio: não saiu em 3 de 4 aulas") e a lista **Indo bem**.
7. **Perfil:**
   - foto (trocável), nome, academia e a faixa com os graus;
   - **Registrar grau** (grau, data e professor opcional), que alimenta a Evolução;
   - **categoria de idade** e **categoria de peso** em destaque;
   - peso com "Atualizar", que guarda o histórico com data;
   - meta de aulas por semana (− / +, padrão 2) e meta de aulas até a roxa (padrão 175);
   - **Dados pessoais:** nome, nascimento, sexo, e-mail e telefone;
   - Sair.

## 8. Regras

**Semana do ciclo GB**
- Leandro e Stephany fazem **GB1 e GB2**, alternando. Cada programa tem **o próprio ciclo e a própria âncora**. A previsão de uma turma usa o ciclo do programa daquela turma.
- Âncora do **GB2**: a mesma semana de 16/11/2026 a 21/11/2026 também é a **semana 12** do ciclo GB2 (informado pelo Leandro).
- Âncora do **GB1**: a **semana de 16/11/2026 (segunda) a 21/11/2026 é a semana 12** do ciclo GB1, porque a aula de 17/11 foi "pegada de costas dos quatro apoios, relógio e mata-leão".
- Cada semana do calendário (segunda a domingo) avança uma semana do ciclo. Depois da 16 vem a 1.
**Programa e aula A/B de cada turma**
- O Leandro não sabe como a academia distribui GB1/GB2 nem A/B entre as turmas. Por isso cada turma da grade tem dois campos opcionais: **programa** (GB1, GB2 ou "a definir") e **aula** (A, B ou "a definir").
- **Padrão de A/B enquanto ninguém configurar:** segunda e terça = A, quarta e quinta = B, sexta e sábado = "a definir".
- Se a turma não tem programa fixo, o check-in pergunta **GB1 ou GB2** com um toque, antes de mostrar a aula prevista.
- No check-in, A/B troca com um toque. Quando o usuário corrige a mesma turma duas vezes seguidas para o mesmo valor, o app oferece "usar sempre B nesta turma?".

- "Ajustar semana" grava uma nova âncora (data + semana), para quando a academia pula ou repete uma semana. Vale a âncora mais recente.

**Contagem de aulas**
- Cada check-in salvo conta como 1 aula para aquele usuário.
- O número da aula é a ordem cronológica, a partir de 1.
- Horas de tatame = soma da duração das turmas (duração cadastrada na grade, padrão de 60 min, editável no check-in).

**Metas**
- Semana: aulas da semana do calendário contra a meta semanal.
- Mês: aulas do mês contra (meta semanal × semanas do mês, arredondado).

**Categoria de idade** (IBJJF; conta a idade que a pessoa completa no ano corrente)
- Juvenil 16–17, Adulto 18–29, Master 1 30–35, Master 2 36–40, Master 3 41–45, Master 4 46–50, Master 5 51–55, Master 6 56–60, Master 7 61+.

**Categoria de peso** (IBJJF, adulto e master, **com kimono**; depende do sexo)
- **Masculino:** Galo até 57,5 · Pluma até 64 · Pena até 70 · Leve até 76 · Médio até 82,3 · Meio-pesado até 88,3 · Pesado até 94,3 · Super-pesado até 100,5 · Pesadíssimo acima de 100,5.
- **Feminino:** Galo até 48,5 · Pluma até 53,5 · Pena até 58,5 · Leve até 64 · Médio até 69 · Meio-pesado até 74 · Pesado até 79,3 · Super-pesado acima de 79,3.
- As tabelas ficam num único arquivo de configuração, fácil de corrigir, porque a IBJJF revisa os valores de tempos em tempos. Conferir os números antes de publicar.

**Meu jogo**
- **Categorias de posição** (lista fixa): Guarda, Raspagem, Passagem, Costas, Finalização, Defesa de costas, 4 apoios, Quedas.
- **Janela:** últimas 20 aulas do usuário.
- **Nota da categoria (0–100):**
  - técnicas: Saiu bem = 1, Às vezes = 0,5, Não saiu = 0;
  - rola: cada aula em que a categoria foi marcada em "onde sofri" vale 0 naquela aula;
  - nota = média dos pontos dessa categoria × 100.
- Categorias sem dados ficam sem ponto no radar, com o aviso "sem dados".
- **Precisa melhorar:** as categorias e técnicas de menor nota, com pelo menos 2 registros, e o motivo em texto.
- **Indo bem:** as de maior nota, com pelo menos 2 registros.

## 9. Fotos — decidido: opção B (Firestore, sem custo)

**Decisão do Leandro (18/11/2026): opção B.** É um projeto de teste e ele não quer gastos nem cartão cadastrado. Como fazer:
- comprimir no navegador para JPEG com lado maior de cerca de 1000 px e no máximo ~250 KB;
- **cada foto num documento próprio** (`usuarios/{uid}/fotos/{id}` com { aulaId, dados base64, largura, altura, criadoEm }), e a aula guarda a lista de IDs;
- a foto de perfil segue o mesmo esquema, num tamanho menor (~400 px);
- **uma foto por aula** (decisão do Leandro). Trocar a foto substitui a anterior.

Se um dia valer a pena, dá para migrar para a opção A sem mudar as telas.

Opções avaliadas:
- **A. Firebase Storage (plano Blaze):**
  - a foto fica em tamanho bom (por exemplo, lado maior de 1600 px) e o zoom em tela cheia funciona bem;
  - exige cadastrar um cartão no Google Cloud, e a cota grátis cobre com folga o uso de duas pessoas;
  - recomendado criar um alerta de orçamento.
- **B. Foto reduzida dentro do Firestore:**
  - o celular comprime a foto para uns 250 KB (lado maior de cerca de 1000 px) antes de salvar;
  - 100% grátis, sem cartão;
  - perde detalhe no zoom e limita a cerca de 3 fotos por aula (limite de 1 MB por documento). O mais seguro é guardar cada foto num documento próprio.

## 10. Dados (Firestore — esboço)

- `usuarios/{uid}`:
  - nome, nascimento, sexo, telefone, fotoPerfil;
  - faixa { cor: "azul", desde };
  - graus [ { numero, data, professor? } ];
  - metaSemanal (2), metaAulasRoxa (175).
- `usuarios/{uid}/pesos/{id}`: { data, kg }
- `usuarios/{uid}/aulas/{id}`:
  - data, horário, programa, professor, duracaoMin, turmaId (cópia dos dados da turma no momento);
  - prevista { programa, semana, aula A/B };
  - foiPrevista, realizada { programa, semana, aula, temaLivre? };
  - tecnicas [ { nome, categoria, resultado: "nao" | "asvezes" | "bem" } ];
  - dificuldade (1–5), aprendi, revisar, rolaSofri [categorias], fotoId (doc em `usuarios/{uid}/fotos`, opcional);
  - criadoEm.
- `grade/{id}`: { diaSemana, horario, programa, professor, duracaoMin, ativa } (compartilhado)
- `curriculo/{programa}-{semana}`: { programa, semana, aulaA { tema, tecnicas [ { nome, categoria } ] }, aulaB {…} } (compartilhado)
- `config/ciclo`: { ancoras: [ { programa, data, semana } ] } (compartilhado)
- **Regras de segurança:**
  - `usuarios/{uid}/**` só o próprio uid lê e escreve;
  - `grade`, `curriculo` e `config` são lidos e escritos por qualquer usuário logado (só existem as duas contas).

## 11. Conteúdo que precisa entrar antes de usar

- **Currículo GB2** (mesmo formato do GB1). O Leandro não tem a fonte, e uma busca em 18/11/2026 não achou uma versão aberta: o GB2 fica no GB Online, que é pago, e existe em mais de uma versão (Carlos Maia, Ana Laura Cordeiro, Marcio). Por isso o **GB2 começa vazio**. No check-in de GB2, o card mostra "Semana N · tema a registrar". O tema e as técnicas digitados na primeira vez **viram o currículo daquela semana e aula** (o app pergunta "salvar como currículo da semana N?"). Assim o GB2 se completa sozinho em um ciclo.

- **Currículo GB1 completo** (16 semanas, aulas A e B, com as técnicas). Hoje temos confirmadas as semanas 6, 9, 12 e 13. Fonte: o PDF do currículo GB1 citado nas anotações do Leandro. Confirmar com o professor se a unidade segue a mesma ordem.
- **Carga do currículo:** um script de carga que **roda só no PC do Leandro** (Node + Firebase Admin, com a chave de serviço fora do repositório) lê um JSON com GB1 e GB2 e grava em `curriculo/`. O JSON do currículo **não vai para o repositório nem para o deploy** (fica no `.gitignore`). Depois, correções são feitas pelo app.
- **Grade real da GB Sobradinho** (treino adulto, descrição do grupo da academia, 18/11/2026). Ela entra na carga inicial:
  - Segunda e quarta: 12h30, 19h, 20h
  - Terça e quinta: 07h, 19h, 20h
  - Sexta: 12h30, 19h
  - Sábado: 10h
  - Professores, programa (GB1/GB2) e duração **não são conhecidos**. As turmas entram com programa "a definir", professor vazio e duração padrão de 60 min. Os dois completam pela tela Grade com o tempo.
- Fotos de perfil e dados pessoais dos dois.

## 12. Decidido pelo construtor

- Tecnologia do front-end: **HTML, CSS e JavaScript puros**, com o SDK do Firebase (módulos), sem framework, igual ao Compras da Família. Leve e fácil de manter.
- PWA: manifest, ícone (a versão só com o triângulo) e cor do tema. Um service worker simples é opcional.
- Gráficos (anel, meia-lua e radar) em SVG feito à mão, sem biblioteca, como no mockup.
- Compressão de imagem no navegador antes do envio (canvas → JPEG), qualquer que seja a opção de fotos.
- Estrutura de pastas, nomes de arquivos e deploy na Vercel a critério do construtor.
