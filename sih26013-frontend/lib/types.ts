export type SourceSystem = "REVENUE" | "SURVEY" | "MUNICIPAL" | "REGISTRATION";

export type ConflictType =
  | "OWNER_MISMATCH"
  | "AREA_MISMATCH"
  | "GEOMETRY_OVERLAP"
  | "DUPLICATE_ID";

export type ConflictStatus = "PENDING_REVIEW" | "REVIEWED" | "RESOLVED";

export interface LatLng {
  lat: number;
  lng: number;
}

export type ParcelGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export interface SourceParcel {
  sourceParcelId: string;
  sourceSystem: SourceSystem;
  ownerName: string;
  areaSqm: number;
  village: string;
  tehsil: string;
  district: string;
  geometry: ParcelGeometry;
  rawAttributes: Record<string, string | number>;
  ingestedAt: string;
}

export interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface UnifiedParcel {
  unifiedParcelId: string;
  parcelId: string;
  ownerName: string;
  areaSqm: number;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  geometry: ParcelGeometry;
  sources: SourceSystem[];
  sourceParcelIds: string[];
  conflictFlag: boolean;
  conflictTypes: ConflictType[];
  status: ConflictStatus;
  createdAt: string;
  updatedAt: string;
  auditLog: AuditEntry[];
  sourceRecords: SourceParcel[];
}

export interface Dataset {
  id: string;
  name: string;
  sourceSystem: SourceSystem;
  format: "CSV" | "SHAPEFILE" | "GEOJSON" | "XLSX";
  recordCount: number;
  lastIngestedAt: string | null;
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "NOT_RUN";
  sampleFields: string[];
}

export interface MappingRule {
  sourceField: string;
  targetField: string;
  transform: string;
}

export interface MappingProfile {
  datasetId: string;
  rules: MappingRule[];
}

export interface DashboardMetrics {
  totalParcelsIngested: number;
  unifiedParcelsCreated: number;
  conflictsDetected: number;
  conflictsResolved: number;
  parcelsBySource: { source: SourceSystem; count: number }[];
  conflictsByType: { type: ConflictType; count: number }[];
  ingestionTrend: { date: string; records: number }[];
  recentActivity: { timestamp: string; message: string }[];
}
