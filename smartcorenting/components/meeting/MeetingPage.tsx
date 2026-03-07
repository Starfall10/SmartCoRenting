/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import { APIProvider } from "@vis.gl/react-google-maps";
import { PlaceDetails, UserData, Meeting } from "@/types";
import PlaceSearch from "./PlaceSearch";
import ContactPickerModal from "./ContactPickerModal";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import { subscribeToUserMeetings } from "@/lib/firebase/meetings";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaRedo,
  FaEnvelope,
} from "react-icons/fa";

interface MeetingPageProps {
  isDarkMode: boolean;
  currentUser: UserData | null;
}

const MeetingPage: React.FC<MeetingPageProps> = ({
  isDarkMode,
  currentUser,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const [selected, setSelected] = React.useState<PlaceDetails | null>(null);
  const [isContactPickerOpen, setIsContactPickerOpen] = React.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState<Meeting | null>(
    null,
  );
  const [sendingIcs, setSendingIcs] = useState<Record<string, boolean>>({});
  const center =
    selected?.lat && selected?.lng
      ? { lat: selected.lat, lng: selected.lng }
      : { lat: 51.5074, lng: -0.1278 };

  async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const { PlacesService } = (await google.maps.importLibrary(
      "places",
    )) as google.maps.PlacesLibrary;

    const dummyDiv = document.createElement("div");
    const service = new PlacesService(dummyDiv);

    return await new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: [
            "name",
            "rating",
            "formatted_address",
            "geometry",
            "url",
            "website",
          ],
        },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            reject(new Error(`getDetails failed: ${status}`));
            return;
          }

          resolve({
            placeId,
            name: place.name ?? undefined,
            rating: place.rating ?? undefined,
            description: place.website ?? place.url ?? undefined,
            address: place.formatted_address ?? undefined,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          });
        },
      );
    });
  }

  // Subscribe to user's meetings
  useEffect(() => {
    if (!currentUser) {
      setMeetingsLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserMeetings(
      currentUser.uid,
      (userMeetings) => {
        setMeetings(userMeetings);
        setMeetingsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Filter for upcoming accepted meetings
  const upcomingMeetings = meetings.filter((m) => {
    if (m.status !== "accepted") return false;
    const meetingDate = new Date(`${m.scheduledDate}T${m.scheduledTime}`);
    return meetingDate > new Date();
  });

  // Filter for pending meetings (invites)
  const pendingMeetings = meetings.filter((m) => m.status === "pending");

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

  const handleReschedule = (meeting: Meeting) => {
    // Set the location from the meeting
    setSelected(meeting.location);
    setRescheduleTarget(meeting);
    setIsScheduleModalOpen(true);
  };

  const handleSendIcs = async (meeting: Meeting) => {
    setSendingIcs((prev) => ({ ...prev, [meeting.id]: true }));
    try {
      const response = await fetch("/api/send-ics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meeting.id,
          title: `Meeting at ${meeting.location?.name || "TBD"}`,
          description: `Meeting between ${meeting.creatorName} and ${meeting.inviteeName}`,
          locationName: meeting.location?.name,
          locationAddress: meeting.location?.address,
          scheduledDate: meeting.scheduledDate,
          scheduledTime: meeting.scheduledTime,
          inviteeName: meeting.inviteeName,
          creatorName: meeting.creatorName,
        }),
      });
      if (response.ok) {
        alert("Calendar invite sent to yusei5283@gmail.com!");
      } else {
        const data = await response.json();
        alert(`Failed to send: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending ICS:", error);
      alert("Failed to send calendar invite");
    } finally {
      setSendingIcs((prev) => ({ ...prev, [meeting.id]: false }));
    }
  };

  return (
    <APIProvider apiKey={apiKey} libraries={["places", "marker"]}>
      <div
        className={`min-h-screen pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        {/* header */}
        <div className="p-6">
          <h2
            className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            MeetinPlan
          </h2>
          <h1 className="text-3xl font-bold mb-6">Plan a Meeting</h1>
        </div>

        {/* Map Area */}
        <div className="relative h-[50vh] mb-6">
          {/* Map (background) */}
          <div className="absolute inset-0 z-0">
            <MapComponent
              center={center}
              onMapClick={async (event) => {
                const placeId = event.detail.placeId;
                if (placeId) {
                  try {
                    const details = await fetchPlaceDetails(placeId);
                    console.log("POI clicked:", details);
                    setSelected(details);
                  } catch (err) {
                    console.error(
                      "Failed to fetch place details from map click:",
                      err,
                    );
                  }
                }
              }}
            />
          </div>

          {/* Search Bar Overlay (foreground, clickable) */}
          <div className="absolute top-4 left-4 right-4 z-50 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur rounded-xl p-1">
              <PlaceSearch
                onPicked={async ({ placeId }) => {
                  try {
                    const details = await fetchPlaceDetails(placeId);
                    console.log("Picked details:", details);
                    setSelected(details);
                  } catch (err) {
                    console.error("Failed to fetch place details:", err);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="px-6">
          <div
            className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
          >
            <h3 className="text-xl font-bold mb-2">
              {selected?.name ?? "Select a location"}
            </h3>

            <div className="flex items-center mb-4">
              <span
                className={`text-sm mr-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Rating{" "}
                {selected?.rating ? `${selected.rating.toFixed(1)}/5` : "N/A"}
              </span>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selected}
                onClick={() => setIsContactPickerOpen(true)}
              >
                Share Location
              </button>

              <button
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-black"
                }`}
                disabled={!selected?.address}
                onClick={() =>
                  selected?.address &&
                  navigator.clipboard.writeText(selected.address)
                }
              >
                Copy Address
              </button>
            </div>

            {/* Schedule Meeting Button */}
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              disabled={!selected}
              onClick={() => {
                setRescheduleTarget(null);
                setIsScheduleModalOpen(true);
              }}
            >
              <FaCalendarAlt size={16} />
              Schedule Meeting
            </button>

            <p
              className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {selected?.description ??
                selected?.address ??
                "Pick a place to see details here."}
            </p>
          </div>
        </div>

        {/* Upcoming Meetings Section */}
        <div className="px-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Meetings</h2>

          {meetingsLoading ? (
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Loading meetings...
            </p>
          ) : upcomingMeetings.length === 0 ? (
            <div
              className={`rounded-2xl p-6 text-center ${
                isDarkMode ? "bg-zinc-900" : "bg-gray-100"
              }`}
            >
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                No upcoming meetings
              </p>
              <p
                className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                Select a location and schedule a meeting to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`rounded-2xl p-4 ${
                    isDarkMode ? "bg-zinc-900" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMapMarkerAlt
                          size={14}
                          className={
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }
                        />
                        <h3 className="font-semibold">
                          {meeting.location?.name || "Meeting Location"}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt
                            size={12}
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          />
                          <span className="text-sm">
                            {formatDate(meeting.scheduledDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock
                            size={12}
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          />
                          <span className="text-sm">
                            {formatTime(meeting.scheduledTime)}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        With:{" "}
                        {meeting.creatorUid === currentUser?.uid
                          ? meeting.inviteeName
                          : meeting.creatorName}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendIcs(meeting)}
                        disabled={sendingIcs[meeting.id]}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? "hover:bg-zinc-800 text-gray-400"
                            : "hover:bg-gray-200 text-gray-600"
                        } disabled:opacity-50`}
                        title="Send calendar invite"
                      >
                        {sendingIcs[meeting.id] ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <FaEnvelope size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => handleReschedule(meeting)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? "hover:bg-zinc-800 text-gray-400"
                            : "hover:bg-gray-200 text-gray-600"
                        }`}
                        title="Reschedule"
                      >
                        <FaRedo size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Picker Modal */}
        {selected && (
          <ContactPickerModal
            isOpen={isContactPickerOpen}
            onClose={() => setIsContactPickerOpen(false)}
            location={selected}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Schedule Meeting Modal */}
        {selected && (
          <ScheduleMeetingModal
            isOpen={isScheduleModalOpen}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setRescheduleTarget(null);
            }}
            location={selected}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            existingMeeting={rescheduleTarget || undefined}
            isReschedule={!!rescheduleTarget}
          />
        )}
      </div>
    </APIProvider>
  );
};

export default MeetingPage;
