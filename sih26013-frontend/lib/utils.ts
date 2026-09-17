export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatArea(sqm: number): string {
  return `${sqm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} m²`;
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export const CONFLICT_TYPE_LABEL: Record<string, string> = {
  OWNER_MISMATCH: "Owner mismatch",
  AREA_MISMATCH: "Area mismatch",
  GEOMETRY_OVERLAP: "Geometry overlap",
  DUPLICATE_ID: "Duplicate ID",
};

export const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "Pending review",
  REVIEWED: "Reviewed",
  RESOLVED: "Resolved",
};

export const SOURCE_LABEL: Record<string, string> = {
  REVENUE: "Revenue",
  SURVEY: "Survey",
  MUNICIPAL: "Municipal",
  REGISTRATION: "Registration",
};

export const SOURCE_COLOR: Record<string, string> = {
  REVENUE: "#2C4A63",
  SURVEY: "#A9812E",
  MUNICIPAL: "#3C6E52",
  REGISTRATION: "#6B4C9A",
};
