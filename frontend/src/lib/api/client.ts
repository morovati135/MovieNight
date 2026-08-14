const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiBaseUrl(): string {
  if (!apiBaseUrl) {
    throw new Error("MovieNight API base URL is not configured.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function apiFetch(path: string): Promise<Response> {
  return fetch(`${getApiBaseUrl()}${path}`);
}
