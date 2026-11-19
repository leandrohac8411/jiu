// Configuração do Firebase (Console → Configurações do projeto → Seus apps → App da Web).
// Esses dados NÃO são secretos: quem protege os dados são as regras em firestore.rules.
export const firebaseConfig = {
  apiKey: "AIzaSyDfglMByRyDG0zVsiquSsyb5-SJcog0llE",
  authDomain: "jiujitsu-60836.firebaseapp.com",
  projectId: "jiujitsu-60836",
  storageBucket: "jiujitsu-60836.firebasestorage.app",
  messagingSenderId: "545024143966",
  appId: "1:545024143966:web:4a7ae93cd3d93556babacf"
};

// Só estes e-mails entram (em minúsculas). Use os MESMOS em firestore.rules.
export const USERS = {
  "leandrohacarvalho@gmail.com": "Leandro",
  "strandrade@gmail.com": "Stephany"
};
