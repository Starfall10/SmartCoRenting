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
  profileStep: number; // Track which step user is on (1-3)

  // Basic Info (Step 1)
  gender?: string;
  genderPreference?: string;
  monthlyBudget?: string;
  preferredLocation?: string;
  moveInDate?: string;
  lengthOfStay?: string;
  propertyType?: string;

  // Yes/No Preferences (Step 2)
  smoking?: boolean;
  pets?: boolean;

  // Lifestyle Preferences - Scale 1-5 (Step 3)
  sleepSchedule?: number; // 1: Early sleeper, 5: Night owl
  cleanliness?: number; // 1: Relaxed cleanliness, 5: Very tidy
  noiseTolerance?: number; // 1: Need quiet, 5: Noise tolerant
  workHabits?: number; // 1: Rarely home, 5: Mostly home
  socialLifestyle?: number; // 1: Private, 5: Very social
  guestFrequency?: number; // 1: No guests, 5: Frequent guests
  cookingFrequency?: number; // 1: Rarely cook, 5: Cook daily
  personalSpace?: number; // 1: Independent, 5: Shared/social
  activityLevel?: number; // 1: Quiet lifestyle, 5: Lively household

  // Legacy fields (kept for backward compatibility)
  fullName?: string;
  age?: number;
  lifestyleTags?: string[];
  constraintTags?: string[];
  bio?: string;

  // Saved conversations (for quick access in messages hub)
  savedConversations?: SavedConversation[];
}

export interface SavedConversation {
  conversationId: string;
  otherUid: string;
  otherName: string;
  addedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>; // uid -> displayName
  lastMessage: string;
  lastMessageAt: Date | string;
  createdAt: Date | string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date | string;
  // Location message fields (optional)
  type?: "text" | "location" | "meeting_invite";
  location?: PlaceDetails;
  // Meeting invite fields (optional)
  meetingId?: string;
  meeting?: Meeting;
}

export type MeetingStatus = "pending" | "accepted" | "rejected" | "rescheduled";

export interface Meeting {
  id: string;
  // Participants
  creatorUid: string;
  creatorName: string;
  inviteeUid: string;
  inviteeName: string;
  // Meeting details
  location: PlaceDetails;
  scheduledDate: string; // ISO date string
  scheduledTime: string; // HH:mm format
  // Status
  status: MeetingStatus;
  // Who needs to respond to this meeting (for reschedules)
  pendingApprovalFrom: string;
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  // For rescheduling
  previousDate?: string;
  previousTime?: string;
  rescheduleMessage?: string;
}

export type PlaceDetails = {
  placeId: string;
  name?: string;
  rating?: number;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export type PlacePicked = {
  placeId: string;
  lat?: number;
  lng?: number;
};

// Hard constraint filter preferences for matchmaking
export interface HardConstraintFilters {
  gender: boolean;
  budget: boolean;
  location: boolean;
  moveInDate: boolean;
  propertyType: boolean;
}

export const DEFAULT_HARD_CONSTRAINT_FILTERS: HardConstraintFilters = {
  gender: true,
  budget: true,
  location: true,
  moveInDate: true,
  propertyType: true,
};
