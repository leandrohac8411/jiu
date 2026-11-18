// Leitura e gravação no Firestore. Formato dos documentos: docs/superpowers/specs (seção 10).
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

const usuario = uid => doc(db, "usuarios", uid);
const sub = (uid, nome) => collection(db, "usuarios", uid, nome);

/* ---------- Perfil ---------- */
export const PERFIL_PADRAO = nome => ({
  nome, faixa: { cor: "azul", desde: "2026-11" }, graus: [], metaSemanal: 2, metaAulasRoxa: 175,
  nascimento: null, sexo: null, telefone: "", fotoPerfilId: null
});

export function ouvirPerfil(uid, nome, cb) {
  return onSnapshot(usuario(uid), snap => {
    if (!snap.exists()) { setDoc(usuario(uid), PERFIL_PADRAO(nome)); return; }
    cb({ ...PERFIL_PADRAO(nome), ...snap.data() });
  });
}
export const salvarPerfil = (uid, parcial) => setDoc(usuario(uid), parcial, { merge: true });

/* ---------- Aulas ---------- */
export function ouvirAulas(uid, cb) {
  return onSnapshot(sub(uid, "aulas"), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
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
export function ouvirGrade(cb) {
  return onSnapshot(collection(db, "grade"), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function salvarTurma(turma) {
  const { id, ...dados } = turma;
  if (id) { await setDoc(doc(db, "grade", id), dados); return id; }
  return (await addDoc(collection(db, "grade"), dados)).id;
}
export const excluirTurma = id => deleteDoc(doc(db, "grade", id));

/* ---------- Currículo (compartilhado) ---------- */
export function ouvirCurriculo(cb) {
  return onSnapshot(collection(db, "curriculo"), snap => {
    const mapa = {};
    snap.docs.forEach(d => { mapa[d.id] = d.data(); });
    cb(mapa);
  });
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
export function ouvirAncoras(cb) {
  return onSnapshot(cfgCiclo(), snap => cb(snap.exists() ? (snap.data().ancoras || []) : null));
}
export async function adicionarAncora(ancora) {
  const snap = await getDoc(cfgCiclo());
  const ancoras = snap.exists() ? (snap.data().ancoras || []) : [];
  await setDoc(cfgCiclo(), { ancoras: [...ancoras, ancora] });
}

/* ---------- Carga inicial (grade real + âncoras), só se ainda não existir ---------- */
export async function cargaInicial(grade, ancoras) {
  const snap = await getDoc(cfgCiclo());
  if (snap.exists()) return false;
  const lote = writeBatch(db);
  grade.forEach(t => lote.set(doc(collection(db, "grade")), t));
  lote.set(cfgCiclo(), { ancoras });
  await lote.commit();
  return true;
}

export { updateDoc };
