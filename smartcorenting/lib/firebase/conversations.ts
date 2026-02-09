import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "./client";
import { Conversation, Message } from "@/types";

// Generate a consistent conversation ID between two users
export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

// Get or create a conversation between two users
export async function getOrCreateConversation(
  currentUid: string,
  otherUid: string,
  currentName: string,
  otherName: string,
): Promise<Conversation> {
  const conversationId = getConversationId(currentUid, otherUid);
  const conversationRef = doc(db, "conversations", conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (conversationSnap.exists()) {
    const data = conversationSnap.data();
    return {
      id: conversationId,
      participants: data.participants,
      participantNames: data.participantNames,
      lastMessage: data.lastMessage || "",
      lastMessageAt: data.lastMessageAt?.toDate?.() || data.lastMessageAt,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    };
  }

  // Create new conversation
  const newConversation = {
    participants: [currentUid, otherUid],
    participantNames: {
      [currentUid]: currentName,
      [otherUid]: otherName,
    },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  await setDoc(conversationRef, newConversation);

  return {
    id: conversationId,
    participants: [currentUid, otherUid],
    participantNames: {
      [currentUid]: currentName,
      [otherUid]: otherName,
    },
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// Get all conversations for a user
export async function getUserConversations(
  uid: string,
): Promise<Conversation[]> {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      participants: data.participants,
      participantNames: data.participantNames || {},
      lastMessage: data.lastMessage || "",
      lastMessageAt: data.lastMessageAt?.toDate?.() || data.lastMessageAt,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    };
  });
}

// Subscribe to conversations in real-time
export function subscribeToConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void,
): () => void {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants,
        participantNames: data.participantNames || {},
        lastMessage: data.lastMessage || "",
        lastMessageAt: data.lastMessageAt?.toDate?.() || data.lastMessageAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    });
    callback(conversations);
  });
}

// Get messages for a conversation
export async function getConversationMessages(
  conversationId: string,
  messageLimit: number = 50,
): Promise<Message[]> {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );
  const q = query(
    messagesRef,
    orderBy("createdAt", "asc"),
    limit(messageLimit),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    };
  });
}

// Subscribe to messages in real-time
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
): () => void {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Handle serverTimestamp() which may be null initially
      let createdAt: Date | string = new Date().toISOString();
      if (data.createdAt) {
        createdAt = data.createdAt.toDate?.() || data.createdAt;
      }
      return {
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        createdAt,
      };
    });
    callback(messages);
  });
}

// Add a message to a conversation (client-side, for backup - server handles this primarily)
export async function addMessage(
  conversationId: string,
  senderId: string,
  text: string,
): Promise<Message> {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );

  const messageData = {
    senderId,
    text,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(messagesRef, messageData);

  // Update conversation's last message
  const conversationRef = doc(db, "conversations", conversationId);
  await setDoc(
    conversationRef,
    {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    id: docRef.id,
    senderId,
    text,
    createdAt: new Date().toISOString(),
  };
}
