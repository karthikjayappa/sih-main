import { getAllParcels, getSourceParcels } from "@/lib/mockApi";
import { MapExperience } from "@/components/map/MapExperience";

export default async function MapPage() {
  const [unified, source] = await Promise.all([getAllParcels(), getSourceParcels()]);
  return <MapExperience unifiedParcels={unified} sourceParcels={source} />;
}
