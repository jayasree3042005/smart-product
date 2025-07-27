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
  deleteDoc
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

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const wishlistContainer = document.getElementById("wishlist-items");

  if (!wishlistContainer) {
    console.error("Element with id 'wishlist-items' not found.");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      wishlistContainer.innerHTML = "<p>Please sign in to view your wishlist.</p>";
      return;
    }

    try {
      const wishlistRef = collection(db, "users", user.uid, "wishlist");
      const snapshot = await getDocs(wishlistRef);

      if (snapshot.empty) {
        wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
        return;
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${data.image}" alt="${data.name}" />
          <h3>${data.name}</h3>
          <p>₹${Number(data.price).toLocaleString()}</p>
          <div class="product-actions">
            <button onclick="removeFromWishlist('${docSnap.id}')">Remove</button>
          </div>
        `;
        wishlistContainer.appendChild(card);
      });

      // Remove from wishlist function (global so it can be called from HTML button)
      window.removeFromWishlist = async (id) => {
        await deleteDoc(doc(db, "users", user.uid, "wishlist", id));
        alert("Removed from wishlist!");
        location.reload();
      };
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      wishlistContainer.innerHTML = "<p>Error loading wishlist. Try again later.</p>";
    }
  });
});
