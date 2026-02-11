import React from "react";
import MapComponent from "./MapComponent";
import { APIProvider } from "@vis.gl/react-google-maps";
import { PlaceDetails } from "@/types";
import PlaceSearch from "./PlaceSearch";

interface MeetingPageProps {
  isDarkMode: boolean;
}

const MeetingPage: React.FC<MeetingPageProps> = ({ isDarkMode }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const [selected, setSelected] = React.useState<PlaceDetails | null>(null);
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
            <MapComponent center={center} />
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
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                disabled={!selected}
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

            <p
              className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {selected?.description ??
                selected?.address ??
                "Pick a place to see details here."}
            </p>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};

export default MeetingPage;
