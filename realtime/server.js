import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
let firebaseInitialized = false;

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized with service account");
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp();
    firebaseInitialized = true;
    console.log(
      "Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS",
    );
  } else if (process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseInitialized = true;
    console.log(
      "Firebase Admin initialized with project ID only (limited functionality)",
    );
  } else {
    console.error(
      "WARNING: No Firebase credentials found. Messages will NOT be persisted!",
    );
    console.error(
      "Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS env var",
    );
  }
} else {
  firebaseInitialized = true;
}

const adminDb = firebaseInitialized ? getFirestore() : null;

const app = express();
app.use(cors());

const server = http.createServer(app);

// IMPORTANT: set CORS origin to your Next.js site
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Save message to Firestore
async function saveMessage(conversationId, message) {
  if (!adminDb) {
    console.error("Firebase not initialized - cannot persist message");
    throw new Error("Firebase not initialized");
  }

  try {
    console.log(`Saving message to conversation: ${conversationId}`);

    const conversationRef = adminDb
      .collection("conversations")
      .doc(conversationId);
    const messagesRef = conversationRef.collection("messages");

    // First check if conversation exists
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
      console.error(`Conversation ${conversationId} does not exist`);
      throw new Error("Conversation not found");
    }

    const docRef = await messagesRef.add({
      senderId: message.senderId,
      text: message.text,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`Message saved with ID: ${docRef.id}`);

    // Update conversation's last message using set with merge to avoid errors
    await conversationRef.set(
      {
        lastMessage: message.text,
        lastMessageAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    console.log(`Conversation ${conversationId} updated with last message`);

    return docRef.id;
  } catch (error) {
    console.error("Error saving message:", error.message || error);
    throw error;
  }
}

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // Join a room (e.g. conversationId)
  socket.on("chat:join", ({ roomId }) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  // Leave a room
  socket.on("chat:leave", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`${socket.id} left room ${roomId}`);
  });

  // Send a message to everyone in the room
  socket.on("chat:message", async ({ roomId, message }) => {
    // message object example:
    // { text, senderId }

    try {
      // 1) Persist to Firebase
      const messageId = await saveMessage(roomId, message);

      // 2) Broadcast to room with the generated ID
      const fullMessage = {
        id: messageId,
        senderId: message.senderId,
        text: message.text,
        createdAt: new Date().toISOString(),
      };

      io.to(roomId).emit("chat:message", { roomId, message: fullMessage });
    } catch (error) {
      // If persistence fails, still try to broadcast but log the error
      console.error("Failed to persist message:", error);
      socket.emit("chat:error", { error: "Failed to save message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });
});

app.get("/health", (_req, res) => res.send("ok"));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Socket server on :${PORT}`));
