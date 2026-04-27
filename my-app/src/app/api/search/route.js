import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("query", query.trim());
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
    // Search results can change as new movies are added — cache for 1 hour.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "TMDb request failed" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
