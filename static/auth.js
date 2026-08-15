/**
 * auth.js — PayGuard-Neural Centralized Firebase Auth Helper
 *
 * Shared across login.html, police_login.html, admin_login.html.
 * Handles:
 *  - Firebase init
 *  - Google Sign-In (User + Police portals)
 *  - Email/Password Sign-In (Admin portal only)
 *  - ID token retrieval for backend calls
 *  - Role-based redirect after sign-in
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_aZZLulzIeee8ZEObGmZO05y0-1n8MTI",
  authDomain: "payguard-neural.firebaseapp.com",
  projectId: "payguard-neural",
  storageBucket: "payguard-neural.firebasestorage.app",
  messagingSenderId: "11883234406",
  appId: "1:11883234406:web:9d10e337019ef8236799a7"
};

const app    = initializeApp(firebaseConfig);
const auth   = getAuth(app);
const db     = getFirestore(app);
const gprov  = new GoogleAuthProvider();

// ── Helpers ───────────────────────────────────────────────────────

/** Returns the current user's Firebase ID token (for backend calls). */
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken(true);
}

/**
 * Ensures a Firestore user doc exists for a newly signed-in user.
 * Role defaults to "user" — NEVER "admin" or "police" from client.
 */
async function ensureUserDoc(user) {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email:       user.email,
      displayName: user.displayName || "",
      role:        "user",
      kycStatus:   "pending",
      createdAt:   serverTimestamp()
    });
  }
  return (await getDoc(ref)).data();
}

/**
 * Calls /api/police/verify-allowlist to check if the signed-in
 * Google email is in the police_allowlist collection and, if so,
 * updates the user's role server-side.
 * Returns true if user is a valid officer.
 */
async function checkPoliceAllowlist(token) {
  try {
    const res = await fetch("/api/police/verify-allowlist", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    return data.is_officer === true;
  } catch {
    return false;
  }
}

// ── Google Sign-In (User portal) ──────────────────────────────────

export async function googleSignInUser() {
  try {
    const result = await signInWithPopup(auth, gprov);
    const user   = result.user;
    const token  = await user.getIdToken(true);
    const data   = await ensureUserDoc(user);

    // If the user somehow already has a police/admin role, send them there
    if (data.role === "admin")  { window.location.href = "admin_panel.html"; return; }
    if (data.role === "police") { window.location.href = "police.html"; return; }

    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Google Sign-In failed:", err);
    showError("Google Sign-In failed. Please try again.");
  }
}

// ── Google Sign-In (Police portal) ───────────────────────────────

export async function googleSignInPolice() {
  try {
    const result = await signInWithPopup(auth, gprov);
    const user   = result.user;
    await ensureUserDoc(user);
    const token  = await user.getIdToken(true);

    const isOfficer = await checkPoliceAllowlist(token);

    if (!isOfficer) {
      await signOut(auth);
      showError(
        "Access Denied — this Google account is not on the authorized police allowlist. " +
        "Contact your Cyber Cell IT administrator."
      );
      return;
    }

    window.location.href = "police.html";
  } catch (err) {
    console.error("Police Google Sign-In failed:", err);
    showError("Sign-In failed. Please try again.");
  }
}

// ── Email/Password (Admin portal only) ───────────────────────────

export async function emailPasswordSignInAdmin(email, password) {
  try {
    const cred  = await signInWithEmailAndPassword(auth, email, password);
    const user  = cred.user;
    const token = await user.getIdToken(true);

    // Verify role = "admin" from the backend (never trust client-side)
    const res  = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    if (!data.is_admin) {
      await signOut(auth);
      showError("Access Denied — this account does not have admin privileges.");
      return;
    }

    window.location.href = "admin_panel.html";
  } catch (err) {
    console.error("Admin login failed:", err);
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
      showError("Invalid email or password.");
    } else {
      showError("Login failed. Please try again.");
    }
  }
}

// ── Sign Out ──────────────────────────────────────────────────────

export async function signOutUser() {
  await signOut(auth);
  window.location.href = "login.html";
}

// ── Auth State Observer ───────────────────────────────────────────

/**
 * Call this on protected pages (dashboard, police, admin).
 * Redirects to the correct login if not authenticated or wrong role.
 */
export function requireAuth(expectedRole, loginPage = "login.html") {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = loginPage;
      return;
    }
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists() || snap.data().role !== expectedRole) {
      await signOut(auth);
      window.location.href = loginPage;
    }
  });
  return auth;
}

// ── Utility ───────────────────────────────────────────────────────

function showError(msg) {
  const el = document.getElementById("auth-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  } else {
    alert(msg);
  }
}

export { auth, db };
