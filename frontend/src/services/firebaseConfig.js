import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Configuração do Firebase conforme melhores práticas
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "atelie-aruanda.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "atelie-aruanda",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "atelie-aruanda.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "dummy"
};

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "dummy";

let app, auth, googleProvider;

if (isConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} else {
    console.warn("[Firebase] API Key não configurada. Google Login não funcionará até que as chaves sejam adicionadas ao .env");
    auth = { currentUser: null }; // Mock básico para evitar erros de undefined
    googleProvider = {};
}

export { auth, googleProvider };
