"use client";
import React from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const MapComponent = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const center = { lat: 51.5074, lng: -0.1278 }; // London

  return (
    <div style={{ height: 500, width: "100%" }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <Marker position={center} />
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapComponent;
