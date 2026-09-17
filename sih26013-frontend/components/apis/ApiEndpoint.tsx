import { CodeBlock } from "@/components/CodeBlock";
import { Badge } from "@/components/ui/Badge";

export interface ApiEndpointSpec {
  id: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  description: string;
  request?: string;
  response: string;
}

const METHOD_TONE: Record<string, "ledger" | "moss" | "gold"> = {
  GET: "ledger",
  POST: "moss",
  PATCH: "gold",
};

export function ApiEndpoint({ endpoint }: { endpoint: ApiEndpointSpec }) {
  return (
    <section id={endpoint.id} className="scroll-mt-24 border-b border-line py-8 first:pt-0 last:border-0">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge tone={METHOD_TONE[endpoint.method]}>{endpoint.method}</Badge>
        <code className="font-mono text-[14px] text-ink">{endpoint.path}</code>
      </div>
      <p className="mt-2.5 max-w-2xl text-[13.5px] text-ink-soft">{endpoint.description}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {endpoint.request && <CodeBlock label="Request">{endpoint.request}</CodeBlock>}
        <CodeBlock label="Response — 200 OK">{endpoint.response}</CodeBlock>
      </div>
    </section>
  );
}
