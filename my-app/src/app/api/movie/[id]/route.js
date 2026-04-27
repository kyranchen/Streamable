import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

const TMDB_BASE = "https://api.themoviedb.org/3";

// Fetches movie details + watch providers for a given country in parallel,
// then merges them into a single response so the client makes one round-trip.
export async function GET(request, { params }) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country"); // ISO 3166-1 country code, e.g. "US"

  const authHeader = {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  };

  const [detailsRes, providersRes] = await Promise.all([
    fetch(`${TMDB_BASE}/movie/${id}?append_to_response=credits&language=en-US`, {
      headers: authHeader,
      // Movie metadata rarely changes — cache for 6 hours.
      next: { revalidate: 21600 },
    }),
    fetch(`${TMDB_BASE}/movie/${id}/watch/providers`, {
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

  // Extract only the flatrate (subscription) providers for the requested country.
  const countryProviders = country ? (providers.results?.[country]?.flatrate ?? []) : [];

  return NextResponse.json({ ...details, streamingProviders: countryProviders });
}
