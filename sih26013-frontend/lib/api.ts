import { apiFetch } from "./httpClient";
import type {
  AuditEntry,
  ConflictStatus,
  ConflictType,
  DashboardMetrics,
  Dataset,
  MappingProfile,
  ParcelGeometry,
  SourceParcel,
  SourceSystem,
  UnifiedParcel,
} from "./types";

export interface ParcelSearchParams {
  q?: string;
  parcelId?: string;
  ownerName?: string;
  village?: string;
  tehsil?: string;
  district?: string;
}

export interface ConflictFilterParams {
  status?: ConflictStatus | "ALL";
  conflictType?: ConflictType | "ALL";
  village?: string;
  tehsil?: string;
}

export function checkHealth() {
  return apiFetch<{ status: string }>("/health");
}

function listPayload<T>(payload: T[] | { features?: T[]; items?: T[]; results?: T[] }): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload.features) return payload.features;
  return payload.items || payload.results || [];
}

function geometryFrom(value: unknown): ParcelGeometry {
  if (value && typeof value === "object" && "type" in value && "coordinates" in value) {
    const geometry = value as ParcelGeometry;
    if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") return geometry;
  }
  if (Array.isArray(value) && Array.isArray(value[0])) {
    return { type: "Polygon", coordinates: [value as number[][]] };
  }
  return { type: "Polygon", coordinates: [] };
}

function sourceParcelFrom(raw: Record<string, any>): SourceParcel {
  const properties = raw.properties || {};
  return {
    sourceParcelId: String(raw.sourceParcelId ?? raw.source_parcel_id ?? properties.sourceParcelId ?? raw.parcelId ?? properties.parcelId ?? ""),
    sourceSystem: (raw.sourceSystem ?? raw.source_system ?? properties.sourceSystem ?? "REVENUE") as SourceSystem,
    ownerName: String(raw.ownerName ?? raw.owner_name ?? properties.ownerName ?? properties.owner_name ?? "Unknown owner"),
    areaSqm: Number(raw.areaSqm ?? raw.area_sqm ?? properties.areaSqm ?? properties.area_sqm ?? 0),
    village: String(raw.village ?? properties.village ?? ""),
    tehsil: String(raw.tehsil ?? properties.tehsil ?? ""),
    district: String(raw.district ?? properties.district ?? ""),
    geometry: geometryFrom(raw.geometry ?? raw.geom ?? properties.geometry),
    rawAttributes: (raw.rawAttributes ?? raw.raw_attributes ?? {}) as Record<string, string | number>,
    ingestedAt: String(raw.ingestedAt ?? raw.ingested_at ?? new Date().toISOString()),
  };
}

function parcelFrom(raw: Record<string, any>): UnifiedParcel {
  const properties = raw.properties || {};
  const sourceRecords = Array.isArray(raw.sourceRecords)
    ? raw.sourceRecords.map((item: Record<string, any>) => sourceParcelFrom(item))
    : [];
  return {
    unifiedParcelId: String(raw.unifiedParcelId ?? raw.unified_parcel_id ?? properties.unifiedParcelId ?? raw.parcelId ?? ""),
    parcelId: String(raw.parcelId ?? raw.parcel_id ?? properties.parcelId ?? raw.unifiedParcelId ?? ""),
    ownerName: String(raw.ownerName ?? raw.owner_name ?? properties.ownerName ?? "Unknown owner"),
    areaSqm: Number(raw.areaSqm ?? raw.area_sqm ?? properties.areaSqm ?? 0),
    village: String(raw.village ?? properties.village ?? ""),
    tehsil: String(raw.tehsil ?? properties.tehsil ?? ""),
    district: String(raw.district ?? properties.district ?? ""),
    state: String(raw.state ?? properties.state ?? "Karnataka"),
    geometry: geometryFrom(raw.geometry ?? raw.geom ?? properties.geometry),
    sources: (raw.sources ?? raw.sourceSystems ?? []).map((source: string) => source as SourceSystem),
    sourceParcelIds: (raw.sourceParcelIds ?? raw.source_parcel_ids ?? []).map(String),
    conflictFlag: Boolean(raw.conflictFlag ?? raw.conflict_flag ?? raw.status === "PENDING_REVIEW"),
    conflictTypes: (raw.conflictTypes ?? raw.conflict_types ?? []) as ConflictType[],
    status: (raw.status ?? "RESOLVED") as ConflictStatus,
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()),
    auditLog: (raw.auditLog ?? raw.audit_log ?? []) as AuditEntry[],
    sourceRecords,
  };
}

export async function searchParcels(params: ParcelSearchParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
  const payload = await apiFetch<unknown>(`/parcels/search?${query.toString()}`);
  return listPayload(payload as any).map((item) => parcelFrom(item as Record<string, any>));
}

export async function getParcelById(id: string) {
  const payload = await apiFetch<Record<string, any>>(`/parcels/${encodeURIComponent(id)}`);
  return parcelFrom(payload);
}

export async function getConflicts(filters: ConflictFilterParams = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => value && value !== "ALL" && query.set(key, value));
  const payload = await apiFetch<unknown>(`/conflicts?${query.toString()}`);
  return listPayload(payload as any).map((item) => parcelFrom(item as Record<string, any>));
}

export async function updateConflictStatus(unifiedParcelId: string, payload: { status: ConflictStatus; notes?: string; resolvedBy?: string }) {
  const response = await apiFetch<Record<string, any>>(`/conflicts/${encodeURIComponent(unifiedParcelId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parcelFrom(response);
}

export async function getParcelAudit(id: string) {
  return apiFetch<AuditEntry[]>(`/parcels/${encodeURIComponent(id)}/audit`);
}

export async function getAllParcels() {
  return searchParcels();
}

export async function getSourceParcels() {
  const parcels = await getAllParcels();
  return parcels.flatMap((parcel) => parcel.sourceRecords);
}

export async function getDashboardMetrics() {
  return apiFetch<DashboardMetrics>("/dashboard/stats");
}

export async function getDatasets(): Promise<Dataset[]> {
  const payload = await apiFetch<any[]>("/mapping-profiles");
  return payload.map((profile) => ({
    id: String(profile.id ?? profile.datasetId ?? profile.mappingProfileId),
    name: String(profile.name ?? profile.id ?? profile.datasetId),
    sourceSystem: (profile.sourceSystem ?? profile.source_system ?? "REVENUE") as SourceSystem,
    format: (profile.format ?? "GEOJSON") as Dataset["format"],
    recordCount: Number(profile.recordCount ?? 0),
    lastIngestedAt: profile.lastIngestedAt ?? null,
    status: (profile.status ?? "NOT_RUN") as Dataset["status"],
    sampleFields: (profile.sampleFields ?? []) as string[],
  }));
}

export async function getMappingProfile(mappingProfileId: string) {
  return apiFetch<MappingProfile>(`/mapping-profiles/${encodeURIComponent(mappingProfileId)}`);
}

export async function ingestFile(file: File, sourceSystem: SourceSystem, mappingProfileId: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("sourceSystem", sourceSystem);
  form.append("mappingProfileId", mappingProfileId);
  return apiFetch<{ ingested: number; mapped: number; warnings: string[] }>("/ingest", {
    method: "POST",
    body: form,
  });
}