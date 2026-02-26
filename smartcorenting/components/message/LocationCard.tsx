import React from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaCopy,
  FaStar,
} from "react-icons/fa";
import { PlaceDetails } from "@/types";

interface LocationCardProps {
  location: PlaceDetails;
  isDarkMode: boolean;
  isOwnMessage: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isDarkMode,
  isOwnMessage,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  const hasCoordinates = location.lat && location.lng;

  const handleOpenInMaps = () => {
    if (location.lat && location.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}&query_place_id=${location.placeId}`;
      window.open(url, "_blank");
    } else if (location.placeId) {
      const url = `https://www.google.com/maps/place/?q=place_id:${location.placeId}`;
      window.open(url, "_blank");
    }
  };

  const handleCopyAddress = () => {
    if (location.address) {
      navigator.clipboard.writeText(location.address);
    }
  };

  const handleGetDirections = () => {
    if (location.lat && location.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=${location.placeId}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div
      className={`w-64 rounded-xl overflow-hidden ${
        isOwnMessage
          ? isDarkMode
            ? "bg-indigo-700"
            : "bg-indigo-600"
          : isDarkMode
            ? "bg-zinc-700"
            : "bg-gray-300"
      }`}
    >
      {/* Map Preview - Interactive map */}
      <div
        className={`h-28 relative flex items-center justify-center overflow-hidden ${
          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
        }`}
        onClick={handleOpenInMaps}
        style={{ cursor: "pointer" }}
      >
        {hasCoordinates && apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: location.lat!, lng: location.lng! }}
              defaultZoom={15}
              mapId={mapId}
              gestureHandling="none"
              disableDefaultUI={true}
              clickableIcons={false}
              style={{ width: "100%", height: "100%" }}
            >
              <AdvancedMarker
                position={{ lat: location.lat!, lng: location.lng! }}
              />
            </Map>
          </APIProvider>
        ) : (
          <FaMapMarkerAlt
            size={32}
            className={isOwnMessage ? "text-indigo-400" : "text-gray-500"}
          />
        )}
        <div
          className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium z-10 ${
            isDarkMode ? "bg-black/50 text-white" : "bg-white/80 text-black"
          }`}
        >
          View Map
        </div>
      </div>

      {/* Location Details */}
      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1 truncate">
          {location.name || "Shared Location"}
        </h4>

        {location.rating && (
          <div className="flex items-center gap-1 mb-2">
            <FaStar size={12} className="text-yellow-400" />
            <span className="text-xs opacity-80">
              {location.rating.toFixed(1)}
            </span>
          </div>
        )}

        {location.address && (
          <p
            className={`text-xs mb-3 line-clamp-2 ${
              isOwnMessage
                ? "text-indigo-100"
                : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-600"
            }`}
          >
            {location.address}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleGetDirections}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              isOwnMessage
                ? "bg-white/20 hover:bg-white/30 text-white"
                : isDarkMode
                  ? "bg-zinc-600 hover:bg-zinc-500 text-white"
                  : "bg-gray-200 hover:bg-gray-100 text-gray-800"
            }`}
          >
            <FaExternalLinkAlt size={10} />
            Directions
          </button>

          <button
            onClick={handleCopyAddress}
            disabled={!location.address}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 ${
              isOwnMessage
                ? "bg-white/20 hover:bg-white/30 text-white"
                : isDarkMode
                  ? "bg-zinc-600 hover:bg-zinc-500 text-white"
                  : "bg-gray-200 hover:bg-gray-100 text-gray-800"
            }`}
          >
            <FaCopy size={10} />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
