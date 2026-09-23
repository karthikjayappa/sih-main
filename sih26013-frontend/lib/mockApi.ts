import parcelsData from "@/mock/parcels.json";
import datasetsData from "@/mock/datasets.json";
import mappingProfilesData from "@/mock/mappingProfiles.json";
import dashboardData from "@/mock/dashboard.json";
import sourceParcelsData from "@/mock/sourceParcels.json";
import type {
  UnifiedParcel,
  Dataset,
  MappingProfile,
  DashboardMetrics,
  SourceParcel,
  ConflictStatus,
  ConflictType,
} from "./types";

// In-memory mutable copy so status updates persist for the session (no backend yet).
let unifiedParcels: UnifiedParcel[] = JSON.parse(JSON.stringify(parcelsData));
const datasets: Dataset[] = datasetsData as unknown as Dataset[];
const mappingProfiles: MappingProfile[] = mappingProfilesData as unknown as MappingProfile[];
const sourceParcels: SourceParcel[] = sourceParcelsData as unknown as SourceParcel[];
const dashboard: DashboardMetrics = dashboardData as unknown as DashboardMetrics;

const LATENCY_MS = 260;

function delay<T>(value: T, ms: number = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface ParcelSearchParams {
  q?: string;
  parcelId?: string;
  ownerName?: string;
  village?: string;
  tehsil?: string;
  district?: string;
}

/** GET /parcels/search?q=... */
export async function searchParcels(params: ParcelSearchParams): Promise<UnifiedParcel[]> {
  const q = (params.q || "").trim().toLowerCase();
  let results = unifiedParcels;

  if (q) {
    results = results.filter((p) =>
      [p.parcelId, p.ownerName, p.village, p.tehsil, p.district]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  if (params.village) results = results.filter((p) => p.village === params.village);
  if (params.tehsil) results = results.filter((p) => p.tehsil === params.tehsil);
  if (params.district) results = results.filter((p) => p.district === params.district);

  return delay(results);
}

/** GET /parcels/{id} */
export async function getParcelById(id: string): Promise<UnifiedParcel | null> {
  const found = unifiedParcels.find(
    (p) => p.unifiedParcelId === id || p.parcelId === id
  );
  return delay(found ?? null);
}

export interface ConflictFilterParams {
  status?: ConflictStatus | "ALL";
  conflictType?: ConflictType | "ALL";
  village?: string;
  tehsil?: string;
}

/** GET /conflicts */
export async function getConflicts(filters: ConflictFilterParams = {}): Promise<UnifiedParcel[]> {
  let results = unifiedParcels.filter((p) => p.conflictFlag);
  if (filters.status && filters.status !== "ALL") {
    results = results.filter((p) => p.status === filters.status);
  }
  if (filters.conflictType && filters.conflictType !== "ALL") {
    results = results.filter((p) => p.conflictTypes.includes(filters.conflictType as ConflictType));
  }
  if (filters.village) results = results.filter((p) => p.village === filters.village);
  if (filters.tehsil) results = results.filter((p) => p.tehsil === filters.tehsil);
  return delay(results);
}

/** PATCH /conflicts/{unifiedParcelId} */
export async function updateConflictStatus(
  unifiedParcelId: string,
  payload: { status: ConflictStatus; notes?: string; resolvedBy?: string }
): Promise<UnifiedParcel | null> {
  const idx = unifiedParcels.findIndex((p) => p.unifiedParcelId === unifiedParcelId);
  if (idx === -1) return delay(null);

  const parcel = unifiedParcels[idx];
  const updated: UnifiedParcel = {
    ...parcel,
    status: payload.status,
    updatedAt: new Date().toISOString(),
    auditLog: [
      ...parcel.auditLog,
      {
        timestamp: new Date().toISOString(),
        actor: payload.resolvedBy || "system",
        action: payload.status,
        detail: payload.notes || `Status changed to ${payload.status}`,
      },
    ],
  };
  unifiedParcels[idx] = updated;
  return delay(updated);
}

/** GET /parcels/{id}/audit */
export async function getParcelAudit(id: string) {
  const parcel = unifiedParcels.find(
    (p) => p.unifiedParcelId === id || p.parcelId === id
  );
  return delay(parcel?.auditLog ?? []);
}

/** GET dataset catalogue (for the ingestion page) */
export async function getDatasets(): Promise<Dataset[]> {
  return delay(datasets);
}

export async function getMappingProfile(datasetId: string): Promise<MappingProfile | null> {
  return delay(mappingProfiles.find((m) => m.datasetId === datasetId) ?? null);
}

/** GET dashboard summary metrics */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return delay(dashboard);
}

/** GET all unified parcels (map view) */
export async function getAllParcels(): Promise<UnifiedParcel[]> {
  return delay(unifiedParcels);
}

/** GET raw, pre-conflation source parcels (for the "Before Harmonization" map layer) */
export async function getSourceParcels(): Promise<SourceParcel[]> {
  return delay(sourceParcels);
}

/** POST /ingest — simulated, returns a fake result after a short delay */
export async function runIngestion(datasetId: string): Promise<{
  datasetId: string;
  ingested: number;
  mapped: number;
  warnings: string[];
}> {
  const dataset = datasets.find((d) => d.id === datasetId);
  const ingested = dataset?.recordCount ?? 0;
  const mapped = Math.max(0, ingested - Math.round(ingested * 0.03));
  const warnings =
    dataset?.status === "PARTIAL"
      ? [`${ingested - mapped} record(s) skipped: missing or invalid geometry`]
      : [];
  return delay({ datasetId, ingested, mapped, warnings }, 1400);
}

export function resetUnifiedParcels() {
  unifiedParcels = JSON.parse(JSON.stringify(parcelsData));
}
