"use client";
import React from "react";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";

interface MapComponentProps {
  center: { lat: number; lng: number };
}

const MapComponent = ({ center }: MapComponentProps) => {
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  return (
    <div className="h-full w-full">
      <Map
        defaultCenter={center}
        defaultZoom={12}
        mapId={mapId}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <AdvancedMarker position={center} />
      </Map>
    </div>
  );
};

export default MapComponent;
