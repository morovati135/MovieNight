import { apiFetch } from "./client";

type HealthResponse = {
  status: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiFetch("/api/health");

  if (!response.ok) {
    throw new Error("MovieNight API health check failed.");
  }

  const health = (await response.json()) as HealthResponse;

  if (health.status !== "ok") {
    throw new Error("MovieNight API returned an unexpected health response.");
  }

  return health;
}
