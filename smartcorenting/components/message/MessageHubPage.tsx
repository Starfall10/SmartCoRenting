import React, { useState, useEffect } from "react";
import { FaRegUser, FaUserPlus } from "react-icons/fa";
import { ViewType, Conversation, UserData } from "@/types";

interface MessageHubPageProps {
  setActiveView: (view: ViewType) => void;
  setSelectedConversation: (conversation: {
    id: string;
    otherUser: { uid: string; name: string };
  }) => void;
  isDarkMode: boolean;
  currentUser: UserData | null;
}

const MessageHubPage: React.FC<MessageHubPageProps> = ({
  setActiveView,
  setSelectedConversation,
  isDarkMode,
  currentUser,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUid, setSearchUid] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      try {
        console.log("[MessageHub] Fetching conversations...");
        console.log(
          "[MessageHub] Current user:",
          currentUser
            ? { uid: currentUser.uid, email: currentUser.email }
            : null,
        );

        const res = await fetch("/api/conversations");
        console.log("[MessageHub] Response status:", res.status);

        if (res.status === 401) {
          console.error("[MessageHub] Unauthorized - session may have expired");
          // Try to refresh the session
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          console.log("[MessageHub] Session check result:", sessionData);

          if (!sessionData.session) {
            console.error(
              "[MessageHub] No valid session found, redirecting to login",
            );
            setActiveView("login");
            return;
          }
        }

        const data = await res.json();
        console.log("[MessageHub] Conversations data:", data);

        if (data.conversations) {
          setConversations(data.conversations);
        } else if (data.error) {
          console.error("[MessageHub] Error from API:", data.error);
        }
      } catch (error) {
        console.error("[MessageHub] Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [currentUser, setActiveView]);

  // Handle starting a new conversation by UID
  const handleStartConversation = async () => {
    if (!searchUid.trim()) {
      setSearchError("Please enter a user ID");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      // First check if user exists
      const userRes = await fetch(`/api/user?uid=${searchUid.trim()}`);
      const userData = await userRes.json();

      if (!userData.exists) {
        setSearchError("User not found");
        setIsSearching(false);
        return;
      }

      // Create or get conversation
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUid: searchUid.trim() }),
      });

      const convData = await convRes.json();

      if (convData.error) {
        setSearchError(convData.error);
        setIsSearching(false);
        return;
      }

      // Add the new/existing conversation to the list if not already there
      const newConversation = convData.conversation;
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === newConversation.id);
        if (exists) {
          return prev;
        }
        return [newConversation, ...prev];
      });

      // Navigate to the conversation
      const otherUid = searchUid.trim();
      const otherName =
        convData.conversation.participantNames[otherUid] || "User";

      // Clear the search input
      setSearchUid("");

      setSelectedConversation({
        id: convData.conversation.id,
        otherUser: { uid: otherUid, name: otherName },
      });
      setActiveView("messageIndividual");
    } catch (error) {
      console.error("Error starting conversation:", error);
      setSearchError("Failed to start conversation");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    if (!currentUser) return;

    const otherUid =
      conversation.participants.find((p) => p !== currentUser.uid) || "";
    const otherName = conversation.participantNames[otherUid] || "User";

    setSelectedConversation({
      id: conversation.id,
      otherUser: { uid: otherUid, name: otherName },
    });
    setActiveView("messageIndividual");
  };

  const formatTime = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`min-h-screen pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="p-6">
        <h2
          className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          MessagesHub
        </h2>
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        {/* Start New Conversation */}
        <div className="mb-6">
          <label
            className={`block text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Start a conversation by entering a user ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchUid}
              onChange={(e) => {
                setSearchUid(e.target.value);
                setSearchError("");
              }}
              placeholder="Enter user ID..."
              className={`flex-1 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                isDarkMode
                  ? "bg-zinc-900 text-white placeholder-gray-500"
                  : "bg-gray-100 text-black placeholder-gray-400 border border-gray-300"
              }`}
            />
            <button
              onClick={handleStartConversation}
              disabled={isSearching}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              <FaUserPlus size={18} />
              {isSearching ? "..." : "Chat"}
            </button>
          </div>
          {searchError && (
            <p className="text-red-500 text-sm mt-2">{searchError}</p>
          )}
        </div>

        {/* Your User ID */}
        {currentUser && (
          <div
            className={`mb-6 p-3 rounded-xl ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
          >
            <p
              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Your User ID (share this with others):
            </p>
            <p className="font-mono text-sm mt-1 break-all">
              {currentUser.uid}
            </p>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div>
        {loading ? (
          <div className="px-6 py-8 text-center">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Loading conversations...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              No conversations yet. Start chatting by entering a user ID above!
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const otherUid =
              conv.participants.find((p) => p !== currentUser?.uid) || "";
            const otherName = conv.participantNames[otherUid] || "User";

            return (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv)}
                className={`flex items-center px-6 py-4 cursor-pointer border-b ${
                  isDarkMode
                    ? "hover:bg-zinc-900 border-zinc-900"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`rounded-full p-3 mr-4 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
                >
                  <FaRegUser
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    size={24}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{otherName}</h3>
                  <p
                    className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span
                    className={`text-xs mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {formatTime(conv.lastMessageAt)}
                  </span>
                  {conv.lastMessage && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageHubPage;
