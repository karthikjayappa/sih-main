"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <h2 className="font-serif text-xl font-semibold text-ink">Backend connection unavailable</h2>
      <p className="mt-2 text-[13px] text-ink-soft">Start the Express API on port 3000, then try this view again.</p>
      <Button className="mt-5" onClick={() => reset()}>Try again</Button>
    </div>
  );
}