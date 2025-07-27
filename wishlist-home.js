import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCu7e5RFNq0wN1bGjTsnvwfO56X5o-Unec",
  authDomain: "ecommerce-7fdf4.firebaseapp.com",
  projectId: "ecommerce-7fdf4",
  storageBucket: "ecommerce-7fdf4.appspot.com",
  messagingSenderId: "643607180188",
  appId: "1:643607180188:web:a5db7f7831f27fef418e59"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Load wishlist to home page
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const wishlistRef = collection(db, "users", user.uid, "wishlist");
  const snapshot = await getDocs(wishlistRef);
  const wishlistGrid = document.getElementById("wishlist-home-grid");

  if (!wishlistGrid) return;

  if (snapshot.empty) {
    wishlistGrid.innerHTML = "<p>No wishlist items to show.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const item = docSnap.data();

    const card = document.createElement("div");
    card.className = "wishlist-card";
    card.innerHTML = `
      <img src="${item.image || 'default.jpg'}" alt="${item.name}" style="width: 100px; height: 100px;" />
      <h4>${item.name}</h4>
      <p>₹${item.price}</p>
    `;

    wishlistGrid.appendChild(card);
  });
});
