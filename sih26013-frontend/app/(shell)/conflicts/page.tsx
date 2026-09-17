import { getAllParcels } from "@/lib/mockApi";
import { ConflictsExperience } from "@/components/conflicts/ConflictsExperience";

export default async function ConflictsPage() {
  const parcels = await getAllParcels();
  const villages = Array.from(new Set(parcels.map((p) => p.village))).sort();
  const tehsils = Array.from(new Set(parcels.map((p) => p.tehsil))).sort();

  return <ConflictsExperience allVillages={villages} allTehsils={tehsils} />;
}
