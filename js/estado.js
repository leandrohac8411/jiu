// Dados vivos do usuário logado: perfil, aulas, grade, currículo e âncoras.
// Avisa o app (onMudar) a cada mudança; "pronto" vira true quando tudo chegou uma vez.
import { ouvirPerfil, ouvirAulas, ouvirGrade, ouvirCurriculo, ouvirAncoras, cargaInicial } from "./dados.js";
import { GRADE_INICIAL, ANCORAS_INICIAIS } from "./carga.js";

export function iniciarEstado(usuario, onMudar) {
  const e = {
    uid: usuario.uid, email: usuario.email, nome: usuario.nome,
    perfil: null, aulas: null, grade: null, curriculo: null, ancoras: null, pronto: false
  };
  const tentarPronto = () => {
    e.pronto = [e.perfil, e.aulas, e.grade, e.curriculo, e.ancoras].every(x => x !== null);
    onMudar();
  };
  const paradas = [
    ouvirPerfil(e.uid, e.nome, p => { e.perfil = p; tentarPronto(); }),
    ouvirAulas(e.uid, l => { e.aulas = l; tentarPronto(); }),
    ouvirGrade(l => { e.grade = l; tentarPronto(); }),
    ouvirCurriculo(m => { e.curriculo = m; tentarPronto(); }),
    ouvirAncoras(a => {
      if (a === null) { cargaInicial(GRADE_INICIAL, ANCORAS_INICIAIS).catch(console.error); return; }
      e.ancoras = a; tentarPronto();
    })
  ];
  e.parar = () => paradas.forEach(p => p());
  return e;
}
