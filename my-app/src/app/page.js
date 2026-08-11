"use client";
import { useState, useEffect } from "react";
import { getRegions, searchMovies, getMovie } from "@/lib/api";
import SearchBar from "./components/SearchBar";
import LoadingSkeleton from "./components/LoadingSkeleton";
import SearchResults from "./components/SearchResults";
import MovieCard from "./components/MovieCard";

export default function Home() {
  const [countryInput, setCountryInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [movie, setMovie] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    fetchRegions();
  }, []);

  async function fetchRegions(attempt = 0) {
    setRegionsLoading(true);
    try {
      const results = await getRegions();
      setRegionList(results);
      setCountryList(results.map((r) => r.english_name));
    } catch (error) {
      console.error("fetchRegions attempt", attempt, error);
      if (attempt < 3) {
        setTimeout(() => fetchRegions(attempt + 1), 500 * Math.pow(2, attempt));
      }
    } finally {
      setRegionsLoading(false);
    }
  }

  // Step 1: search — shows the results grid
  async function handleSubmit() {
    setErrMsg("");
    setMovie(null);
    setSearchResults([]);
    setIsLoading(true);

    try {
      const results = await searchMovies(titleInput.trim());
      if (results.length === 0) setErrMsg("No movies found");
      else setSearchResults(results);
    } catch (error) {
      if (error.message === "TOO_MANY_REQUESTS") setErrMsg("Too many requests — please wait a moment");
      else setErrMsg("Something went wrong, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  // Step 2: user picks a result — fetches full details + providers
  async function handleSelectMovie(id) {
    const region = regionList.find(
      (r) => r.english_name === countryInput || r.native_name === countryInput
    );
    if (!region) {
      setErrMsg("Please select a country before choosing a movie.");
      return;
    }

    setErrMsg("");
    setSearchResults([]);
    setIsLoading(true);

    try {
      const data = await getMovie(id, region.iso_3166_1);
      setMovie(data);
    } catch (error) {
      if (error.message === "TOO_MANY_REQUESTS") setErrMsg("Too many requests — please wait a moment");
      else if (error.message === "NOT_FOUND") setErrMsg("Movie not found");
      else setErrMsg("Something went wrong, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="text-center pt-16 pb-10">
        <h1 className="text-5xl font-bold text-white tracking-tight">Streamable</h1>
        <p className="text-zinc-400 mt-2 text-sm">Find where to watch any movie</p>
      </div>

      <SearchBar
        countryList={countryList}
        countryInput={countryInput}
        titleInput={titleInput}
        regionsLoading={regionsLoading}
        onCountryChange={setCountryInput}
        onTitleChange={setTitleInput}
        onSubmit={handleSubmit}
      />

      {errMsg && (
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <p className="text-red-400 text-sm">{errMsg}</p>
        </div>
      )}

      {isLoading && <LoadingSkeleton />}
      {searchResults.length > 0 && (
        <SearchResults results={searchResults} onSelect={handleSelectMovie} />
      )}
      {movie && <MovieCard movie={movie} countryName={countryInput} />}
    </div>
  );
}
