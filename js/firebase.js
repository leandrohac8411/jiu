import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, terminate, clearIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const configurado = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = configurado ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}) : null;

export const entrar = (email, senha) => signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
export const sair = () => signOut(auth);
// Sair de verdade: além de deslogar, apaga a cópia dos dados guardada no aparelho.
export async function sairELimpar() {
  await signOut(auth);
  try { await terminate(db); await clearIndexedDbPersistence(db); } catch { /* segue mesmo assim */ }
  location.replace(location.pathname);
}
export const redefinirSenha = email => sendPasswordResetEmail(auth, email.trim().toLowerCase());
export const aoMudarUsuario = cb => onAuthStateChanged(auth, cb);
