import React, { useEffect, useState } from "react";
import { FaRegUser, FaTimes } from "react-icons/fa";
import { Conversation, PlaceDetails, UserData } from "@/types";
import { getSocket } from "@/lib/socket";

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: PlaceDetails;
  currentUser: UserData | null;
  isDarkMode: boolean;
}

interface Contact {
  conversationId: string;
  uid: string;
  name: string;
}

const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  isOpen,
  onClose,
  location,
  currentUser,
  isDarkMode,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const userUid = currentUser.uid;

    async function fetchContacts() {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();

        if (data.conversations) {
          const contactList: Contact[] = data.conversations.map(
            (conv: Conversation) => {
              const otherUid =
                conv.participants.find((p) => p !== userUid) || "";
              return {
                conversationId: conv.id,
                uid: otherUid,
                name: conv.participantNames[otherUid] || "User",
              };
            },
          );
          setContacts(contactList);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [isOpen, currentUser]);

  const handleShareLocation = async (contact: Contact) => {
    if (!currentUser) return;

    setSending(contact.uid);

    try {
      const socket = getSocket();

      // Emit the location message via Socket.IO
      socket.emit("chat:message", {
        roomId: contact.conversationId,
        message: {
          senderId: currentUser.uid,
          text: `📍 ${location.name || "Shared Location"}`,
          type: "location",
          location: location,
        },
      });

      // Mark as sent
      setSent((prev) => [...prev, contact.uid]);

      // Auto-close after short delay if this was the only share
      setTimeout(() => {
        setSending(null);
      }, 500);
    } catch (error) {
      console.error("Error sharing location:", error);
      setSending(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl shadow-xl ${
          isDarkMode ? "bg-zinc-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <h2 className="text-lg font-bold">Share Location</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Location Preview */}
        <div
          className={`p-4 border-b ${
            isDarkMode ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div
            className={`rounded-xl p-3 ${
              isDarkMode ? "bg-zinc-800" : "bg-gray-100"
            }`}
          >
            <p className="font-semibold">
              {location.name || "Selected Location"}
            </p>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {location.address || "No address available"}
            </p>
          </div>
        </div>

        {/* Contacts List */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          <h3
            className={`text-sm font-medium mb-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Select a contact
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Loading contacts...
              </p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                No contacts yet
              </p>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Start a conversation first
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => {
                const isSent = sent.includes(contact.uid);
                const isSending = sending === contact.uid;

                return (
                  <button
                    key={contact.uid}
                    onClick={() => handleShareLocation(contact)}
                    disabled={isSending || isSent}
                    className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                      isSent
                        ? isDarkMode
                          ? "bg-green-900/30 border border-green-700"
                          : "bg-green-100 border border-green-300"
                        : isDarkMode
                          ? "bg-zinc-800 hover:bg-zinc-700"
                          : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 mr-3 ${
                        isDarkMode ? "bg-zinc-700" : "bg-gray-200"
                      }`}
                    >
                      <FaRegUser
                        size={18}
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="flex-1 text-left font-medium">
                      {contact.name}
                    </span>
                    {isSending ? (
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Sending...
                      </span>
                    ) : isSent ? (
                      <span className="text-sm text-green-500">Sent ✓</span>
                    ) : (
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-indigo-400" : "text-indigo-600"
                        }`}
                      >
                        Share
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-black"
            }`}
          >
            {sent.length > 0 ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPickerModal;
