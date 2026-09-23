import { getDashboardMetrics } from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SourceBreakdownChart } from "@/components/dashboard/SourceBreakdownChart";
import { ConflictTypeChart } from "@/components/dashboard/ConflictTypeChart";
import { IngestionTrendChart } from "@/components/dashboard/IngestionTrendChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Database, Layers, ShieldAlert, ShieldCheck, Map, UploadCloud } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total parcels ingested" value={metrics.totalParcelsIngested} icon={Database} tone="ledger" />
        <MetricCard label="Unified parcels created" value={metrics.unifiedParcelsCreated} icon={Layers} tone="moss" />
        <MetricCard label="Conflicts detected" value={metrics.conflictsDetected} icon={ShieldAlert} tone="rust" />
        <MetricCard label="Conflicts resolved" value={metrics.conflictsResolved} icon={ShieldCheck} tone="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Parcels by source system</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceBreakdownChart data={metrics.parcelsBySource} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conflicts by type</CardTitle>
          </CardHeader>
          <CardContent>
            <ConflictTypeChart data={metrics.conflictsByType} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingestion trend — last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <IngestionTrendChart data={metrics.ingestionTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Link
              href="/map"
              className="flex items-center gap-2.5 rounded border border-line px-3.5 py-2.5 text-[13.5px] font-medium text-ink hover:bg-paper-dim"
            >
              <Map className="h-4 w-4 text-ledger-500" /> Go to the unified map
            </Link>
            <Link
              href="/conflicts"
              className="flex items-center gap-2.5 rounded border border-line px-3.5 py-2.5 text-[13.5px] font-medium text-ink hover:bg-paper-dim"
            >
              <ShieldAlert className="h-4 w-4 text-rust-500" /> Review flagged conflicts
            </Link>
            <Link
              href="/ingestion"
              className="flex items-center gap-2.5 rounded border border-line px-3.5 py-2.5 text-[13.5px] font-medium text-ink hover:bg-paper-dim"
            >
              <UploadCloud className="h-4 w-4 text-moss-500" /> Ingest new data
            </Link>
          </CardContent>
        </Card>
      </div>

      <ActivityFeed items={metrics.recentActivity} />
    </div>
  );
}
