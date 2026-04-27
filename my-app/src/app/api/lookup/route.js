import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

const TMDB_BASE = "https://api.themoviedb.org/3";

// Single endpoint that replaces two sequential browser requests:
// previously the client called /api/search then /api/movie/[id] back-to-back.
// Now the server chains them internally, cutting one full round-trip.
export async function GET(request) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const country = searchParams.get("country");

  if (!query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const authHeader = {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  };

  // Step 1: search — cached so repeated queries for the same title are instant.
  const searchUrl = new URL(`${TMDB_BASE}/search/movie`);
  searchUrl.searchParams.set("query", query.trim());
  searchUrl.searchParams.set("include_adult", "false");
  searchUrl.searchParams.set("language", "en-US");
  searchUrl.searchParams.set("page", "1");

  const searchRes = await fetch(searchUrl.toString(), {
    headers: authHeader,
    next: { revalidate: 3600 },
  });

  if (!searchRes.ok) {
    return NextResponse.json({ error: "TMDb search failed" }, { status: searchRes.status });
  }

  const searchData = await searchRes.json();
  const firstResult = searchData.results?.[0];

  if (!firstResult) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  // Step 2: fetch details and providers in parallel once we have the id.
  const [detailsRes, providersRes] = await Promise.all([
    fetch(`${TMDB_BASE}/movie/${firstResult.id}?language=en-US`, {
      headers: authHeader,
      next: { revalidate: 21600 },
    }),
    fetch(`${TMDB_BASE}/movie/${firstResult.id}/watch/providers`, {
      headers: authHeader,
      next: { revalidate: 21600 },
    }),
  ]);

  if (!detailsRes.ok || !providersRes.ok) {
    return NextResponse.json({ error: "TMDb request failed" }, { status: 502 });
  }

  const [details, providers] = await Promise.all([
    detailsRes.json(),
    providersRes.json(),
  ]);

  const streamingProviders = country
    ? (providers.results?.[country]?.flatrate ?? [])
    : [];

  return NextResponse.json({ ...details, streamingProviders });
}
