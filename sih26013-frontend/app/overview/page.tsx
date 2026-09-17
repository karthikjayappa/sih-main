import { OverviewHero } from "@/components/OverviewHero";
import { HowItWorks } from "@/components/HowItWorks";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";

export default function OverviewPage() {
  return (
    <>
      <OverviewHero />
      <HowItWorks />
      <ArchitectureDiagram />
    </>
  );
}
