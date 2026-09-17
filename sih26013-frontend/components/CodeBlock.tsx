export function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded border border-line">
      {label && (
        <div className="border-b border-line bg-paper-dim px-3.5 py-1.5 font-mono text-[11px] text-ink-soft">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto bg-ledger-900 px-4 py-3.5 text-[12.5px] leading-relaxed text-ledger-50">
        <code>{children}</code>
      </pre>
    </div>
  );
}
