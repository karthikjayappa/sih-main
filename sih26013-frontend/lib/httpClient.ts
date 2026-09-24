const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1").replace(/\/$/, "");

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${response.status}: ${message || response.statusText}`);
  }

  const json = (await response.json()) as { data?: T } | T;
  return (typeof json === "object" && json !== null && "data" in json
    ? json.data
    : json) as T;
}