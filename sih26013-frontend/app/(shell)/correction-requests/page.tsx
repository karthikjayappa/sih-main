"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiFetch } from "@/lib/httpClient";

type CorrectionRequest = {
  id: number;
  unified_parcel_id: string;
  citizen_id: string;
  issue_type: string;
  description: string;
  proposed_value: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
};

export default function CorrectionRequestsPage() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);

      const data = await apiFetch<CorrectionRequest[]>(
        "/correction-requests"
      );

      setRequests(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load correction requests"
      );
    } finally {
      setLoading(false);
    }
  }

  async function reviewRequest(
    id: number,
    status: "APPROVED" | "REJECTED"
  ) {
    const reviewNotes =
      status === "APPROVED"
        ? "The correction was verified and approved."
        : "The submitted correction could not be verified.";

    try {
      await apiFetch(`/correction-requests/${id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewedBy: "revenue_admin",
          reviewNotes,
        }),
      });

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to review correction request"
      );
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Correction Requests
        </h1>

        <p className="mt-1 text-sm text-ink-soft">
          Review and process property correction requests submitted by citizens.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Requests ({requests.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading && (
            <p className="text-sm text-ink-soft">
              Loading correction requests...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && requests.length === 0 && (
            <p className="text-sm text-ink-soft">
              No correction requests available yet.
            </p>
          )}

          {!loading && !error && requests.length > 0 && (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">
                        Request #{request.id}
                      </p>

                      <p className="mt-1 text-sm text-ink-soft">
                        Citizen: {request.citizen_id}
                      </p>

                      <p className="text-sm text-ink-soft">
                        Issue: {request.issue_type}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-ink">
                      Description
                    </p>

                    <p className="mt-1 text-sm text-ink-soft">
                      {request.description}
                    </p>
                  </div>

                  {request.proposed_value && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-ink">
                        Proposed value
                      </p>

                      <p className="mt-1 text-sm text-ink-soft">
                        {request.proposed_value}
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-xs text-ink-soft">
                      Parcel: {request.unified_parcel_id}
                    </p>

                    <p className="text-xs text-ink-soft">
                      Submitted:{" "}
                      {new Date(request.submitted_at).toLocaleString()}
                    </p>

                    {request.status === "PENDING" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => reviewRequest(request.id, "APPROVED")}
                          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => reviewRequest(request.id, "REJECTED")}
                          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
