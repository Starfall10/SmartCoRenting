import {
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./client";
import { UserData } from "@/types";
import {
  MatchResult,
  StoredMatchResult,
  findMatches,
  isMatchCacheStale,
  ALGORITHM_VERSION,
} from "@/lib/matchmaking/algorithm";

/**
 * Get all users with completed profiles
 */
export async function getAllCompletedUsers(): Promise<UserData[]> {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const users: UserData[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data() as UserData;
    if (data.profileComplete) {
      users.push(data);
    }
  });

  return users;
}

/**
 * Remove undefined values from an object recursively
 */
function sanitizeForFirestore<T extends object>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // Skip undefined values
    } else if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      result[key] = sanitizeForFirestore(value as object);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Store match results for a user
 */
export async function storeMatchResults(
  userId: string,
  matches: MatchResult[],
): Promise<void> {
  // Clear existing matches first
  const matchesRef = collection(db, "matches", userId, "results");
  const existingMatches = await getDocs(matchesRef);

  const deletePromises: Promise<void>[] = [];
  existingMatches.forEach((doc) => {
    deletePromises.push(deleteDoc(doc.ref));
  });
  await Promise.all(deletePromises);

  // Store new matches (sanitize to remove undefined values)
  const storePromises = matches.map((match) => {
    const pairId = `${userId}_${match.candidateId}`;
    const storedMatch: StoredMatchResult = {
      ...match,
      pairId,
      sourceUserId: userId,
    };

    const matchDoc = doc(db, "matches", userId, "results", match.candidateId);
    return setDoc(matchDoc, sanitizeForFirestore(storedMatch));
  });

  await Promise.all(storePromises);
}

/**
 * Get cached match results for a user
 */
export async function getCachedMatches(
  userId: string,
): Promise<StoredMatchResult[]> {
  const matchesRef = collection(db, "matches", userId, "results");
  const q = query(matchesRef, orderBy("compatibilityScore", "desc"));
  const snapshot = await getDocs(q);

  const matches: StoredMatchResult[] = [];
  snapshot.forEach((doc) => {
    matches.push(doc.data() as StoredMatchResult);
  });

  return matches;
}

/**
 * Find matches for a user - main entry point
 * Handles caching logic
 */
export async function findMatchesForUser(
  currentUser: UserData,
  forceRefresh: boolean = false,
): Promise<MatchResult[]> {
  // If not forcing refresh, try to get cached matches
  if (!forceRefresh) {
    const cachedMatches = await getCachedMatches(currentUser.uid);

    if (cachedMatches.length > 0) {
      // Get all users to check staleness
      const allUsers = await getAllCompletedUsers();
      const userMap = new Map(allUsers.map((u) => [u.uid, u]));

      // Check if any cached match is stale
      let anyStale = false;
      for (const match of cachedMatches) {
        const candidate = userMap.get(match.candidateId);
        if (
          !candidate ||
          isMatchCacheStale(match, currentUser, candidate, ALGORITHM_VERSION)
        ) {
          anyStale = true;
          break;
        }
      }

      // If no stale matches, return cached results
      if (!anyStale) {
        return cachedMatches;
      }
    }
  }

  // Compute fresh matches
  const allUsers = await getAllCompletedUsers();
  const matches = findMatches(currentUser, allUsers);

  // Store results
  await storeMatchResults(currentUser.uid, matches);

  return matches;
}
