export async function getRegions() {
  const res = await fetch("/api/regions");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.results?.length) throw new Error("Empty response");
  return data.results;
}

export async function lookupMovie(query, country) {
  const res = await fetch(
    `/api/lookup?query=${encodeURIComponent(query)}&country=${country}`
  );
  if (res.status === 429) throw new Error("TOO_MANY_REQUESTS");
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
