import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET() {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const res = await fetch(`${TMDB_BASE}/watch/providers/regions?language=en-US`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
    // Regions list barely changes — cache for 24 hours on the server.
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "TMDb request failed" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
