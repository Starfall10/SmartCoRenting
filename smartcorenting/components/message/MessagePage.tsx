import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaRegUser, FaPaperPlane } from "react-icons/fa";
import { ViewType, Message, UserData } from "@/types";
import { getSocket } from "@/lib/socket";
import { subscribeToMessages } from "@/lib/firebase/conversations";

interface MessagePageProps {
  setActiveView: (view: ViewType) => void;
  conversationId: string;
  otherUser: { uid: string; name: string };
  currentUser: UserData | null;
  isDarkMode: boolean;
}

const MessagePage: React.FC<MessagePageProps> = ({
  setActiveView,
  conversationId,
  otherUser,
  currentUser,
  isDarkMode,
}) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(getSocket());

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to Firestore messages and Socket.IO
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const socket = socketRef.current;

    // Join the socket room
    socket.emit("chat:join", { roomId: conversationId });

    // Subscribe to Firestore for message history
    const unsubscribe = subscribeToMessages(
      conversationId,
      (firestoreMessages) => {
        setMessages(firestoreMessages);
        setLoading(false);
      },
    );

    // Listen for real-time messages via Socket.IO
    const handleNewMessage = ({
      roomId,
      message,
    }: {
      roomId: string;
      message: Message;
    }) => {
      if (roomId === conversationId && message) {
        setMessages((prev) => {
          // Avoid duplicates
          if (message.id && prev.some((m) => m.id === message.id)) {
            return prev;
          }
          // Also check for same text/sender/time to avoid duplicates
          const isDuplicate = prev.some(
            (m) =>
              m.senderId === message.senderId &&
              m.text === message.text &&
              Math.abs(
                new Date(m.createdAt).getTime() -
                  new Date(message.createdAt).getTime(),
              ) < 5000,
          );
          if (isDuplicate) return prev;
          return [...prev, message];
        });
      }
    };

    // Listen for errors
    const handleError = ({ error }: { error: string }) => {
      console.error("Socket error:", error);
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:error", handleError);

    return () => {
      socket.emit("chat:leave", { roomId: conversationId });
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:error", handleError);
      unsubscribe();
    };
  }, [conversationId, currentUser]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUser) return;

    const socket = socketRef.current;

    // Emit message via Socket.IO
    socket.emit("chat:message", {
      roomId: conversationId,
      message: {
        senderId: currentUser.uid,
        text: messageText.trim(),
      },
    });

    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr: string | Date | undefined | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 border-b ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
      >
        <button
          onClick={() => setActiveView("messages")}
          className="mr-4 hover:opacity-70"
        >
          <FaArrowLeft size={20} />
        </button>
        <div
          className={`rounded-full p-2 mr-3 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
        >
          <FaRegUser
            size={20}
            className={isDarkMode ? "text-gray-400" : "text-gray-600"}
          />
        </div>
        <h2 className="text-xl font-bold">{otherUser.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Loading messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              No messages yet. Say hi!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div
                key={msg.id || `temp-${index}`}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? isDarkMode
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-500 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-white"
                        : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span
                  className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                >
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className={`p-4 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type something..."
            className={`flex-1 rounded-full px-6 py-3 focus:outline-none ${
              isDarkMode
                ? "bg-zinc-800 text-white placeholder-gray-500"
                : "bg-gray-100 text-black placeholder-gray-400 border border-gray-300"
            }`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white p-3 rounded-full transition-colors"
          >
            <FaPaperPlane size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
