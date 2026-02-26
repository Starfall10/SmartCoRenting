"use client";
import React, { useEffect } from "react";
import {
  AdvancedMarker,
  Map,
  MapMouseEvent,
  useMap,
} from "@vis.gl/react-google-maps";

interface MapComponentProps {
  center: { lat: number; lng: number };
  onMapClick?: (event: MapMouseEvent) => void;
}

const MapComponent = ({ center, onMapClick }: MapComponentProps) => {
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  const map = useMap();

  // Pan to new center when it changes (from search or POI click)
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng, center]);

  return (
    <div className="h-full w-full">
      <Map
        defaultCenter={center}
        defaultZoom={12}
        mapId={mapId}
        gestureHandling="greedy"
        disableDefaultUI={false}
        onClick={onMapClick}
      >
        <AdvancedMarker position={center} />
      </Map>
    </div>
  );
};

export default MapComponent;
