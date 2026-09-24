"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function DepartmentLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username === "revenue_admin" && password === "admin123") {
      router.push("/dashboard");
      return;
    }

    setError("Invalid username or password.");
  }

  return (
    <main className="min-h-screen bg-paper-dim px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-line bg-white p-8 shadow-sm">
          <p className="font-mono text-xs tracking-wide text-ledger-700">
            DEPARTMENT PORTAL
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
            Department Login
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Sign in using your authorized department credentials.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter department username"
                className="w-full rounded border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ledger-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ledger-500"
              />
            </div>

            {error && (
              <p className="rounded border border-rust-200 bg-rust-50 px-3 py-2 text-sm text-rust-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-ledger-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ledger-700"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}