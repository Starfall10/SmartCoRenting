import React, { useState, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { Meeting, MeetingStatus, UserData } from "@/types";
import { getMeeting, updateMeetingStatus } from "@/lib/firebase/meetings";

interface MeetingInviteCardProps {
  meetingId: string;
  meetingData?: Meeting;
  isDarkMode: boolean;
  isOwnMessage: boolean;
  currentUser: UserData | null;
}

const MeetingInviteCard: React.FC<MeetingInviteCardProps> = ({
  meetingId,
  meetingData,
  isDarkMode,
  isOwnMessage,
  currentUser,
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(meetingData || null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Use ref to store meetingData for fallback without causing re-fetches
  const meetingDataRef = useRef(meetingData);
  meetingDataRef.current = meetingData;

  // Fetch fresh meeting data from Firestore on mount only (based on meetingId)
  // Don't re-fetch when meetingData changes from parent to avoid resetting state
  useEffect(() => {
    let isMounted = true;

    async function fetchMeeting() {
      try {
        const data = await getMeeting(meetingId);
        if (isMounted && data) {
          setMeeting(data);
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
        // Fall back to meetingData if fetch fails
        if (isMounted && meetingDataRef.current) {
          setMeeting(meetingDataRef.current);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMeeting();

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  const handleResponse = async (status: MeetingStatus) => {
    if (!meeting) return;

    setUpdating(true);
    try {
      await updateMeetingStatus(meeting.id, status);
      setMeeting({ ...meeting, status });
    } catch (error) {
      console.error("Error updating meeting status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  // Check if current user is the one who needs to respond (can accept/reject)
  // Uses pendingApprovalFrom to handle both initial invites and reschedules
  const canRespond =
    meeting &&
    currentUser &&
    meeting.pendingApprovalFrom === currentUser.uid &&
    meeting.status === "pending";

  // Check if this is a reschedule
  const isReschedule = meeting?.previousDate && meeting?.previousTime;

  if (loading) {
    return (
      <div
        className={`w-64 rounded-xl p-4 ${
          isDarkMode ? "bg-zinc-700" : "bg-gray-300"
        }`}
      >
        <p className="text-sm text-center">Loading meeting...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div
        className={`w-64 rounded-xl p-4 ${
          isDarkMode ? "bg-zinc-700" : "bg-gray-300"
        }`}
      >
        <p className="text-sm text-center">Meeting not found</p>
      </div>
    );
  }

  return (
    <div
      className={`w-72 rounded-xl overflow-hidden ${
        isOwnMessage
          ? isDarkMode
            ? "bg-indigo-700"
            : "bg-indigo-600"
          : isDarkMode
            ? "bg-zinc-700"
            : "bg-gray-300"
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between ${
          isDarkMode ? "bg-zinc-800/50" : "bg-black/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaCalendarAlt size={14} />
          <span className="font-semibold text-sm">
            {isReschedule ? "Rescheduled Meeting" : "Meeting Invite"}
          </span>
        </div>
        {getStatusBadge(meeting.status)}
      </div>

      {/* Meeting Details */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt
            size={14}
            className={`mt-1 shrink-0 ${
              isOwnMessage ? "text-indigo-200" : "text-gray-400"
            }`}
          />
          <div>
            <p className="font-medium text-sm">
              {meeting.location?.name || "Location"}
            </p>
            {meeting.location?.address && (
              <p
                className={`text-xs ${
                  isOwnMessage
                    ? "text-indigo-200"
                    : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {meeting.location.address}
              </p>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-3">
          <FaClock
            size={14}
            className={`shrink-0 ${
              isOwnMessage ? "text-indigo-200" : "text-gray-400"
            }`}
          />
          <p className="text-sm">
            {formatDate(meeting.scheduledDate)} at{" "}
            {formatTime(meeting.scheduledTime)}
          </p>
        </div>

        {/* Previous schedule for reschedules */}
        {isReschedule && (
          <p
            className={`text-xs ${
              isOwnMessage
                ? "text-indigo-200/70"
                : isDarkMode
                  ? "text-gray-500"
                  : "text-gray-500"
            }`}
          >
            Previously: {formatDate(meeting.previousDate!)} at{" "}
            {formatTime(meeting.previousTime!)}
          </p>
        )}
      </div>

      {/* Action Buttons - Only show for invitee when pending */}
      {canRespond && (
        <div
          className={`flex border-t ${
            isDarkMode ? "border-zinc-600" : "border-black/10"
          }`}
        >
          <button
            onClick={() => handleResponse("rejected")}
            disabled={updating}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              isOwnMessage
                ? "hover:bg-red-500/30 text-red-200"
                : "hover:bg-red-500/20 text-red-400"
            } disabled:opacity-50`}
          >
            <FaTimes size={12} />
            Decline
          </button>
          <div
            className={`w-px ${isDarkMode ? "bg-zinc-600" : "bg-black/10"}`}
          />
          <button
            onClick={() => handleResponse("accepted")}
            disabled={updating}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              isOwnMessage
                ? "hover:bg-green-500/30 text-green-200"
                : "hover:bg-green-500/20 text-green-400"
            } disabled:opacity-50`}
          >
            <FaCheck size={12} />
            Accept
          </button>
        </div>
      )}

      {/* Status message for non-pending states */}
      {meeting.status !== "pending" && !canRespond && (
        <div
          className={`px-4 py-2 text-center text-xs ${
            isDarkMode ? "bg-zinc-800/30" : "bg-black/5"
          }`}
        >
          {meeting.status === "accepted"
            ? "Meeting confirmed!"
            : "Meeting declined"}
        </div>
      )}
    </div>
  );
};

export default MeetingInviteCard;
