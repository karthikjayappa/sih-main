"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CitizenParcelMap = dynamic(
  () => import("./CitizenParcelMap"),
  {
    ssr: false,
  }
);

type CitizenProperty = {
  bhudhaar_id: string;
  unified_parcel_id: string;
  owner_name: string;
  area_sqm: string;
  land_use: string;
  geometry: string;
  village: string;
  tehsil: string;
  district: string;
  state: string | null;
  conflict_flag: boolean;
  conflict_types: string[];
  status: string;
};

export default function CitizenDashboardPage() {
  const [property, setProperty] = useState<CitizenProperty | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [issueType, setIssueType] = useState("OWNER_NAME");
  const [description, setDescription] = useState("");
  const [proposedValue, setProposedValue] = useState("");

  useEffect(() => {
    async function loadProperty() {
      try {
        const bhudhaarId = sessionStorage.getItem("bhudhaarId");

        if (!bhudhaarId) {
          setError("BhuDhaar ID not found. Please login again.");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/citizen/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bhudhaarId,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load property.");
        }

        setProperty(result.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load property."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-paper-dim px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-ink-soft">
            Loading your property record...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-paper-dim px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper-dim px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-lg border border-line bg-white p-8 shadow-sm">
          <p className="font-mono text-xs tracking-wide text-ledger-700">
            PROPERTY OWNER PORTAL
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
            Property Dashboard
          </h1>

          {property && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Owner Name
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.owner_name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  BhuDhaar ID
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.bhudhaar_id}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Property ID
                </p>
                <p className="mt-1 text-sm font-mono text-ink">
                  {property.unified_parcel_id}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Area
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.area_sqm} m²
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Land Use
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.land_use}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Village
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.village}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Taluk
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.tehsil}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  District
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.district}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Record Status
                </p>
                <p className="mt-1 text-lg font-medium text-ink">
                  {property.status}
                </p>
              </div>
            </div>
          )}

          {property && property.geometry && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wide text-ink-soft">
                Property Location
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
                Your Land Parcel
              </h2>

              <p className="mt-2 text-sm text-ink-soft">
                The highlighted boundary shows the location of your unified
                land parcel.
              </p>

              <div className="mt-6">
                <CitizenParcelMap
                  geometry={property.geometry}
                  ownerName={property.owner_name}
                  area={property.area_sqm}
                  village={property.village}
                />
              </div>

              <div
                className={`mt-4 rounded-lg border p-4 ${
                  property.conflict_flag
                    ? "border-amber-200 bg-amber-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    property.conflict_flag
                      ? "text-amber-800"
                      : "text-green-800"
                  }`}
                >
                  {property.conflict_flag
                    ? "⚠ Parcel requires review"
                    : "✓ Parcel location verified"}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    property.conflict_flag
                      ? "text-amber-700"
                      : "text-green-700"
                  }`}
                >
                  {property.conflict_flag
                    ? "Differences were detected in the land records. Please review the discrepancies below."
                    : "The map shows the unified parcel boundary recorded in the land records."}
                </p>
              </div>
            </div>
          )}

          {property && property.conflict_flag && (
            <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-6">
              <p className="font-mono text-xs tracking-wide text-amber-700">
                RECORD REVIEW
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
                Discrepancies Detected
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Differences were detected between the source land records.
                You can report an issue to the concerned department for
                review.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {property.conflict_types.map((conflict) => (
                  <span
                    key={conflict}
                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800"
                  >
                    {conflict.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property && (
            <div className="mt-8">
              <button
                type="button"
                className="rounded bg-ledger-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ledger-700"
                onClick={() => setShowCorrectionForm(true)}
              >
                Report an Issue
              </button>
            </div>
          )}

          {showCorrectionForm && property && (
            <div className="mt-6 rounded-lg border border-line bg-white p-6">
              <h2 className="font-serif text-2xl font-semibold text-ink">
                Report a Property Issue
              </h2>

              <p className="mt-2 text-sm text-ink-soft">
                Submit the discrepancy to the concerned department for review.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Issue Type
                  </label>

                  <select
                    value={issueType}
                    onChange={(event) => setIssueType(event.target.value)}
                    className="w-full rounded border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ledger-500"
                  >
                    <option value="OWNER_NAME">Owner Name</option>
                    <option value="AREA">Area</option>
                    <option value="LAND_USE">Land Use</option>
                    <option value="GEOMETRY">Property Boundary</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the issue with your property record"
                    rows={4}
                    className="w-full rounded border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ledger-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Proposed Correct Value
                  </label>

                  <input
                    type="text"
                    value={proposedValue}
                    onChange={(event) => setProposedValue(event.target.value)}
                    placeholder="Enter the correct value"
                    className="w-full rounded border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ledger-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionForm(false)}
                    className="rounded border border-line px-5 py-3 text-sm font-medium text-ink"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!description.trim()) {
                        setError("Please describe the issue.");
                        return;
                      }

                      if (!proposedValue.trim()) {
                        setError("Please enter the proposed correct value.");
                        return;
                      }

                      try {
                        setError("");

                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/correction-requests`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              unifiedParcelId: property.unified_parcel_id,
                              citizenId: property.bhudhaar_id,
                              issueType,
                              description: description.trim(),
                              proposedValue: proposedValue.trim(),
                            }),
                          }
                        );

                        const result = await response.json();

                        if (!response.ok) {
                          throw new Error(
                            result.error ||
                              "Unable to submit correction request."
                          );
                        }

                        alert(
                          `Correction request #${result.data.id} submitted successfully.`
                        );

                        setDescription("");
                        setProposedValue("");
                        setShowCorrectionForm(false);
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "Unable to submit correction request."
                        );
                      }
                    }}
                    className="rounded bg-ledger-500 px-5 py-3 text-sm font-medium text-white hover:bg-ledger-700"
                  >
                    Submit Issue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
