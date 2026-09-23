import { getDatasets } from "@/lib/api";
import { IngestionExperience } from "@/components/ingestion/IngestionExperience";

export const dynamic = "force-dynamic";

export default async function IngestionPage() {
  const datasets = await getDatasets();
  return <IngestionExperience datasets={datasets} />;
}
