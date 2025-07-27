import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
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

window.addEventListener("DOMContentLoaded", () => {
  const cartGrid = document.getElementById("cart-grid");
  const totalAmountDisplay = document.getElementById("total-amount");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!cartGrid || !totalAmountDisplay || !placeOrderBtn) {
    console.error("Missing required HTML elements.");
    return;
  }

  let total = 0;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      cartGrid.innerHTML = "<p>Please log in to view your cart.</p>";
      return;
    }

    try {
      const cartRef = collection(db, "users", user.uid, "cart");
      const snapshot = await getDocs(cartRef);

      if (snapshot.empty) {
        cartGrid.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }

      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const itemId = docSnap.id;
        const itemPrice = Number(item.price) || 0;

        total += itemPrice;

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <p>₹${itemPrice.toLocaleString()}</p>
          <button class="remove-btn" data-id="${itemId}" data-price="${itemPrice}">Remove</button>
        `;
        cartGrid.appendChild(card);
      });

      totalAmountDisplay.textContent = `Total: ₹${total.toLocaleString()}`;
    } catch (error) {
      console.error("Error loading cart:", error);
      cartGrid.innerHTML = "<p>Error loading cart. Try again later.</p>";
    }
  });

  // Remove from cart
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const itemId = e.target.getAttribute("data-id");
      const user = auth.currentUser;
      if (!user) return;

      try {
        await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
        alert("Item removed!");
        location.reload();
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  });

  // Place Order + Invoice
  placeOrderBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const invoiceWindow = window.open("", "_blank");

    try {
      const cartRef = collection(db, "users", user.uid, "cart");
      const snapshot = await getDocs(cartRef);

      let orderTotal = 0;
      const orderItems = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const itemPrice = Number(data.price) || 0;
        orderTotal += itemPrice;
        orderItems.push(data);
      }

      if (orderItems.length === 0) {
        alert("Your cart is empty!");
        invoiceWindow.close();
        return;
      }

      const deliveryCharge = 50;
      const grandTotal = orderTotal + deliveryCharge;

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: orderItems,
        total: grandTotal,
        timestamp: Date.now()
      });

      const invoiceHTML = `
        <html>
          <head>
            <title>Order Invoice</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
              .total { font-weight: bold; }
              .download-btn { margin-top: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <h2>DressCart - Order Invoice</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>User:</strong> ${user.email}</p>

            <table>
              <thead>
                <tr><th>Item</th><th>Price (₹)</th></tr>
              </thead>
              <tbody>
                ${orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>₹${Number(item.price).toLocaleString()}</td>
                  </tr>
                `).join("")}
                <tr class="total">
                  <td>Subtotal</td>
                  <td>₹${orderTotal.toLocaleString()}</td>
                </tr>
                <tr class="total">
                  <td>Delivery Charge</td>
                  <td>₹${deliveryCharge}</td>
                </tr>
                <tr class="total">
                  <td>Grand Total</td>
                  <td>₹${grandTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="download-btn">
              <button onclick="window.print()">🧾 Download / Print Bill</button>
            </div>
          </body>
        </html>
      `;

      invoiceWindow.document.open();
      invoiceWindow.document.write(invoiceHTML);
      invoiceWindow.document.close();

      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "cart", docSnap.id));
      }

    } catch (error) {
      console.error("Error placing order:", error);
      invoiceWindow.document.body.innerHTML = "<p>Failed to generate invoice.</p>";
    }
  });
});
