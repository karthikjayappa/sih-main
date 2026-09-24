"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

type Props = {
  geometry: string;
  ownerName: string;
  area: string;
  village: string;
};

function FitBounds({ geometry }: Pick<Props, "geometry">) {
  const map = useMap();

  useEffect(() => {
    try {
      const geoJson = JSON.parse(geometry);

      const layer = new (require("leaflet").GeoJSON)(geoJson);

      map.fitBounds(layer.getBounds(), {
        padding: [30, 30],
      });
    } catch (error) {
      console.error("Invalid parcel geometry:", error);
    }
  }, [geometry, map]);

  return null;
}

export default function CitizenParcelMap({
  geometry,
  ownerName,
  area,
  village,
}: Props) {
  let geoJson: GeoJsonObject;

  try {
    geoJson = JSON.parse(geometry);
  } catch {
    return (
      <div className="rounded-xl border p-6 text-sm text-red-600">
        Unable to display parcel geometry.
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full overflow-hidden rounded-xl border">
      <MapContainer
        center={[14.503, 76.025]}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          data={geoJson}
          style={{
            color: "#2563eb",
            weight: 3,
            fillOpacity: 0.25,
          }}
          onEachFeature={(_, layer) => {
            layer.bindPopup(`
          <strong>Land Parcel</strong><br />
          Owner: ${ownerName}<br />
          Area: ${area} m²<br />
          Village: ${village}
            `);
          }}
        />

        <FitBounds geometry={geometry} />
      </MapContainer>
    </div>
  );
}
