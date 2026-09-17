"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { UnifiedParcel, SourceParcel } from "@/lib/types";
import { SOURCE_COLOR, SOURCE_LABEL, formatArea } from "@/lib/utils";

const CENTER: [number, number] = [12.324, 76.625];

function toLatLngs(geometry: [number, number][]): [number, number][] {
  return geometry.map(([lng, lat]) => [lat, lng]);
}

function FlyToParcel({ parcel }: { parcel: UnifiedParcel | null }) {
  const map = useMap();
  useEffect(() => {
    if (!parcel) return;
    const latlngs = toLatLngs(parcel.geometry);
    const lat = latlngs.reduce((s, p) => s + p[0], 0) / latlngs.length;
    const lng = latlngs.reduce((s, p) => s + p[1], 0) / latlngs.length;
    map.flyTo([lat, lng], 18, { duration: 0.6 });
  }, [parcel, map]);
  return null;
}

export function ParcelMap({
  mode,
  unifiedParcels,
  sourceParcels,
  flyToParcel,
  onSelectUnified,
}: {
  mode: "before" | "after";
  unifiedParcels: UnifiedParcel[];
  sourceParcels: SourceParcel[];
  flyToParcel: UnifiedParcel | null;
  onSelectUnified: (parcel: UnifiedParcel) => void;
}) {
  return (
    <MapContainer center={CENTER} zoom={15} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToParcel parcel={flyToParcel} />

      {mode === "before" &&
        sourceParcels.map((sp, i) => (
          <Polygon
            key={`${sp.sourceSystem}-${sp.sourceParcelId}-${i}`}
            positions={toLatLngs(sp.geometry)}
            pathOptions={{
              color: SOURCE_COLOR[sp.sourceSystem],
              weight: 1.5,
              fillOpacity: 0.28,
            }}
          >
            <Popup>
              <div className="font-sans text-[13px]">
                <p className="font-mono text-[11px] font-semibold text-ledger-700">
                  {SOURCE_LABEL[sp.sourceSystem]} · {sp.sourceParcelId}
                </p>
                <p className="mt-1 font-medium">{sp.ownerName}</p>
                <p className="text-ink-soft">{formatArea(sp.areaSqm)}</p>
                <p className="text-ink-soft">
                  {sp.village}, {sp.tehsil}
                </p>
              </div>
            </Popup>
          </Polygon>
        ))}

      {mode === "after" &&
        unifiedParcels.map((up) => (
          <Polygon
            key={up.unifiedParcelId}
            positions={toLatLngs(up.geometry)}
            eventHandlers={{ click: () => onSelectUnified(up) }}
            pathOptions={{
              color: up.conflictFlag ? "#B5502D" : "#3C6E52",
              weight: up.conflictFlag ? 2 : 1.5,
              fillOpacity: up.conflictFlag ? 0.32 : 0.22,
            }}
          >
            <Popup>
              <div className="font-sans text-[13px]">
                <p className="font-mono text-[11px] font-semibold text-ledger-700">{up.parcelId}</p>
                <p className="mt-1 font-medium">{up.ownerName}</p>
                <p className="text-ink-soft">{formatArea(up.areaSqm)}</p>
                <p className="text-ink-soft">
                  {up.village}, {up.tehsil}
                </p>
                {up.conflictFlag && (
                  <p className="mt-1 font-medium text-rust-700">Conflict flagged — click parcel for details</p>
                )}
              </div>
            </Popup>
          </Polygon>
        ))}
    </MapContainer>
  );
}
