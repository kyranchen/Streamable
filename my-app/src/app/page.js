"use client";
import { useState, useEffect } from "react";
import LoadingSkeleton from "./components/LoadingSkeleton";
import MovieCard from "./components/MovieCard";

export default function Home() {
  async function handleSubmit() {
    setIsLoading(true);
    setErrMsg("");

    const countryName = countryInput;
    const titleValue = titleInput.trim();

    const region = regionList.find(
      (r) => r.english_name === countryName || r.native_name === countryName
    );
    if (!region) {
      setIsLoading(false);
      setErrMsg("Please select a valid country from the list.");
      return;
    }
    const country_code = region.iso_3166_1;

    let movie;
    try {
      const res = await fetch(
        `/api/lookup?query=${encodeURIComponent(titleValue)}&country=${country_code}`
      );
      if (res.status === 429) {
        setIsLoading(false);
        setErrMsg("Too many requests — please wait a moment");
        return;
      }
      if (res.status === 404) {
        setIsLoading(false);
        setErrMsg("Movie not found");
        return;
      }
      movie = await res.json();
      setIsLoading(false);
      setMovie(movie);
    } catch (error) {
      setIsLoading(false);
      setErrMsg("An error occurred while fetching movie data.");
      console.error(error);
    }
  }

  async function fetchRegions(attempt = 0) {
    setRegionsLoading(true);
    try {
      const res = await fetch("/api/regions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.results?.length) throw new Error("Empty response");
      setRegionList(data.results);
      setCountryListInput(data.results.map((r) => r.english_name));
    } catch (error) {
      console.error("fetchRegions attempt", attempt, error);
      // Retry up to 3 times with increasing delay (500ms, 1s, 2s).
      if (attempt < 3) {
        setTimeout(() => fetchRegions(attempt + 1), 500 * Math.pow(2, attempt));
      }
    } finally {
      setRegionsLoading(false);
    }
  }

  const [countryInput, setCountryInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [countryList, setCountryListInput] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    fetchRegions();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="text-center pt-16 pb-10">
        <h1 className="text-5xl font-bold text-white tracking-tight">Streamable</h1>
        <p className="text-zinc-400 mt-2 text-sm">Find where to watch any movie</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto w-full px-4 mb-6">
        <select
          className="bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
          value={countryInput}
          onChange={(e) => setCountryInput(e.target.value)}
          disabled={regionsLoading}
        >
          <option value="">{regionsLoading ? "Loading countries..." : "Select a country"}</option>
          {countryList.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="flex-1 bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Search for a movie..."
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          onClick={handleSubmit}
        >
          Search
        </button>
      </div>

      {/* Error */}
      {errMsg && (
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <p className="text-red-400 text-sm">{errMsg}</p>
        </div>
      )}

      {/* Loading / Result */}
      { isLoading && <LoadingSkeleton /> }
      { movie && <MovieCard movie={movie} countryName={countryInput} /> }
    </div>
  );
}
