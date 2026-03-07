/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import {
  findMatches,
  MatchResult,
  StoredMatchResult,
  ALGORITHM_VERSION,
} from "@/lib/matchmaking/algorithm";
import {
  UserData,
  HardConstraintFilters,
  DEFAULT_HARD_CONSTRAINT_FILTERS,
} from "@/types";

/**
 * Remove undefined values from an object recursively for Firestore compatibility
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
 * POST /api/matches/find
 * Find matches for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      forceRefresh = false,
      filters = DEFAULT_HARD_CONSTRAINT_FILTERS,
    } = body;

    // Merge provided filters with defaults (in case some are missing)
    const activeFilters: HardConstraintFilters = {
      ...DEFAULT_HARD_CONSTRAINT_FILTERS,
      ...filters,
    };

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    // Get current user
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const currentUser = userDoc.data() as UserData;

    if (!currentUser.profileComplete) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete your profile before finding matches",
        },
        { status: 400 },
      );
    }

    // Check for cached matches if not forcing refresh
    if (!forceRefresh) {
      const cachedMatchesSnapshot = await adminDb
        .collection("matches")
        .doc(userId)
        .collection("results")
        .orderBy("compatibilityScore", "desc")
        .get();

      if (!cachedMatchesSnapshot.empty) {
        const cachedMatches: StoredMatchResult[] = [];
        cachedMatchesSnapshot.forEach((doc) => {
          cachedMatches.push(doc.data() as StoredMatchResult);
        });

        // Check if cache is stale
        const candidateIds = cachedMatches.map((m) => m.candidateId);
        const candidateDocs = await Promise.all(
          candidateIds.map((id) => adminDb.collection("users").doc(id).get()),
        );

        let anyStale = false;
        for (let i = 0; i < cachedMatches.length; i++) {
          const match = cachedMatches[i];
          const candidateDoc = candidateDocs[i];

          if (!candidateDoc.exists) {
            anyStale = true;
            break;
          }

          const candidate = candidateDoc.data() as UserData;

          // Check algorithm version
          if (match.algorithmVersion !== ALGORITHM_VERSION) {
            anyStale = true;
            break;
          }

          // Check profile updates
          if (match.sourceProfileUpdatedAt !== currentUser.updatedAt) {
            anyStale = true;
            break;
          }

          if (match.candidateProfileUpdatedAt !== candidate.updatedAt) {
            anyStale = true;
            break;
          }
        }

        if (!anyStale) {
          return NextResponse.json({
            success: true,
            matches: cachedMatches,
            cached: true,
          });
        }
      }
    }

    // Get all users with completed profiles
    const usersSnapshot = await adminDb.collection("users").get();
    const candidates: UserData[] = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data() as UserData;
      if (data.profileComplete && data.uid !== userId) {
        candidates.push(data);
      }
    });

    // Compute matches with user's filter settings
    const matches = findMatches(currentUser, candidates, activeFilters);

    // Store matches in Firestore
    const batch = adminDb.batch();

    // Delete existing matches
    const existingMatchesSnapshot = await adminDb
      .collection("matches")
      .doc(userId)
      .collection("results")
      .get();

    existingMatchesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new matches
    for (const match of matches) {
      const pairId = `${userId}_${match.candidateId}`;
      const storedMatch: StoredMatchResult = {
        ...match,
        pairId,
        sourceUserId: userId,
      };

      const matchRef = adminDb
        .collection("matches")
        .doc(userId)
        .collection("results")
        .doc(match.candidateId);

      batch.set(matchRef, sanitizeForFirestore(storedMatch));
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      matches,
      cached: false,
      totalCandidates: candidates.length,
      matchesFound: matches.length,
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error finding matches: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
