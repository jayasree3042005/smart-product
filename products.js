// products.js (for index.html homepage - shows only featured dresses)
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const productGrid = document.getElementById("product-grid");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const querySnapshot = await getDocs(collection(db, "products"));
  const products = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    data.id = docSnap.id;
    products.push(data);

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${data.image}" alt="${data.name}" />
      <h3>${data.name}</h3>
      <p>₹${data.price}</p>
      <div class="product-actions">
        <button onclick="addToCart('${data.id}')">Add to Cart</button>
        <button onclick="addToWishlist('${data.id}')">Add to Wishlist</button>
      </div>
    `;
    productGrid.appendChild(card);
  });

  window.addToCart = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    await setDoc(doc(db, "users", user.uid, "cart", id), product);
    alert("Added to cart!");
  };

  window.addToWishlist = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    await setDoc(doc(db, "users", user.uid, "wishlist", id), product);
    alert("Added to wishlist!");
  };
});
