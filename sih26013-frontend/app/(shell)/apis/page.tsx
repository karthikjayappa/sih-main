import Link from "next/link";
import { ApiEndpoint, type ApiEndpointSpec } from "@/components/apis/ApiEndpoint";
import { Landmark } from "lucide-react";

const ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: "search",
    method: "GET",
    path: "/parcels/search?q=",
    description:
      "Free-text search across parcel ID, owner name, village, tehsil and district in the unified layer. Returns a lightweight list for search-as-you-type UIs.",
    response: `{
  "data": [
    {
      "unifiedParcelId": "UP-100014",
      "parcelId": "UL-MY-1015",
      "ownerName": "Manjunath Gowda",
      "village": "Bogadi",
      "tehsil": "Mysuru South",
      "areaSqm": 812.4,
      "conflictFlag": false,
      "status": "RESOLVED"
    }
  ],
  "meta": { "count": 1 }
}`,
  },
  {
    id: "parcel-detail",
    method: "GET",
    path: "/parcels/{id}",
    description:
      "Full detail for one unified parcel: resolved attributes, every source record that was merged into it, and its current conflict state.",
    response: `{
  "data": {
    "unifiedParcelId": "UP-100014",
    "parcelId": "UL-MY-1015",
    "ownerName": "Manjunath Gowda",
    "areaSqm": 812.4,
    "village": "Bogadi",
    "tehsil": "Mysuru South",
    "district": "Mysuru",
    "sources": ["REVENUE", "SURVEY", "MUNICIPAL"],
    "conflictFlag": false,
    "conflictTypes": [],
    "status": "RESOLVED"
  }
}`,
  },
  {
    id: "conflicts",
    method: "GET",
    path: "/conflicts?status=&conflictType=",
    description:
      "Lists unified parcels currently flagged for review, filterable by status, conflict type, village and tehsil.",
    request: `GET /conflicts?status=PENDING_REVIEW&conflictType=OWNER_MISMATCH`,
    response: `{
  "data": [
    {
      "unifiedParcelId": "UP-100002",
      "parcelId": "UL-MY-1003",
      "conflictTypes": ["OWNER_MISMATCH"],
      "status": "PENDING_REVIEW",
      "sources": ["REVENUE", "SURVEY"]
    }
  ],
  "meta": { "count": 1 }
}`,
  },
  {
    id: "update-conflict",
    method: "PATCH",
    path: "/conflicts/{unifiedParcelId}",
    description:
      "Updates a conflict's review status and appends an entry to its audit log. Used by the Conflicts Dashboard's review actions.",
    request: `{
  "status": "RESOLVED",
  "notes": "Field-verified with tehsildar's office.",
  "resolvedBy": "officer.k.reddy"
}`,
    response: `{
  "data": {
    "unifiedParcelId": "UP-100002",
    "status": "RESOLVED",
    "updatedAt": "2026-09-05T10:42:00Z"
  }
}`,
  },
  {
    id: "audit",
    method: "GET",
    path: "/parcels/{id}/audit",
    description: "Returns the full audit trail for a unified parcel: who changed what, when, and why.",
    response: `{
  "data": [
    { "timestamp": "2026-08-14T09:00:00Z", "actor": "system.ingestion", "action": "INGESTED", "detail": "Source record ingested from REVENUE (KH-MY100)" },
    { "timestamp": "2026-08-17T09:00:00Z", "actor": "system.conflation", "action": "MERGED", "detail": "Merged 3 source record(s) using rule: ID match + geometry distance < 5m" }
  ]
}`,
  },
  {
    id: "ingest",
    method: "POST",
    path: "/ingest",
    description:
      "Accepts a multipart file plus source metadata, runs it through the mapping profile, and returns ingestion counts.",
    request: `POST /ingest
Content-Type: multipart/form-data

file: revenue_mysuru.csv
sourceSystem: REVENUE
mappingProfileId: revenue-csv-mysuru`,
    response: `{
  "data": {
    "datasetId": "revenue-csv-mysuru",
    "ingested": 62,
    "mapped": 60,
    "warnings": ["2 record(s) skipped: missing or invalid geometry"]
  }
}`,
  },
];

export default function ApisPage() {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-5 py-6 md:px-8 md:py-8">
      <aside className="hidden w-48 flex-shrink-0 lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center gap-2 rounded border border-line bg-white px-3 py-2.5">
            <Landmark className="h-3.5 w-3.5 text-ledger-500" />
            <span className="text-[12px] text-ink-soft">Java/Spring Boot + PostgreSQL/PostGIS</span>
          </div>
          <nav className="space-y-1">
            {ENDPOINTS.map((e) => (
              <Link
                key={e.id}
                href={`#${e.id}`}
                className="block rounded px-2.5 py-1.5 font-mono text-[12px] text-ink-soft hover:bg-paper-dim hover:text-ink"
              >
                {e.method} {e.path.split("?")[0]}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <p className="max-w-2xl text-[13.5px] text-ink-soft">
          This service exposes the unified land record layer as JSON over REST. The conceptual
          backend is Java / Spring Boot with PostgreSQL and the PostGIS extension for spatial
          storage and queries; in this MVP, responses are served from local mock data.
        </p>
        <div className="mt-6">
          {ENDPOINTS.map((e) => (
            <ApiEndpoint key={e.id} endpoint={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
