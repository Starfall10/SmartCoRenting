import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import { Meeting, MeetingStatus, PlaceDetails } from "@/types";

// Generate a unique meeting ID
function generateMeetingId(): string {
  return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new meeting
export async function createMeeting(
  creatorUid: string,
  creatorName: string,
  inviteeUid: string,
  inviteeName: string,
  location: PlaceDetails,
  scheduledDate: string,
  scheduledTime: string,
): Promise<Meeting> {
  const meetingId = generateMeetingId();
  const meetingRef = doc(db, "meetings", meetingId);

  const meetingData = {
    creatorUid,
    creatorName,
    inviteeUid,
    inviteeName,
    location,
    scheduledDate,
    scheduledTime,
    status: "pending" as MeetingStatus,
    pendingApprovalFrom: inviteeUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(meetingRef, meetingData);

  return {
    id: meetingId,
    ...meetingData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Get a single meeting by ID
export async function getMeeting(meetingId: string): Promise<Meeting | null> {
  const meetingRef = doc(db, "meetings", meetingId);
  const meetingSnap = await getDoc(meetingRef);

  if (!meetingSnap.exists()) {
    return null;
  }

  const data = meetingSnap.data();
  return {
    id: meetingSnap.id,
    creatorUid: data.creatorUid,
    creatorName: data.creatorName,
    inviteeUid: data.inviteeUid,
    inviteeName: data.inviteeName,
    location: data.location,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
    status: data.status,
    pendingApprovalFrom: data.pendingApprovalFrom || data.inviteeUid,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    previousDate: data.previousDate,
    previousTime: data.previousTime,
    rescheduleMessage: data.rescheduleMessage,
  };
}

// Get all meetings for a user (both as creator and invitee)
export async function getUserMeetings(uid: string): Promise<Meeting[]> {
  const meetingsRef = collection(db, "meetings");

  // Query for meetings where user is creator
  const creatorQuery = query(
    meetingsRef,
    where("creatorUid", "==", uid),
    orderBy("scheduledDate", "asc"),
  );

  // Query for meetings where user is invitee
  const inviteeQuery = query(
    meetingsRef,
    where("inviteeUid", "==", uid),
    orderBy("scheduledDate", "asc"),
  );

  const [creatorSnap, inviteeSnap] = await Promise.all([
    getDocs(creatorQuery),
    getDocs(inviteeQuery),
  ]);

  const meetings: Meeting[] = [];
  const seenIds = new Set<string>();

  const processDocs = (docs: typeof creatorSnap.docs) => {
    docs.forEach((doc) => {
      if (seenIds.has(doc.id)) return;
      seenIds.add(doc.id);

      const data = doc.data();
      meetings.push({
        id: doc.id,
        creatorUid: data.creatorUid,
        creatorName: data.creatorName,
        inviteeUid: data.inviteeUid,
        inviteeName: data.inviteeName,
        location: data.location,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        status: data.status,
        pendingApprovalFrom: data.pendingApprovalFrom || data.inviteeUid,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        previousDate: data.previousDate,
        previousTime: data.previousTime,
        rescheduleMessage: data.rescheduleMessage,
      });
    });
  };

  processDocs(creatorSnap.docs);
  processDocs(inviteeSnap.docs);

  // Sort by scheduled date
  meetings.sort((a, b) => {
    const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
    const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  return meetings;
}

// Subscribe to user's meetings in real-time
export function subscribeToUserMeetings(
  uid: string,
  callback: (meetings: Meeting[]) => void,
): () => void {
  const meetingsRef = collection(db, "meetings");

  // We need to listen to both queries
  const creatorQuery = query(meetingsRef, where("creatorUid", "==", uid));

  const inviteeQuery = query(meetingsRef, where("inviteeUid", "==", uid));

  let creatorMeetings: Meeting[] = [];
  let inviteeMeetings: Meeting[] = [];

  const mergeMeetings = () => {
    const seenIds = new Set<string>();
    const allMeetings: Meeting[] = [];

    [...creatorMeetings, ...inviteeMeetings].forEach((meeting) => {
      if (!seenIds.has(meeting.id)) {
        seenIds.add(meeting.id);
        allMeetings.push(meeting);
      }
    });

    // Sort by scheduled date
    allMeetings.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    callback(allMeetings);
  };

  const processDocs = (
    docs: QueryDocumentSnapshot<DocumentData>[],
  ): Meeting[] => {
    return docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        creatorUid: data.creatorUid,
        creatorName: data.creatorName,
        inviteeUid: data.inviteeUid,
        inviteeName: data.inviteeName,
        location: data.location,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        status: data.status,
        pendingApprovalFrom: data.pendingApprovalFrom || data.inviteeUid,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        previousDate: data.previousDate,
        previousTime: data.previousTime,
        rescheduleMessage: data.rescheduleMessage,
      };
    });
  };

  const unsubCreator = onSnapshot(creatorQuery, (snapshot) => {
    creatorMeetings = processDocs(snapshot.docs);
    mergeMeetings();
  });

  const unsubInvitee = onSnapshot(inviteeQuery, (snapshot) => {
    inviteeMeetings = processDocs(snapshot.docs);
    mergeMeetings();
  });

  return () => {
    unsubCreator();
    unsubInvitee();
  };
}

// Update meeting status (accept/reject)
export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus,
): Promise<void> {
  const meetingRef = doc(db, "meetings", meetingId);
  await updateDoc(meetingRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// Reschedule a meeting
export async function rescheduleMeeting(
  meetingId: string,
  newDate: string,
  newTime: string,
  reschedulerUid: string,
  message?: string,
): Promise<Meeting> {
  const meetingRef = doc(db, "meetings", meetingId);
  const meetingSnap = await getDoc(meetingRef);

  if (!meetingSnap.exists()) {
    throw new Error("Meeting not found");
  }

  const currentData = meetingSnap.data();

  // The person who needs to approve is the OTHER person (not the rescheduler)
  const pendingApprovalFrom =
    reschedulerUid === currentData.creatorUid
      ? currentData.inviteeUid
      : currentData.creatorUid;

  const updateData: Record<string, unknown> = {
    previousDate: currentData.scheduledDate,
    previousTime: currentData.scheduledTime,
    scheduledDate: newDate,
    scheduledTime: newTime,
    status: "pending",
    pendingApprovalFrom,
    updatedAt: serverTimestamp(),
  };

  // Only include rescheduleMessage if provided (Firestore doesn't accept undefined)
  if (message) {
    updateData.rescheduleMessage = message;
  }

  await updateDoc(meetingRef, updateData);

  return {
    id: meetingId,
    creatorUid: currentData.creatorUid,
    creatorName: currentData.creatorName,
    inviteeUid: currentData.inviteeUid,
    inviteeName: currentData.inviteeName,
    location: currentData.location,
    scheduledDate: newDate,
    scheduledTime: newTime,
    status: "pending",
    pendingApprovalFrom,
    createdAt: currentData.createdAt?.toDate?.() || currentData.createdAt,
    updatedAt: new Date().toISOString(),
    previousDate: currentData.scheduledDate,
    previousTime: currentData.scheduledTime,
    rescheduleMessage: message,
  };
}
