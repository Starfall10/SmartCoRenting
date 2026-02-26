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
