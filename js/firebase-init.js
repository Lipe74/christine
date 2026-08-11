/* ============================================
   FIREBASE – Initialisation partagée
   Projet partagé (phil-mobile / Lylou-Vely / Christine)
   Namespace Christine : christine/produits/items, christine/avis/items
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDagghvP8ujE0fdUcYsOfmLaXps2ZSUexo",
  authDomain: "phil-mobile.firebaseapp.com",
  projectId: "phil-mobile",
  storageBucket: "phil-mobile.firebasestorage.app",
  messagingSenderId: "193213939481",
  appId: "1:193213939481:web:f8a750e89f0e645b62cf88",
  measurementId: "G-6TJR9GTK90"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = (typeof firebase.auth === "function") ? firebase.auth() : null;
const storage = (typeof firebase.storage === "function") ? firebase.storage() : null;

// Chemins Firestore dédiés à Christine (namespace, même logique que lylou_vely)
const PRODUITS_COLLECTION = db.collection("christine").doc("produits").collection("items");
const AVIS_COLLECTION = db.collection("christine").doc("avis").collection("items");
