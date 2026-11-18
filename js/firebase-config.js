// Configuração do Firebase (Console → Configurações do projeto → Seus apps → App da Web).
// Esses dados NÃO são secretos: quem protege os dados são as regras em firestore.rules.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Só estes e-mails entram (em minúsculas). Use os MESMOS em firestore.rules.
export const USERS = {
  "leandrohacarvalho@gmail.com": "Leandro",
  "strandrade@gmail.com": "Stephany"
};
