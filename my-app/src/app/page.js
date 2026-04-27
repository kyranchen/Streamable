"use client";
import { useState, useEffect } from "react";

export default function Home() {
  function handleCast(arr) {
    if (arr == null || arr.length == 0) {
      return `<div class="antialiased text-lg">Not available!</div>`;
    }
    let counter = 0;
    let res = "";
    for (let i = 0; i < arr.length; i++) {
      if (counter >= 4) break;
      if (arr[i].profile_path) {
        const profile_path_url = `https://image.tmdb.org/t/p/w500${arr[i].profile_path}`;
        res += `<div class="rounded-lg p-4 flex flex-col items-center">
          <img src="${profile_path_url}" alt="Actor" class="object-scale-down h-32 w-32 rounded-full mb-2">
          <span class="text-base font-semibold">${arr[i].name}</span>
          <span class="text-gray-600">${arr[i].character}</span>
          </div>`;
      }
      counter += 1;
    }
    return res;
  }

  function handleGenre(arr) {
    let res = "";
    arr.forEach((element) => {
      res += `<span class="mr-2">${element.name}</span>`;
    });
    return res;
  }

  function handleService(arr) {
    if (arr == null || arr.length == 0) {
      return `<div class="antialiased text-lg">Not available!</div>`;
    }
    let res = "";
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].logo_path) {
        const logo_path_url = `https://image.tmdb.org/t/p/w500${arr[i].logo_path}`;
        res += `<div class="rounded-lg p-4 flex flex-col items-center">
          <img src="${logo_path_url}" alt="Service" class="object-scale-down h-16 w-16 rounded-full mb-2"></img>
          <span class="text-base font-semibold text-center">${arr[i].provider_name}</span>
          </div>`;
      }
    }
    return res;
  }

  async function handleSubmit() {
    const err_msg = document.getElementById("err_msg");
    const loading = document.getElementById("loading");
    const result = document.getElementById("result");
    result.innerHTML = `<div class="bg-gradient-to-r from-neutral-300 to-stone-400"></div>`;
    err_msg.innerHTML = `<div class="bg-gradient-to-r from-neutral-300 to-stone-400"></div>`;

    loading.innerHTML = `
      <div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto">
        <div class="animate-pulse flex space-x-4">
          <div class="rounded-full bg-slate-700 h-10 w-10"></div>
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-slate-700 rounded"></div>
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-slate-700 rounded col-span-2"></div>
                <div class="h-2 bg-slate-700 rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
     `;

    const countryName = document.getElementById("country").value;
    const titleValue = document.getElementById("title").value;

    // Resolve country name -> ISO code from the already-loaded region list.
    const region = regionList.find(
      (r) => r.english_name === countryName || r.native_name === countryName
    );
    if (!region) {
      loading.innerHTML = "";
      err_msg.innerHTML = `<div class="text-3xl">Country not found or not supported</div>`;
      return;
    }
    const country_code = region.iso_3166_1;

    // Search for the movie title via our proxy.
    let first_result;
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(titleValue)}`);
      if (res.status === 429) {
        loading.innerHTML = "";
        err_msg.innerHTML = `<div class="text-3xl">Too many requests — please wait a moment</div>`;
        return;
      }
      const data = await res.json();
      first_result = data.results?.[0];
    } catch (error) {
      console.error(error);
    }

    if (!first_result) {
      loading.innerHTML = "";
      err_msg.innerHTML = `<div class="text-3xl mt-4">Movie not found</div>`;
      return;
    }

    // Fetch movie details + streaming providers in a single proxy call.
    try {
      const res = await fetch(`/api/movie/${first_result.id}?country=${country_code}`);
      if (res.status === 429) {
        loading.innerHTML = "";
        err_msg.innerHTML = `<div class="text-3xl">Too many requests — please wait a moment</div>`;
        return;
      }
      const movie = await res.json();

      const genre = movie.genres ? handleGenre(movie.genres) : "";
      const service = handleService(movie.streamingProviders);

      loading.innerHTML = "";
      result.innerHTML = `
        <div class="p-4 flex flex-col gap-5 md:flex-row bg-gradient-to-r from-slate-300 to-slate-500 rounded-lg">
          <div class="md:w-2/3 md:pl-8">
            <h1 class="text-3xl font-semibold mb-2">${movie.title}</h1>
            <div class="flex items-center text-sm mb-2">
              <span class="mr-2">${movie.runtime} mins</span>
              <span class="mr-2">${movie.release_date}</span>
            </div>
            <p class="text-base mb-4">${movie.overview}</p>
            <div class="flex items-center mb-4">
              <span class="text-gray-600 mr-2">Rating:</span>
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  class="h-5 w-5 text-yellow-500 mr-1">
                  <path d="M10 1l2.56 5.828L18 7l-4.182 4.118L15.1 18 10 14.728 4.9 18l1.282-6.882L2 7l5.44-.172L10 1z" />
                </svg>
                <span>${movie.vote_average}/10</span>
              </div>
            </div>
            <div class="flex items-center mb-6">
              <span class="text-gray-600 mr-2">Genres:</span>
              <span>${genre}</span>
            </div>
            <h2 class="text-xl font-semibold mb-4">Streaming Services in ${countryName}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 auto-rows-max gap-4 mb-4">
              ${service}
            </div>
          </div>
          <div class="md:w-1/3 content-center">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="Movie Poster" class="rounded-lg">
          </div>
        </div>
      `;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchRegions() {
    try {
      const res = await fetch("/api/regions");
      const data = await res.json();

      // Store full region objects so we can resolve name -> ISO code client-side
      // without an extra round-trip.
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
    <div className="bg-gradient-to-r from-neutral-300 to-stone-400 min-h-screen">
      <div id="main" className="flex flex-col justify-center items-center">
        <div className="p-10 text-6xl text-stone-700">Streamable</div>
        <div className="flex gap-1">
          <select
            id="country"
            className="border rounded border-black p-2"
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
            className="border rounded border-black p-2"
            placeholder="Enter title here..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <button className="rounded p-2 bg-cyan-400 hover:bg-sky-400" onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <div id="err_msg" className="p-4"></div>
        <div id="loading" className="w-screen"></div>
        <div id="result" className="container mx-auto px-4 py-8 mb-16"></div>
      </div>
    </div>
  );
}
