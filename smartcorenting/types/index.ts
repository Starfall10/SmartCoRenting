export type ViewType =
  | "welcome"
  | "login"
  | "home"
  | "addprofile"
  | "messages"
  | "messageIndividual"
  | "match"
  | "meeting"
  | "profile"
  | null;

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  profileComplete: boolean;
  profileStep: number; // Track which step user is on (1-10)

  // Profile Creation (Step 1)
  fullName?: string;
  gender?: string;
  age?: number;

  // Hard Constraints (Step 2)
  preferredLocation?: string;
  moveInDate?: string;
  lengthOfStay?: string;
  monthlyBudget?: string;
  genderPreference?: string;
  propertyType?: string;

  // Lifestyle tags
  lifestyleTags?: string[];

  // Hard constraint tags
  constraintTags?: string[];

  // About/Bio
  bio?: string;
}
