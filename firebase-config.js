// 🔥 REPLACE WITH YOUR OWN FIREBASE PROJECT CONFIGURATION 🔥
const firebaseConfig = {
  apiKey: "AIzaSyDzLt4w6zhcChOp-fGFXi-2CiN-9s45d0g",
  authDomain: "tennis-match-d2552.firebaseapp.com",
  projectId: "tennis-match-d2552",
  storageBucket: "tennis-match-d2552.firebasestorage.app",
  messagingSenderId: "1083617593042",
  appId: "1:1083617593042:web:09c12b7454d67a2421cf0b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();