// Leitura e gravação no Firestore. Formato dos documentos: docs/superpowers/specs (seção 10).
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, writeBatch, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

const usuario = uid => doc(db, "usuarios", uid);
const sub = (uid, nome) => collection(db, "usuarios", uid, nome);

/* ---------- Perfil ---------- */
export const PERFIL_PADRAO = nome => ({
  nome, faixa: { cor: "azul", desde: "2026-11" }, graus: [], metaSemanal: 2, metaAulasRoxa: 175,
  nascimento: null, sexo: null, telefone: "", fotoPerfilId: null
});

// Cria o perfil padrão só quando o SERVIDOR confirma que ele não existe
// (uma leitura do cache vazio num celular novo não pode apagar o perfil real).
export function ouvirPerfil(uid, nome, cb, erro) {
  return onSnapshot(usuario(uid), { includeMetadataChanges: true }, snap => {
    if (snap.exists()) { cb({ ...PERFIL_PADRAO(nome), ...snap.data() }); return; }
    if (snap.metadata.fromCache) return;
    runTransaction(db, async tx => {
      const atual = await tx.get(usuario(uid));
      if (!atual.exists()) tx.set(usuario(uid), PERFIL_PADRAO(nome));
    }).catch(erro);
  }, erro);
}
export const salvarPerfil = (uid, parcial) => setDoc(usuario(uid), parcial, { merge: true });

/* ---------- Aulas ---------- */
export function ouvirAulas(uid, cb, erro) {
  return onSnapshot(sub(uid, "aulas"), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), erro);
}
export async function salvarAula(uid, aula) {
  const { id, ...dados } = aula;
  if (id) { await setDoc(doc(sub(uid, "aulas"), id), dados); return id; }
  const ref = await addDoc(sub(uid, "aulas"), { ...dados, criadoEm: serverTimestamp() });
  return ref.id;
}
export const excluirAula = (uid, id) => deleteDoc(doc(sub(uid, "aulas"), id));

/* ---------- Fotos (base64, um documento por foto) ---------- */
const cacheFotos = new Map();
export async function salvarFoto(uid, { aulaId = null, dados, largura, altura }) {
  const ref = await addDoc(sub(uid, "fotos"), { aulaId, dados, largura, altura, criadoEm: serverTimestamp() });
  cacheFotos.set(ref.id, dados);
  return ref.id;
}
export async function lerFoto(uid, id) {
  if (!id) return null;
  if (cacheFotos.has(id)) return cacheFotos.get(id);
  const snap = await getDoc(doc(sub(uid, "fotos"), id));
  const dados = snap.exists() ? snap.data().dados : null;
  cacheFotos.set(id, dados);
  return dados;
}
export async function excluirFoto(uid, id) {
  if (!id) return;
  cacheFotos.delete(id);
  await deleteDoc(doc(sub(uid, "fotos"), id));
}

/* ---------- Peso ---------- */
export async function listarPesos(uid) {
  const snap = await getDocs(query(sub(uid, "pesos"), orderBy("data", "desc"), limit(20)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export const registrarPeso = (uid, { data, kg }) => addDoc(sub(uid, "pesos"), { data, kg });

/* ---------- Grade (compartilhada) ---------- */
export function ouvirGrade(cb, erro) {
  return onSnapshot(collection(db, "grade"), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), erro);
}
export async function salvarTurma(turma) {
  const { id, ...dados } = turma;
  if (id) { await setDoc(doc(db, "grade", id), dados); return id; }
  return (await addDoc(collection(db, "grade"), dados)).id;
}
export const excluirTurma = id => deleteDoc(doc(db, "grade", id));

/* ---------- Currículo (compartilhado) ---------- */
export function ouvirCurriculo(cb, erro) {
  return onSnapshot(collection(db, "curriculo"), snap => {
    const mapa = {};
    snap.docs.forEach(d => { mapa[d.id] = d.data(); });
    cb(mapa);
  }, erro);
}
export const chaveCurriculo = (programa, semana) => `${programa}-${semana}`;
export function salvarCurriculo(programa, semana, aula, { tema, tecnicas }) {
  return setDoc(doc(db, "curriculo", chaveCurriculo(programa, semana)),
    { programa, semana, [`aula${aula}`]: { tema, tecnicas } }, { merge: true });
}
export async function importarCurriculo(lista) {
  const lote = writeBatch(db);
  for (const s of lista) {
    lote.set(doc(db, "curriculo", chaveCurriculo(s.programa, s.semana)),
      { programa: s.programa, semana: s.semana, aulaA: s.aulaA || null, aulaB: s.aulaB || null });
  }
  await lote.commit();
}

/* ---------- Ciclo (compartilhado) ---------- */
const cfgCiclo = () => doc(db, "config", "ciclo");
export function ouvirAncoras(cb, erro) {
  return onSnapshot(cfgCiclo(), { includeMetadataChanges: true }, snap => {
    if (snap.exists()) cb(snap.data().ancoras || []);
    else if (!snap.metadata.fromCache) cb(null); // null = o servidor confirmou que não existe
  }, erro);
}
export async function adicionarAncora(ancora) {
  const snap = await getDoc(cfgCiclo());
  const ancoras = snap.exists() ? (snap.data().ancoras || []) : [];
  await setDoc(cfgCiclo(), { ancoras: [...ancoras, ancora] });
}

/* ---------- Carga inicial (grade real + âncoras), só se ainda não existir ---------- */
// Transação + IDs fixos: dois aparelhos fazendo o primeiro login juntos não duplicam a grade.
let cargando = null;
export function cargaInicial(grade, ancoras, idTurma) {
  cargando ??= runTransaction(db, async tx => {
    const snap = await tx.get(cfgCiclo());
    if (snap.exists()) return false;
    grade.forEach(t => tx.set(doc(db, "grade", idTurma(t)), t));
    tx.set(cfgCiclo(), { ancoras });
    return true;
  }).finally(() => { cargando = null; });
  return cargando;
}

export { updateDoc };
