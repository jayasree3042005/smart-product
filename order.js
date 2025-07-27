import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase Config
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
const db = getFirestore(app);

// Load products
const productList = document.getElementById("product-list");

const loadProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    const item = doc.data();
    const productBox = document.createElement("div");
    productBox.className = "product-box";

    productBox.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="product-info">
        <label>
          <input type="checkbox" name="product" value="${item.name}-${item.price}" />
          ${item.name} - ₹${item.price}
        </label>
      </div>
    `;

    productList.appendChild(productBox);
  });
};

loadProducts();

// Calculate total on submit
document.getElementById("order-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const checkboxes = document.querySelectorAll('input[name="product"]:checked');
  let total = 0;
  const selectedItems = [];

  checkboxes.forEach((cb) => {
    const [name, price] = cb.value.split("-");
    total += parseInt(price);
    selectedItems.push({ name, price: parseInt(price) });
  });

  document.getElementById("total-display").textContent = `Total: ₹${total}`;
  localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
});
