// products.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCu7e5RFNq0wN1bGjTsnvwfO56X5o-Unec",
  authDomain: "ecommerce-7fdf4.firebaseapp.com",
  projectId: "ecommerce-7fdf4",
  storageBucket: "ecommerce-7fdf4.firebasestorage.app",
  messagingSenderId: "643607180188",
  appId: "1:643607180188:web:a5db7f7831f27fef418e59"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productGrid = document.getElementById("product-grid");

async function loadProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    productGrid.innerHTML += `
      <div class="card">
        <img src="${data.image}" alt="${data.name}">
        <h3>${data.name}</h3>
        <p>₹${data.price}</p>
        <button onclick="addToCart('${doc.id}')">Add to Cart</button>
        <button onclick="addToWishlist('${doc.id}')">Add to Wishlist</button>
      </div>
    `;
  });
}

loadProducts();
