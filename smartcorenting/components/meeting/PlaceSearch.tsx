import { PlacePicked } from "@/types";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import React, { useEffect, useRef } from "react";

interface PlaceSearchProps {
  onPicked: (place: PlacePicked) => void;
}

const PlaceSearch = ({ onPicked }: PlaceSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib) return;
    if (!inputRef.current) return;

    // Create Autocomplete on the input
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "gb" },
      fields: ["place_id", "geometry"],
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const placeId = place.place_id;
      const loc = place.geometry?.location;

      if (!placeId) return;

      onPicked({
        placeId,
        lat: loc?.lat(),
        lng: loc?.lng(),
      });
    });

    return () => {
      listener.remove();
    };
  }, [onPicked, placesLib]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter Location or Postcode"
        className="w-full bg-white text-black rounded-xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      />
      <svg
        className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default PlaceSearch;
