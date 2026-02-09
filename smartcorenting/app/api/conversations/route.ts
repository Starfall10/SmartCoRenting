import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Helper to get session
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// Helper to save conversation reference to a user's document
async function saveConversationToUser(
  uid: string,
  conversationId: string,
  otherUid: string,
  otherName: string,
) {
  const userRef = adminDb.collection("users").doc(uid);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  const savedConversations = userData?.savedConversations || [];

  // Check if already saved
  const alreadySaved = savedConversations.some(
    (c: { conversationId: string }) => c.conversationId === conversationId,
  );

  if (!alreadySaved) {
    await userRef.update({
      savedConversations: FieldValue.arrayUnion({
        conversationId,
        otherUid,
        otherName,
        addedAt: new Date().toISOString(),
      }),
    });
  }
}

// GET - Get all conversations for the current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationsRef = adminDb.collection("conversations");
    const snapshot = await conversationsRef
      .where("participants", "array-contains", session.uid)
      .orderBy("lastMessageAt", "desc")
      .get();

    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants,
        participantNames: data.participantNames || {},
        lastMessage: data.lastMessage || "",
        lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

// POST - Create or get a conversation with another user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUid } = await request.json();

    if (!otherUid) {
      return NextResponse.json(
        { error: "Other user UID is required" },
        { status: 400 },
      );
    }

    if (otherUid === session.uid) {
      return NextResponse.json(
        { error: "Cannot start conversation with yourself" },
        { status: 400 },
      );
    }

    // Check if other user exists
    const otherUserDoc = await adminDb.collection("users").doc(otherUid).get();
    if (!otherUserDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const otherUser = otherUserDoc.data();

    // Generate consistent conversation ID
    const conversationId = [session.uid, otherUid].sort().join("_");
    const conversationRef = adminDb
      .collection("conversations")
      .doc(conversationId);
    const conversationSnap = await conversationRef.get();

    if (conversationSnap.exists) {
      // Return existing conversation - but also ensure it's saved to user's savedConversations
      const data = conversationSnap.data();
      const otherName =
        data?.participantNames?.[otherUid] ||
        otherUser?.displayName ||
        otherUser?.fullName ||
        "User";

      // Save to current user's savedConversations if not already there
      await saveConversationToUser(
        session.uid,
        conversationId,
        otherUid,
        otherName,
      );

      return NextResponse.json({
        conversation: {
          id: conversationId,
          participants: data?.participants,
          participantNames: data?.participantNames || {},
          lastMessage: data?.lastMessage || "",
          lastMessageAt: data?.lastMessageAt?.toDate?.()?.toISOString() || null,
          createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
        },
        isNew: false,
      });
    }

    // Create new conversation
    const currentUserDoc = await adminDb
      .collection("users")
      .doc(session.uid)
      .get();
    const currentUser = currentUserDoc.data();

    const currentUserName =
      currentUser?.displayName || currentUser?.fullName || session.email;
    const otherUserName =
      otherUser?.displayName ||
      otherUser?.fullName ||
      otherUser?.email ||
      "User";

    const newConversation = {
      participants: [session.uid, otherUid],
      participantNames: {
        [session.uid]: currentUserName,
        [otherUid]: otherUserName,
      },
      lastMessage: "",
      lastMessageAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    };

    await conversationRef.set(newConversation);

    // Save conversation reference to both users' documents
    await Promise.all([
      saveConversationToUser(
        session.uid,
        conversationId,
        otherUid,
        otherUserName,
      ),
      saveConversationToUser(
        otherUid,
        conversationId,
        session.uid,
        currentUserName,
      ),
    ]);

    return NextResponse.json({
      conversation: {
        id: conversationId,
        participants: [session.uid, otherUid],
        participantNames: newConversation.participantNames,
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      isNew: true,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
