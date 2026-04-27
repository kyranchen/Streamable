"use client";
import { useState, useEffect } from "react";

export default function Home() {
  function handleGenre(arr) {
    return arr
      .map(
        (g) =>
          `<span class="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-full text-xs font-medium">${g.name}</span>`
      )
      .join("");
  }

  function handleService(arr) {
    if (!arr || arr.length === 0) {
      return `<p class="text-zinc-500 text-sm">Not available in this region</p>`;
    }
    return arr
      .filter((s) => s.logo_path)
      .map(
        (s) => `
        <div class="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-lg px-3 py-2">
          <img src="https://image.tmdb.org/t/p/w92${s.logo_path}" alt="${s.provider_name}" class="w-8 h-8 rounded-md flex-shrink-0">
          <span class="text-sm text-white font-medium leading-tight">${s.provider_name}</span>
        </div>`
      )
      .join("");
  }

  async function handleSubmit() {
    const err_msg = document.getElementById("err_msg");
    const loading = document.getElementById("loading");
    const result = document.getElementById("result");

    result.innerHTML = "";
    err_msg.innerHTML = "";

    loading.innerHTML = `
      <div class="max-w-3xl mx-auto px-4">
        <div class="bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-pulse">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-56 h-64 md:h-auto bg-zinc-700 flex-shrink-0"></div>
            <div class="flex-1 p-6 space-y-4">
              <div class="h-7 bg-zinc-700 rounded-lg w-2/3"></div>
              <div class="h-4 bg-zinc-700 rounded w-1/3"></div>
              <div class="flex gap-2">
                <div class="h-6 bg-zinc-700 rounded-full w-16"></div>
                <div class="h-6 bg-zinc-700 rounded-full w-20"></div>
                <div class="h-6 bg-zinc-700 rounded-full w-14"></div>
              </div>
              <div class="space-y-2 pt-2">
                <div class="h-3 bg-zinc-700 rounded w-full"></div>
                <div class="h-3 bg-zinc-700 rounded w-full"></div>
                <div class="h-3 bg-zinc-700 rounded w-4/5"></div>
              </div>
              <div class="h-4 bg-zinc-700 rounded w-1/4 pt-2"></div>
              <div class="flex gap-2">
                <div class="h-10 bg-zinc-700 rounded-lg w-28"></div>
                <div class="h-10 bg-zinc-700 rounded-lg w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const countryName = document.getElementById("country").value;
    const titleValue = document.getElementById("title").value;

    const region = regionList.find(
      (r) => r.english_name === countryName || r.native_name === countryName
    );
    if (!region) {
      loading.innerHTML = "";
      err_msg.innerHTML = `<p class="text-red-400 text-sm">Country not found or not supported</p>`;
      return;
    }
    const country_code = region.iso_3166_1;

    let movie;
    try {
      const res = await fetch(
        `/api/lookup?query=${encodeURIComponent(titleValue)}&country=${country_code}`
      );
      if (res.status === 429) {
        loading.innerHTML = "";
        err_msg.innerHTML = `<p class="text-red-400 text-sm">Too many requests — please wait a moment</p>`;
        return;
      }
      if (res.status === 404) {
        loading.innerHTML = "";
        err_msg.innerHTML = `<p class="text-red-400 text-sm">Movie not found</p>`;
        return;
      }
      movie = await res.json();
    } catch (error) {
      console.error(error);
    }

    try {

      const genre = movie.genres ? handleGenre(movie.genres) : "";
      const service = handleService(movie.streamingProviders);
      const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

      loading.innerHTML = "";
      result.innerHTML = `
        <div class="max-w-3xl mx-auto px-4">
          <div class="bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div class="flex flex-col md:flex-row">
              <!-- Poster -->
              <div class="md:w-56 flex-shrink-0">
                <img
                  src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                  alt="${movie.title} poster"
                  class="w-full h-full object-cover"
                >
              </div>
              <!-- Details -->
              <div class="flex-1 p-6">
                <h1 class="text-2xl font-bold text-white mb-1">${movie.title}</h1>
                <div class="flex items-center gap-2 text-zinc-400 text-sm mb-3">
                  <span>${year}</span>
                  <span>·</span>
                  <span>${movie.runtime} min</span>
                  <span>·</span>
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-yellow-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    ${rating}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">${genre}</div>
                <p class="text-zinc-300 text-sm leading-relaxed mb-5 line-clamp-4">${movie.overview}</p>
                <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Available on in ${countryName}</p>
                <div class="flex flex-wrap gap-2">${service}</div>
              </div>
            </div>
          </div>
        </div>`;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchRegions() {
    try {
      const res = await fetch("/api/regions");
      const data = await res.json();
      setRegionList(data.results ?? []);
      setCountryListInput((data.results ?? []).map((r) => r.english_name));
    } catch (error) {
      console.log(error);
    }
  }

  const [countryInput, setCountryInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [countryList, setCountryListInput] = useState([]);
  const [regionList, setRegionList] = useState([]);

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
          id="country"
          className="bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          value={countryInput}
          onChange={(e) => setCountryInput(e.target.value)}
        >
          <option value="">Select a country</option>
          {countryList.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
        <input
          type="text"
          id="title"
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
      <div id="err_msg" className="text-center px-4 mb-2"></div>

      {/* Loading / Result */}
      <div id="loading" className="pb-8"></div>
      <div id="result" className="pb-16"></div>
    </div>
  );
}
