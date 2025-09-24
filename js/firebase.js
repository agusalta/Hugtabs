import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgAdTNk6wk6xMo54NxU74YqkqVJ6L2WF0",
  authDomain: "checkmate-urls.firebaseapp.com",
  projectId: "checkmate-urls",
  storageBucket: "checkmate-urls.firebasestorage.app",
  messagingSenderId: "1009049526624",
  appId: "1:1009049526624:web:ee795eedcc28c48533be05"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
