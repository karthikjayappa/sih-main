import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import { Activity } from "lucide-react";

export function ActivityFeed({ items }: { items: { timestamp: string; message: string }[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Activity className="h-4 w-4 text-ledger-500" />
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-line">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ledger-500" />
              <div className="min-w-0">
                <p className="text-[13.5px] text-ink">{item.message}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
