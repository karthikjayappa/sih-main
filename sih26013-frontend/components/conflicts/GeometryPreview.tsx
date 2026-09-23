import type { ParcelGeometry, SourceParcel } from "@/lib/types";
import { SOURCE_COLOR, SOURCE_LABEL } from "@/lib/utils";

export function GeometryPreview({ records }: { records: SourceParcel[] }) {
  const allPoints = records.flatMap((r) => flattenGeometry(r.geometry));
  const lngs = allPoints.map((p) => p[0]);
  const lats = allPoints.map((p) => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const pad = 0.15;
  const spanLng = (maxLng - minLng) || 0.0001;
  const spanLat = (maxLat - minLat) || 0.0001;

  const W = 260;
  const H = 180;

  function project([lng, lat]: [number, number]) {
    const x = ((lng - minLng) / spanLng) * (W * (1 - 2 * pad)) + W * pad;
    // flip y so north is up
    const y = H - (((lat - minLat) / spanLat) * (H * (1 - 2 * pad)) + H * pad);
    return [x, y];
  }

  return (
    <div className="rounded border border-line bg-paper p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Overlapping source geometries for this parcel">
        <rect x={0} y={0} width={W} height={H} fill="#F7F5EF" />
        {records.map((r, i) => {
          const points = flattenGeometry(r.geometry)
            .map((pt) => project(pt).join(","))
            .join(" ");
          return (
            <polygon
              key={i}
              points={points}
              fill={SOURCE_COLOR[r.sourceSystem]}
              fillOpacity={0.28}
              stroke={SOURCE_COLOR[r.sourceSystem]}
              strokeWidth={1.6}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        {records.map((r, i) => (
          <span key={i} className="flex items-center gap-1.5 font-mono text-[10.5px] text-ink-soft">
            <span className="h-2 w-2 rounded-sm" style={{ background: SOURCE_COLOR[r.sourceSystem] }} />
            {SOURCE_LABEL[r.sourceSystem]}
          </span>
        ))}
      </div>
    </div>
  );
}

function flattenGeometry(geometry: ParcelGeometry): [number, number][] {
  const points: [number, number][] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value) && typeof value[0] === "number" && typeof value[1] === "number") {
      points.push([value[0], value[1]]);
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
  };
  visit(geometry.coordinates);
  return points;
}
