import React, { useEffect, useState } from "react";
import { FaRegUser, FaTimes, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Conversation, PlaceDetails, UserData, Meeting } from "@/types";
import { getSocket } from "@/lib/socket";
import { createMeeting, rescheduleMeeting } from "@/lib/firebase/meetings";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: PlaceDetails;
  currentUser: UserData | null;
  isDarkMode: boolean;
  // For rescheduling existing meeting
  existingMeeting?: Meeting;
  isReschedule?: boolean;
}

interface Contact {
  conversationId: string;
  uid: string;
  name: string;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  location,
  currentUser,
  isDarkMode,
  existingMeeting,
  isReschedule = false,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [step, setStep] = useState<"datetime" | "contact" | "confirm">(
    "datetime",
  );

  // For rescheduling, pre-select the other user and pre-fill date/time
  useEffect(() => {
    if (isReschedule && existingMeeting && currentUser) {
      const otherUid =
        existingMeeting.creatorUid === currentUser.uid
          ? existingMeeting.inviteeUid
          : existingMeeting.creatorUid;
      const otherName =
        existingMeeting.creatorUid === currentUser.uid
          ? existingMeeting.inviteeName
          : existingMeeting.creatorName;

      const conversationId = [currentUser.uid, otherUid].sort().join("_");
      setSelectedContact({
        conversationId,
        uid: otherUid,
        name: otherName,
      });

      // Pre-fill with existing meeting date and time
      setSelectedDate(existingMeeting.scheduledDate);
      setSelectedTime(existingMeeting.scheduledTime);

      setStep("datetime");
    }
  }, [isReschedule, existingMeeting, currentUser]);

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen || !currentUser || isReschedule) return;

    async function fetchContacts() {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();

        if (data.conversations) {
          const contactList: Contact[] = data.conversations.map(
            (conv: Conversation) => {
              const otherUid =
                conv.participants.find((p) => p !== currentUser?.uid) || "";
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
  }, [isOpen, currentUser, isReschedule]);

  const handleScheduleMeeting = async () => {
    if (!currentUser || !selectedDate || !selectedTime) return;
    if (!isReschedule && !selectedContact) return;

    setSending(true);

    try {
      let meeting: Meeting;
      let conversationId: string;
      let inviteeUid: string;

      if (isReschedule && existingMeeting) {
        // Reschedule existing meeting
        meeting = await rescheduleMeeting(
          existingMeeting.id,
          selectedDate,
          selectedTime,
          currentUser.uid,
        );

        inviteeUid =
          existingMeeting.creatorUid === currentUser.uid
            ? existingMeeting.inviteeUid
            : existingMeeting.creatorUid;
        conversationId = [currentUser.uid, inviteeUid].sort().join("_");
      } else if (selectedContact) {
        // Create new meeting
        meeting = await createMeeting(
          currentUser.uid,
          currentUser.displayName || currentUser.fullName || "User",
          selectedContact.uid,
          selectedContact.name,
          location,
          selectedDate,
          selectedTime,
        );
        conversationId = selectedContact.conversationId;
        inviteeUid = selectedContact.uid;
      } else {
        return;
      }

      // Send meeting invite via Socket.IO
      const socket = getSocket();
      socket.emit("chat:message", {
        roomId: conversationId,
        message: {
          senderId: currentUser.uid,
          text: isReschedule
            ? `📅 Rescheduled meeting at ${location.name || "Selected Location"}`
            : `📅 Meeting invite at ${location.name || "Selected Location"}`,
          type: "meeting_invite",
          meetingId: meeting.id,
          meeting: meeting,
        },
      });

      // Reset and close
      setSelectedDate("");
      setSelectedTime("");
      setSelectedContact(null);
      setStep("datetime");
      onClose();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep(isReschedule ? "datetime" : "contact");
    } else if (step === "contact") {
      setStep("datetime");
    }
  };

  const handleNext = () => {
    if (step === "datetime" && selectedDate && selectedTime) {
      if (isReschedule) {
        setStep("confirm");
      } else {
        setStep("contact");
      }
    } else if (step === "contact" && selectedContact) {
      setStep("confirm");
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
          <h2 className="text-lg font-bold">
            {isReschedule ? "Reschedule Meeting" : "Schedule Meeting"}
          </h2>
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

        {/* Step Content */}
        <div className="p-4">
          {/* Step: Date & Time Selection */}
          {step === "datetime" && (
            <div className="space-y-4">
              <h3
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Select date and time
              </h3>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <FaCalendarAlt className="inline mr-2" size={14} />
                    Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl ${
                      isDarkMode
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-gray-100 text-black border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <FaClock className="inline mr-2" size={14} />
                    Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl ${
                      isDarkMode
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-gray-100 text-black border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Contact Selection */}
          {step === "contact" && !isReschedule && (
            <div className="max-h-[40vh] overflow-y-auto">
              <h3
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Select a contact to invite
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
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => {
                    const isSelected = selectedContact?.uid === contact.uid;

                    return (
                      <button
                        key={contact.uid}
                        onClick={() => setSelectedContact(contact)}
                        className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : isDarkMode
                              ? "bg-zinc-800 hover:bg-zinc-700"
                              : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <div
                          className={`rounded-full p-2 mr-3 ${
                            isSelected
                              ? "bg-indigo-500"
                              : isDarkMode
                                ? "bg-zinc-700"
                                : "bg-gray-200"
                          }`}
                        >
                          <FaRegUser
                            size={18}
                            className={
                              isSelected
                                ? "text-white"
                                : isDarkMode
                                  ? "text-gray-400"
                                  : "text-gray-600"
                            }
                          />
                        </div>
                        <span className="flex-1 text-left font-medium">
                          {contact.name}
                        </span>
                        {isSelected && (
                          <span className="text-sm">Selected ✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step: Confirmation */}
          {step === "confirm" && (
            <div className="space-y-4">
              <h3
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Confirm meeting details
              </h3>

              <div
                className={`rounded-xl p-4 space-y-3 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    With
                  </span>
                  <span className="font-medium">
                    {isReschedule && existingMeeting
                      ? existingMeeting.creatorUid === currentUser?.uid
                        ? existingMeeting.inviteeName
                        : existingMeeting.creatorName
                      : selectedContact?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Date
                  </span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Time
                  </span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Location
                  </span>
                  <span className="font-medium text-right max-w-[60%] truncate">
                    {location.name || "Selected Location"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div className="flex gap-3">
            {step !== "datetime" && (
              <button
                onClick={handleBack}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-black"
                }`}
              >
                Back
              </button>
            )}

            {step === "confirm" ? (
              <button
                onClick={handleScheduleMeeting}
                disabled={sending}
                className="flex-1 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                {sending
                  ? "Sending..."
                  : isReschedule
                    ? "Send Reschedule"
                    : "Send Invite"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={
                  (step === "datetime" && (!selectedDate || !selectedTime)) ||
                  (step === "contact" && !selectedContact)
                }
                className="flex-1 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
