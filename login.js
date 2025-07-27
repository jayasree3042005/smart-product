// Firebase imports
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCu7e5RFNq0wN1bGjTsnvwfO56X5o-Unec",
  authDomain: "ecommerce-7fdf4.firebaseapp.com",
  projectId: "ecommerce-7fdf4",
  storageBucket: "ecommerce-7fdf4.appspot.com",
  messagingSenderId: "643607180188",
  appId: "1:643607180188:web:a5db7f7831f27fef418e59"
};

// Initialize Firebase only once
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const auth = getAuth();
const db = getFirestore();

// Toggle between Login and Signup
const toggleLink = document.getElementById("toggle-link");
const toggleText = document.getElementById("toggle-text");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const errorMessage = document.getElementById("error-message");

toggleLink.addEventListener("click", () => {
  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    formTitle.innerText = "Login";
    formSubtitle.innerText = "Welcome back! Please login to your account.";
    toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`;
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    formTitle.innerText = "Signup";
    formSubtitle.innerText = "Create an account to continue.";
    toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Login</a>`;
  }
});

// Re-attach event listener after innerHTML change
document.addEventListener("click", (e) => {
  if (e.target.id === "toggle-link") {
    toggleLink.click();
  }
});

// 🔐 Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra user details in Firestore (users → user.uid)
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      phone: phone,
      email: user.email,
      uid: user.uid
    });

    console.log("✅ User signed up & details saved to Firestore.");
    window.location.href = "home.html";
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    errorMessage.textContent = error.message;
  }
});

// 🔓 Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login successful.");
    window.location.href = "home.html";
  } catch (error) {
    console.error("❌ Login error:", error.message);
    errorMessage.textContent = error.message;
  }
});
