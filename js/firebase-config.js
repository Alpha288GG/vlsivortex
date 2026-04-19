const firebaseConfig = {
  apiKey: "AIzaSyDpbkiZ7p9WEqJYDc4kWDScWZrgQFg6RZw",
  authDomain: "vlsivortex.firebaseapp.com",
  projectId: "vlsivortex",
  storageBucket: "vlsivortex.firebasestorage.app",
  messagingSenderId: "715462443275",
  appId: "1:715462443275:web:5f0d4ac564c7c33829220e",
  measurementId: "G-88J9VCZELV"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
