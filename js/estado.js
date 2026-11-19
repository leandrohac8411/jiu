// Dados vivos do usuário logado: perfil, aulas, grade, currículo e âncoras.
// Avisa o app (onMudar) a cada mudança; "pronto" vira true quando tudo chegou uma vez.
import { ouvirPerfil, ouvirAulas, ouvirGrade, ouvirCurriculo, ouvirAncoras, cargaInicial } from "./dados.js";
import { GRADE_INICIAL, ANCORAS_INICIAIS, idTurma } from "./carga.js";

export function iniciarEstado(usuario, onMudar) {
  const e = {
    uid: usuario.uid, email: usuario.email, nome: usuario.nome,
    perfil: null, aulas: null, grade: null, curriculo: null, ancoras: null, pronto: false, erro: null
  };
  const tentarPronto = () => {
    e.pronto = [e.perfil, e.aulas, e.grade, e.curriculo, e.ancoras].every(x => x !== null);
    onMudar();
  };
  const falhou = err => {
    console.error(err);
    e.erro = err?.code === "permission-denied"
      ? "Sem permissão para ler os dados. Confira as regras do Firestore."
      : "Não consegui carregar os dados. Confira a internet e abra o app de novo.";
    onMudar();
  };
  const paradas = [
    ouvirPerfil(e.uid, e.nome, p => { e.perfil = p; tentarPronto(); }, falhou),
    ouvirAulas(e.uid, l => { e.aulas = l; tentarPronto(); }, falhou),
    ouvirGrade(l => { e.grade = l; tentarPronto(); }, falhou),
    ouvirCurriculo(m => { e.curriculo = m; tentarPronto(); }, falhou),
    ouvirAncoras(a => {
      if (a === null) { cargaInicial(GRADE_INICIAL, ANCORAS_INICIAIS, idTurma).catch(falhou); return; }
      e.ancoras = a; tentarPronto();
    }, falhou)
  ];
  e.parar = () => paradas.forEach(p => p());
  return e;
}
