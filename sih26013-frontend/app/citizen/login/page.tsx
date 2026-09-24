"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CitizenLoginPage() {
  const router = useRouter();

  const [bhuDhaarId, setBhuDhaarId] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bhuDhaarId.trim()) {
      setError("Please enter your BhuDhaar ID.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/citizen/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bhudhaarId: bhuDhaarId.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to verify BhuDhaar ID.");
      }

      console.log("Citizen login successful:", result.data);

      sessionStorage.setItem("bhudhaarId", bhuDhaarId.trim());

      router.push("/citizen/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify BhuDhaar ID."
      );
    }
  }

  return (
    <main className="min-h-screen bg-paper-dim px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-line bg-white p-8 shadow-sm">
          <p className="font-mono text-xs tracking-wide text-ledger-700">
            PROPERTY OWNER PORTAL
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
            Find Your Property
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Enter your BhuDhaar ID to access your property record and view
            the latest unified land information.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink">
                BhuDhaar ID
              </label>

              <input
                type="text"
                value={bhuDhaarId}
                onChange={(event) => setBhuDhaarId(event.target.value)}
                placeholder="Enter your BhuDhaar ID"
                className="w-full rounded border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ledger-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-ledger-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ledger-700"
            >
              Verify & Continue
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-ink-soft">
            Your property information will be displayed based on the
            unified land records available in the portal.
          </p>
        </div>
      </div>
    </main>
  );
}