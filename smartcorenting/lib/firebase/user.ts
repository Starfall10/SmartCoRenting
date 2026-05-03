import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import { UserData } from "@/types";

// Check if user exists in Firestore
export async function checkUserExists(uid: string): Promise<boolean> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
}

// Get user data from Firestore
export async function getUserData(uid: string): Promise<UserData | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
}

// Create new user in Firestore
export async function createUser(
  uid: string,
  email: string,
  displayName?: string,
  photoURL?: string,
): Promise<UserData> {
  const userRef = doc(db, "users", uid);

  const newUser: UserData = {
    uid,
    email,
    displayName: displayName || "",
    photoURL,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profileComplete: false,
    profileStep: 1,
    lifestyleTags: [],
    constraintTags: [],
    bio: "",
  };

  await setDoc(userRef, {
    ...newUser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newUser;
}

// Update user profile data
export async function updateUserProfile(
  uid: string,
  data: Partial<UserData>,
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Update profile step
export async function updateProfileStep(
  uid: string,
  step: number,
  profileComplete?: boolean,
): Promise<void> {
  const userRef = doc(db, "users", uid);

  const updateData: Record<string, unknown> = {
    profileStep: step,
    updatedAt: serverTimestamp(),
  };

  if (profileComplete !== undefined) {
    updateData.profileComplete = profileComplete;
  }

  await updateDoc(userRef, updateData);
}

// Add or remove lifestyle tags
export async function updateLifestyleTags(
  uid: string,
  tags: string[],
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    lifestyleTags: tags,
    updatedAt: serverTimestamp(),
  });
}

// Add or remove constraint tags
export async function updateConstraintTags(
  uid: string,
  tags: string[],
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    constraintTags: tags,
    updatedAt: serverTimestamp(),
  });
}

// Update bio
export async function updateBio(uid: string, bio: string): Promise<void> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    bio,
    updatedAt: serverTimestamp(),
  });
}
