import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "./client";

// Sign up
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password); // :contentReference[oaicite:1]{index=1}
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

// Sign in
export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password); // :contentReference[oaicite:2]{index=2}
  return cred.user;
}

// Sign out
export async function signOutUser() {
  await signOut(auth);
}

// Reset password
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}
