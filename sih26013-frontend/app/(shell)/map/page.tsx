import { getAllParcels, getSourceParcels } from "@/lib/api";
import { MapExperience } from "@/components/map/MapExperience";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [unified, source] = await Promise.all([getAllParcels(), getSourceParcels()]);
  return <MapExperience unifiedParcels={unified} sourceParcels={source} />;
}
