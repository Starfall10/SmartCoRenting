import {
  UserData,
  HardConstraintFilters,
  DEFAULT_HARD_CONSTRAINT_FILTERS,
} from "@/types";

export const ALGORITHM_VERSION = "1.0.0";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SimilarityBreakdown {
  smoking: number;
  pets: number;
  sleepSchedule: number;
  cleanliness: number;
  noiseTolerance: number;
  workHabits: number;
  socialLifestyle: number;
  guestFrequency: number;
  cookingFrequency: number;
  personalSpace: number;
  activityLevel: number;
}

export interface MatchExplanation {
  compatibilityScore: number;
  summary: string;
  strongFactors: string[];
  weakFactors: string[];
  fullMessage: string;
}

export interface MatchResult {
  candidateId: string;
  candidateData: {
    displayName: string;
    email: string;
    photoURL?: string;
    gender?: string;
    preferredLocation?: string;
    monthlyBudget?: string;
    moveInDate?: string;
    lengthOfStay?: string;
    propertyType?: string;
  };
  compatibilityScore: number;
  similarityBreakdown: SimilarityBreakdown;
  explanation: MatchExplanation;
  calculatedAt: string;
  sourceProfileUpdatedAt: string;
  candidateProfileUpdatedAt: string;
  algorithmVersion: string;
}

export interface StoredMatchResult extends MatchResult {
  pairId: string;
  sourceUserId: string;
}

// ============================================================================
// SOFT CONSTRAINT WEIGHTS
// ============================================================================

const SOFT_CONSTRAINT_WEIGHTS: Record<keyof SimilarityBreakdown, number> = {
  smoking: 2.0, // Binary - high importance
  pets: 2.0, // Binary - high importance
  sleepSchedule: 1.5,
  cleanliness: 1.5,
  noiseTolerance: 1.2,
  workHabits: 1.0,
  socialLifestyle: 1.0,
  guestFrequency: 1.0,
  cookingFrequency: 0.8,
  personalSpace: 1.0,
  activityLevel: 0.8,
};

// ============================================================================
// FACTOR LABEL MAPPING
// ============================================================================

export const FACTOR_LABELS: Record<keyof SimilarityBreakdown, string> = {
  sleepSchedule: "sleep schedule",
  cleanliness: "cleanliness",
  noiseTolerance: "noise tolerance",
  workHabits: "study/work habits",
  socialLifestyle: "social lifestyle",
  guestFrequency: "guest frequency",
  cookingFrequency: "cooking frequency",
  personalSpace: "personal space",
  activityLevel: "activity level",
  smoking: "smoking preference",
  pets: "pet preference",
};

// ============================================================================
// HARD CONSTRAINT FUNCTIONS
// ============================================================================

/**
 * Check gender compatibility between two users
 * Returns true if preferences are mutually compatible
 */
function checkGenderCompatibility(userA: UserData, userB: UserData): boolean {
  // If either user has no preference, it's compatible
  if (!userA.genderPreference || userA.genderPreference === "No Preference") {
    if (!userB.genderPreference || userB.genderPreference === "No Preference") {
      return true;
    }
  }

  // Check A's preference against B's gender
  if (userA.genderPreference && userA.genderPreference !== "No Preference") {
    const preferredGender = userA.genderPreference.replace(" Only", "");
    if (userB.gender && userB.gender !== preferredGender) {
      return false;
    }
  }

  // Check B's preference against A's gender
  if (userB.genderPreference && userB.genderPreference !== "No Preference") {
    const preferredGender = userB.genderPreference.replace(" Only", "");
    if (userA.gender && userA.gender !== preferredGender) {
      return false;
    }
  }

  return true;
}

/**
 * Check budget compatibility between two users
 * Returns true if budgets overlap or are close enough
 */
function checkBudgetCompatibility(userA: UserData, userB: UserData): boolean {
  if (!userA.monthlyBudget || !userB.monthlyBudget) {
    return true; // If either is not specified, assume compatible
  }

  const budgetOrder = ["£500-£800", "£800-£1200", "£1200-£1500", "£1500+"];
  const indexA = budgetOrder.indexOf(userA.monthlyBudget);
  const indexB = budgetOrder.indexOf(userB.monthlyBudget);

  if (indexA === -1 || indexB === -1) {
    return true; // Unknown budget format, assume compatible
  }

  // Allow 1 tier difference
  return Math.abs(indexA - indexB) <= 1;
}

/**
 * Check location compatibility between two users
 * Simple string comparison for now - could be enhanced with geo matching
 */
function checkLocationCompatibility(userA: UserData, userB: UserData): boolean {
  if (!userA.preferredLocation || !userB.preferredLocation) {
    return true; // If either is not specified, assume compatible
  }

  // Normalize and compare locations
  const locA = userA.preferredLocation.toLowerCase().trim();
  const locB = userB.preferredLocation.toLowerCase().trim();

  // Check for overlap (one contains the other or they're the same)
  return locA.includes(locB) || locB.includes(locA) || locA === locB;
}

/**
 * Check move-in date and stay duration compatibility
 */
function checkDateCompatibility(userA: UserData, userB: UserData): boolean {
  // Move-in date compatibility
  const moveInOrder = [
    "Immediately",
    "Within 1 month",
    "Within 3 months",
    "Within 6 months",
    "Flexible",
  ];

  if (userA.moveInDate && userB.moveInDate) {
    const indexA = moveInOrder.indexOf(userA.moveInDate);
    const indexB = moveInOrder.indexOf(userB.moveInDate);

    // Flexible matches with anything
    if (
      userA.moveInDate !== "Flexible" &&
      userB.moveInDate !== "Flexible" &&
      indexA !== -1 &&
      indexB !== -1
    ) {
      // Allow 2 tier difference for move-in dates
      if (Math.abs(indexA - indexB) > 2) {
        return false;
      }
    }
  }

  // Length of stay compatibility
  const stayOrder = [
    "Short-term (1-6 months)",
    "Medium-term (6-12 months)",
    "Long-term (12+ months)",
  ];

  if (userA.lengthOfStay && userB.lengthOfStay) {
    const indexA = stayOrder.indexOf(userA.lengthOfStay);
    const indexB = stayOrder.indexOf(userB.lengthOfStay);

    if (indexA !== -1 && indexB !== -1) {
      // Must be within 1 tier for length of stay
      if (Math.abs(indexA - indexB) > 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check property type compatibility
 */
function checkPropertyTypeCompatibility(
  userA: UserData,
  userB: UserData,
): boolean {
  if (!userA.propertyType || !userB.propertyType) {
    return true; // If either is not specified, assume compatible
  }

  // Same property type or one is more general
  return userA.propertyType === userB.propertyType;
}

/**
 * Main hard constraint check - returns true if all constraints pass
 * Respects user's filter preferences for which constraints to apply
 */
export function hardConstraintCheck(
  userA: UserData,
  userB: UserData,
  filters: HardConstraintFilters = DEFAULT_HARD_CONSTRAINT_FILTERS,
): boolean {
  const G = filters.gender ? checkGenderCompatibility(userA, userB) : true;
  const B = filters.budget ? checkBudgetCompatibility(userA, userB) : true;
  const L = filters.location ? checkLocationCompatibility(userA, userB) : true;
  const D = filters.moveInDate ? checkDateCompatibility(userA, userB) : true;
  const P = filters.propertyType
    ? checkPropertyTypeCompatibility(userA, userB)
    : true;

  // H(A,B) = G * B * L * D * P
  return G && B && L && D && P;
}

// ============================================================================
// SIMILARITY FUNCTIONS
// ============================================================================

/**
 * Calculate similarity for Likert scale (1-5) attributes
 * si(A,B) = 1 - (|xi - yi| / 4)
 */
function likertSimilarity(valueA: number, valueB: number): number {
  const diff = Math.abs(valueA - valueB);
  return 1 - diff / 4;
}

/**
 * Calculate similarity for binary attributes
 * Returns 1 if equal, 0 otherwise
 */
function binarySimilarity(valueA: boolean, valueB: boolean): number {
  return valueA === valueB ? 1 : 0;
}

/**
 * Compute similarity breakdown between two users
 */
export function computeSimilarity(
  userA: UserData,
  userB: UserData,
): SimilarityBreakdown {
  return {
    smoking: binarySimilarity(userA.smoking ?? false, userB.smoking ?? false),
    pets: binarySimilarity(userA.pets ?? false, userB.pets ?? false),
    sleepSchedule: likertSimilarity(
      userA.sleepSchedule ?? 3,
      userB.sleepSchedule ?? 3,
    ),
    cleanliness: likertSimilarity(
      userA.cleanliness ?? 3,
      userB.cleanliness ?? 3,
    ),
    noiseTolerance: likertSimilarity(
      userA.noiseTolerance ?? 3,
      userB.noiseTolerance ?? 3,
    ),
    workHabits: likertSimilarity(userA.workHabits ?? 3, userB.workHabits ?? 3),
    socialLifestyle: likertSimilarity(
      userA.socialLifestyle ?? 3,
      userB.socialLifestyle ?? 3,
    ),
    guestFrequency: likertSimilarity(
      userA.guestFrequency ?? 3,
      userB.guestFrequency ?? 3,
    ),
    cookingFrequency: likertSimilarity(
      userA.cookingFrequency ?? 3,
      userB.cookingFrequency ?? 3,
    ),
    personalSpace: likertSimilarity(
      userA.personalSpace ?? 3,
      userB.personalSpace ?? 3,
    ),
    activityLevel: likertSimilarity(
      userA.activityLevel ?? 3,
      userB.activityLevel ?? 3,
    ),
  };
}

/**
 * Compute overall compatibility score from similarity breakdown
 * Compatibility(A,B) = (Σ(wi * si) / Σwi) * 100
 */
export function computeCompatibility(breakdown: SimilarityBreakdown): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, similarity] of Object.entries(breakdown)) {
    const weight = SOFT_CONSTRAINT_WEIGHTS[key as keyof SimilarityBreakdown];
    weightedSum += weight * similarity;
    totalWeight += weight;
  }

  const score = (weightedSum / totalWeight) * 100;
  return Math.round(score * 10) / 10; // Round to 1 decimal
}

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

type ScoreCategory = "high" | "good" | "moderate" | "low";

function getScoreCategory(score: number): ScoreCategory {
  if (score >= 80) return "high";
  if (score >= 65) return "good";
  if (score >= 50) return "moderate";
  return "low";
}

const SUMMARY_MESSAGES: Record<ScoreCategory, string> = {
  high: "You appear to be highly compatible as potential roommates.",
  good: "You show good overall compatibility as potential roommates.",
  moderate: "You have moderate compatibility as potential roommates.",
  low: "This match shows relatively low compatibility overall.",
};

function getStrongFactors(
  breakdown: SimilarityBreakdown,
  maxFactors: number = 3,
): string[] {
  const factors = Object.entries(breakdown)
    .filter((entry) => entry[1] >= 0.75)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxFactors)
    .map(([key]) => FACTOR_LABELS[key as keyof SimilarityBreakdown]);

  return factors;
}

function getWeakFactors(
  breakdown: SimilarityBreakdown,
  maxFactors: number = 2,
): string[] {
  const factors = Object.entries(breakdown)
    .filter((entry) => entry[1] < 0.5)
    .sort((a, b) => a[1] - b[1])
    .slice(0, maxFactors)
    .map(([key]) => FACTOR_LABELS[key as keyof SimilarityBreakdown]);

  return factors;
}

function formatFactorList(factors: string[]): string {
  if (factors.length === 0) return "";
  if (factors.length === 1) return factors[0];
  if (factors.length === 2) return `${factors[0]} and ${factors[1]}`;
  return `${factors.slice(0, -1).join(", ")}, and ${factors[factors.length - 1]}`;
}

/**
 * Generate structured explanation for a match
 */
export function generateExplanation(
  score: number,
  breakdown: SimilarityBreakdown,
): MatchExplanation {
  const category = getScoreCategory(score);
  const summary = SUMMARY_MESSAGES[category];
  const strongFactors = getStrongFactors(breakdown);
  const weakFactors = getWeakFactors(breakdown);

  let fullMessage = summary;

  if (strongFactors.length > 0) {
    fullMessage += ` Your strongest areas of alignment are ${formatFactorList(strongFactors)}, suggesting that several day-to-day living habits are well matched.`;
  }

  if (weakFactors.length > 0) {
    fullMessage += ` Potential areas to discuss include ${formatFactorList(weakFactors)}, as differences here could affect shared living expectations.`;
  }

  return {
    compatibilityScore: score,
    summary,
    strongFactors,
    weakFactors,
    fullMessage,
  };
}

// ============================================================================
// MATCH RANKING
// ============================================================================

/**
 * Rank matches by compatibility score (descending)
 */
export function rankMatches(matches: MatchResult[]): MatchResult[] {
  return [...matches].sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore,
  );
}

// ============================================================================
// MAIN MATCHING FUNCTIONS
// ============================================================================

/**
 * Find matches for a user given a list of candidates
 * Returns ranked match results for candidates that pass hard constraints
 */
export function findMatches(
  currentUser: UserData,
  candidates: UserData[],
  filters: HardConstraintFilters = DEFAULT_HARD_CONSTRAINT_FILTERS,
): MatchResult[] {
  const matches: MatchResult[] = [];
  const now = new Date().toISOString();

  for (const candidate of candidates) {
    // Skip self
    if (candidate.uid === currentUser.uid) continue;

    // Skip incomplete profiles
    if (!candidate.profileComplete) continue;

    // Check hard constraints with user's filter settings
    if (!hardConstraintCheck(currentUser, candidate, filters)) continue;

    // Compute similarity
    const similarityBreakdown = computeSimilarity(currentUser, candidate);

    // Compute compatibility score
    const compatibilityScore = computeCompatibility(similarityBreakdown);

    // Generate explanation
    const explanation = generateExplanation(
      compatibilityScore,
      similarityBreakdown,
    );

    // Create match result
    const matchResult: MatchResult = {
      candidateId: candidate.uid,
      candidateData: {
        displayName: candidate.displayName,
        email: candidate.email,
        photoURL: candidate.photoURL,
        gender: candidate.gender,
        preferredLocation: candidate.preferredLocation,
        monthlyBudget: candidate.monthlyBudget,
        moveInDate: candidate.moveInDate,
        lengthOfStay: candidate.lengthOfStay,
        propertyType: candidate.propertyType,
      },
      compatibilityScore,
      similarityBreakdown,
      explanation,
      calculatedAt: now,
      sourceProfileUpdatedAt: currentUser.updatedAt,
      candidateProfileUpdatedAt: candidate.updatedAt,
      algorithmVersion: ALGORITHM_VERSION,
    };

    matches.push(matchResult);
  }

  // Return ranked matches
  return rankMatches(matches);
}

/**
 * Check if a cached match result is stale
 */
export function isMatchCacheStale(
  matchRecord: StoredMatchResult,
  sourceUser: UserData,
  candidateUser: UserData,
  currentAlgorithmVersion: string = ALGORITHM_VERSION,
): boolean {
  // Check algorithm version
  if (matchRecord.algorithmVersion !== currentAlgorithmVersion) {
    return true;
  }

  // Check if source user profile has been updated
  if (matchRecord.sourceProfileUpdatedAt !== sourceUser.updatedAt) {
    return true;
  }

  // Check if candidate profile has been updated
  if (matchRecord.candidateProfileUpdatedAt !== candidateUser.updatedAt) {
    return true;
  }

  return false;
}
