import { getDatasets } from "@/lib/mockApi";
import { IngestionExperience } from "@/components/ingestion/IngestionExperience";

export default async function IngestionPage() {
  const datasets = await getDatasets();
  return <IngestionExperience datasets={datasets} />;
}
