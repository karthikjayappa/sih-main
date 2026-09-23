"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { ParcelGeometry, UnifiedParcel, SourceParcel } from "@/lib/types";
import { SOURCE_COLOR, SOURCE_LABEL, formatArea } from "@/lib/utils";

const FALLBACK_CENTER: [number, number] = [14.4644, 75.9218];

function geometryPoints(geometry: ParcelGeometry): [number, number][] {
  const points: [number, number][] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value) && typeof value[0] === "number" && typeof value[1] === "number") {
      points.push([value[1], value[0]]);
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
  };
  visit(geometry.coordinates);
  return points;
}

function FlyToParcel({ parcel }: { parcel: UnifiedParcel | null }) {
  const map = useMap();
  useEffect(() => {
    if (!parcel) return;
    const latlngs = geometryPoints(parcel.geometry);
    if (latlngs.length === 0) return;
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
  const allParcels = [...unifiedParcels, ...sourceParcels];
  const firstPoint = allParcels.flatMap((parcel) => geometryPoints(parcel.geometry))[0];

  return (
    <MapContainer center={firstPoint || FALLBACK_CENTER} zoom={15} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToParcel parcel={flyToParcel} />

      {mode === "before" &&
        sourceParcels.map((sp, i) => (
          <GeoJSON
            key={`${sp.sourceSystem}-${sp.sourceParcelId}-${i}`}
            data={{ type: "Feature", properties: {}, geometry: sp.geometry } as any}
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
          </GeoJSON>
        ))}

      {mode === "after" &&
        unifiedParcels.map((up) => (
          <GeoJSON
            key={up.unifiedParcelId}
            data={{ type: "Feature", properties: {}, geometry: up.geometry } as any}
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
          </GeoJSON>
        ))}
    </MapContainer>
  );
}
