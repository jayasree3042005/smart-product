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

window.addEventListener("DOMContentLoaded", () => {
  const cartGrid = document.getElementById("cart-grid");
  const totalAmountDisplay = document.getElementById("total-amount");
  const placeOrderBtn = document.getElementById("place-order-btn");

  const itemQuantities = {};

  const updateTotal = () => {
    let newTotal = 0;
    for (const id in itemQuantities) {
      newTotal += itemQuantities[id].price * itemQuantities[id].qty;
    }
    totalAmountDisplay.textContent = `Total: ₹${newTotal.toLocaleString()}`;
  };

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
        const price = Number(item.price);
        const qty = item.quantity || 1;

        itemQuantities[itemId] = { price, qty, ...item };

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <p>₹${price.toLocaleString()}</p>
          <div class="quantity-controls">
            <button class="qty-btn decrease" data-id="${itemId}">−</button>
            <span id="qty-${itemId}" class="qty-count">${qty}</span>
            <button class="qty-btn increase" data-id="${itemId}">+</button>
          </div>
          <button class="remove-btn" data-id="${itemId}">Remove</button>
        `;
        cartGrid.appendChild(card);
      });

      updateTotal();
    } catch (error) {
      console.error("Error loading cart:", error);
      cartGrid.innerHTML = "<p>Error loading cart. Try again later.</p>";
    }
  });

  document.addEventListener("click", async (e) => {
    const user = auth.currentUser;
    if (!user) return;

    const itemId = e.target.dataset.id;
    if (!itemId) return;

    const isIncrease = e.target.classList.contains("increase");
    const isDecrease = e.target.classList.contains("decrease");

    if (isIncrease || isDecrease) {
      const item = itemQuantities[itemId];
      let qty = item.qty;

      if (isIncrease) qty++;
      if (isDecrease && qty > 1) qty--;

      item.qty = qty;
      document.getElementById(`qty-${itemId}`).textContent = qty;
      updateTotal();

      try {
        await setDoc(doc(db, "users", user.uid, "cart", itemId), {
          ...item,
          quantity: qty
        });
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }

    if (e.target.classList.contains("remove-btn")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
        alert("Item removed!");
        location.reload();
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  });

  placeOrderBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = collection(db, "users", user.uid, "cart");
    const snapshot = await getDocs(cartRef);
    const invoiceWindow = window.open("", "_blank");

    let total = 0;
    const items = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const qty = data.quantity || 1;
      const price = Number(data.price);
      total += price * qty;
      items.push({ ...data, quantity: qty });
    }

    if (items.length === 0) {
      alert("Your cart is empty!");
      invoiceWindow.close();
      return;
    }

    const delivery = 50;
    const grandTotal = total + delivery;

    await addDoc(collection(db, "users", user.uid, "orders"), {
      items,
      total,
      deliveryCharge: delivery,
      grandTotal,
      timestamp: Date.now()
    });

    const invoiceHTML = `
      <html>
      <head><title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { color: #007bff; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #aaa; padding: 10px; text-align: center; }
          th { background: #f0f0f0; }
          button { margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <h2>DressCart — Invoice</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>₹${item.price}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price * item.quantity}</td>
            </tr>`).join("")}
          <tr><td colspan="3">Subtotal</td><td>₹${total}</td></tr>
          <tr><td colspan="3">Delivery</td><td>₹${delivery}</td></tr>
          <tr><td colspan="3"><strong>Grand Total</strong></td><td><strong>₹${grandTotal}</strong></td></tr>
        </table>
        <p>Thank you for shopping with us!</p>
        <button onclick="window.print()">Download Invoice</button>
      </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "users", user.uid, "cart", docSnap.id));
    }
  });
});
