import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

const env = import.meta.env || {};
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || ""
};

const configured = Object.values(config).every(
  value => typeof value === "string" && value.trim().length > 0
);

let auth = null;

function getFirebaseAuth() {
  if (!configured) {
    throw new Error("Firebase setup incomplete. Configure the VITE_FIREBASE environment variables first.");
  }

  const app = getApps().length ? getApps()[0] : initializeApp(config);
  auth = getAuth(app);
  return auth;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(getFirebaseAuth(), provider);
}

export async function loginWithFacebook() {
  return signInWithPopup(getFirebaseAuth(), new FacebookAuthProvider());
}

export async function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email.trim(),
    password
  );
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(
    getFirebaseAuth(),
    email.trim(),
    password
  );
}

export async function resetEmailPassword(email) {
  return sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export function watchAuthState(callback, onError) {
  try {
    return onAuthStateChanged(getFirebaseAuth(), callback, onError);
  } catch (error) {
    onError?.(error);
    return () => {};
  }
}

export async function logout() {
  return signOut(getFirebaseAuth());
}

export function isFirebaseConfigured() {
  return configured;
}
