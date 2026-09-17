export function ArchitectureDiagram() {
  const stages = [
    { label: "Ingestion", sub: "CSV · Shapefile · GeoJSON · WFS" },
    { label: "Harmonization", sub: "Schema mapping + unit conversion" },
    { label: "Conflation", sub: "ID + geometry matching engine" },
    { label: "API / UI", sub: "Unified map, search, conflicts" },
  ];

  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <h2 className="font-serif text-2xl font-semibold text-ink">System architecture</h2>
        <p className="mt-2 max-w-xl text-[14px] text-ink-soft">
          Sources feed a pipeline that produces one authoritative parcel layer, with
          PostgreSQL and PostGIS as the spatial system of record.
        </p>

        <div className="mt-10 overflow-x-auto">
          <svg
            viewBox="0 0 980 220"
            className="min-w-[720px] w-full"
            role="img"
            aria-label="Architecture diagram: Ingestion feeds Harmonization, which feeds Conflation, which feeds API and UI, all backed by PostgreSQL with PostGIS."
          >
            {stages.map((s, i) => {
              const x = 20 + i * 240;
              return (
                <g key={s.label}>
                  <rect
                    x={x}
                    y={40}
                    width={200}
                    height={90}
                    rx={3}
                    fill="#FFFFFF"
                    stroke="#2C4A63"
                    strokeWidth={1.4}
                  />
                  <text x={x + 100} y={75} textAnchor="middle" fontSize={15} fontWeight={600} fill="#1E2430" fontFamily="var(--font-serif), serif">
                    {s.label}
                  </text>
                  <text x={x + 100} y={98} textAnchor="middle" fontSize={10.5} fill="#4A5262" fontFamily="var(--font-mono), monospace">
                    {s.sub}
                  </text>
                  {i < stages.length - 1 && (
                    <path
                      d={`M ${x + 200} 85 L ${x + 240} 85`}
                      stroke="#A9812E"
                      strokeWidth={2}
                      markerEnd="url(#arrow)"
                    />
                  )}
                </g>
              );
            })}

            <rect x={20} y={170} width={920} height={36} rx={3} fill="#EAF2ED" stroke="#3C6E52" strokeWidth={1} />
            <text x={480} y={193} textAnchor="middle" fontSize={12} fill="#28503A" fontFamily="var(--font-mono), monospace">
              PostgreSQL + PostGIS — spatial system of record (source_parcels, unified_parcels, audit_log)
            </text>

            {stages.map((s, i) => {
              const x = 20 + i * 240 + 100;
              return (
                <line key={`link-${s.label}`} x1={x} y1={130} x2={x} y2={170} stroke="#DCD6C7" strokeWidth={1.4} strokeDasharray="3 3" />
              );
            })}

            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#A9812E" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
