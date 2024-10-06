"use client";
import { useState, useEffect } from "react";
import { authorization } from "@/app/key";

export default function Home() {
  //Takes an array with all the cast members and format the data into html code
  function handleCast(arr) {
    if (arr == null || arr.length == 0) {
      return `<div class="antialiased text-lg">Not available!</div>`;
    }
    let counter = 0;
    let res = "";
    for (let i = 0; i < arr.length; i++) {
      //Only return the top 4 cast members
      if (counter >= 4) {
        break;
      }
      if (arr[i].profile_path) {
        const actor_profile = arr[i].profile_path;
        const profile_path_url = `https://image.tmdb.org/t/p/w500${ actor_profile }`;
        res += `<div class="rounded-lg p-4 flex flex-col items-center">
          <img src="${ profile_path_url }" alt="Actor" class="object-scale-down h-32 w-32 rounded-full mb-2">`;
        res += `
        <span class="text-base font-semibold">${ arr[i].name }</span>
        <span class="text-gray-600">${ arr[i].character }</span>
        </div>`;
      }
      
      counter += 1;
    }
    return res;
  }
  function handleGenre(arr) {
    let res = "";
    arr.forEach((element) => {
      res += `<span class="mr-2">${ element.name }</span>`;
    })
    return res;
  }
  function handleService(arr) {
    if (arr == null || arr.length == 0) {
      return `<div class="antialiased text-lg">Not available!</div>`;
    }
    let res = "";
    for (let i = 0; i < arr.length; i++) {
      const logo_profile = arr[i].logo_path;
      if (logo_profile) {
        const logo_path_url = `https://image.tmdb.org/t/p/w500${ logo_profile }`;
        res += `<div class="rounded-lg p-4 flex flex-col items-center">
          <img src="${ logo_path_url }" alt="Actor" class="object-scale-down h-16 w-16 rounded-full mb-2"></img>`;
        res += `
          <span class="text-base font-semibold text-center">${ arr[i].provider_name }</span>
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
    //Play loading animation
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
    
    const country = document.getElementById("country");
    let returned = false;
    const name = country.value;
    let country_code = "";

    //auth is the API key imported. You can get your own API key from tmdb API
    const auth = 'Bearer ' + authorization;

    //Check if country is supported(Consider switching to tmdb)
    const country_url = 'https://api.themoviedb.org/3/watch/providers/regions?language=en-US';
    const country_options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ authorization }`
      }
    };

    try {
      const response = await fetch(country_url, country_options);
      const res = await response.json();
      
      //Get country code
      for (const index in res.results) {
        if (res.results[index].english_name == name || res.results[index].native_name == name) {
          country_code = res.results[index].iso_3166_1;
          returned = true;
          break;
        }
      };
      if (returned == false) {
        loading.innerHTML = ``;
        err_msg.innerHTML = `<div class="text-3xl">Country not found or not supported</div>`;
        return;
      }
    } catch (error) {
      console.error(error);
    }

    //If country supported, search for title(Consider switching to tmdb)
    const title = document.getElementById("title");
    let first_result = "";
    
    const title_url = `https://api.themoviedb.org/3/search/movie?query=${ title.value }&include_adult=false&language=en-US&page=1&region=${ country }`;
    const title_options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ authorization }`
      }
    };

    try {
      const response = await fetch(title_url, title_options);
      const res = await response.json();
      if (res.results) {
        first_result = await res.results[0];
      }
    } catch (error) {
      console.error(error);
    }
    //Handle Error if movie is not found from the request
    if (first_result == undefined) {
      loading.innerHTML = ``;
      err_msg.innerHTML = `<div class="text-3xl mt-4">Movie not found</div>`;
      return;
    }

    //From the result, format the result response so it shows what streaming services are available
    const movie_id = first_result.id;
    let service = "";
    //Fetch movie poster from omdb api
    const movie_id_url = `https://api.themoviedb.org/3/movie/${ movie_id }/watch/providers`;
    const movieUrl_options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ authorization }`
      }
    };

    try {
      const response = await fetch(movie_id_url, movieUrl_options);
      const res = await response.json();

      for (const key in res.results) {
        if (key == country_code) {
          if (res.results[key]["flatrate"]) {
            service = handleService(res.results[key]["flatrate"]);
          } else {
            service = `<div class="antialiased text-lg">Not available!</div>`;
          }
        }
      }
      if (service == "") {
        service = `<div class="antialiased text-lg">Not available!</div>`;
      }
    } catch (error) {
      console.error('error:' + error);
    }
    
    const movie_url = `https://api.themoviedb.org/3/movie/${ movie_id }?append_to_response=credits&language=en-US`;
    const movie_options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ authorization }`
      }
    }
    try {
      const response = await fetch(movie_url, movie_options);
      const res = await response.json();
      let genre = "";
      let credits = "";
      if (res.genres) {
        genre = handleGenre(await res.genres);
      }
      if (res.credits && res.credits.cast) {
        credits = handleCast(await res.credits.cast);
      }
      /*
      <h2 class="text-xl font-semibold">Top Cast</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${ credits }
      </div>
      */
      loading.innerHTML = ``;
      result.innerHTML = `
        <!-- Movie Poster and Overview Section -->
        <div class="p-4 flex flex-col md:flex-row bg-gradient-to-r from-slate-300 to-slate-500 rounded-lg">
            <!-- Movie Overview -->
            <div class="md:w-2/3 md:pl-8">
                <h1 class="text-3xl font-semibold mb-2">${ res.title }</h1>
                <div class="flex items-center text-sm mb-2">
                    
                    <span class="mr-2">${ res.runtime } mins</span>
                    <span class="mr-2">${ res.release_date }</span>
                </div>
                <p class="text-base mb-4">${ res.overview }</p>
                <div class="flex items-center mb-4">
                    <span class="text-gray-600 mr-2">Rating:</span>
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            class="h-5 w-5 text-yellow-500 mr-1">
                            <path
                                d="M10 1l2.56 5.828L18 7l-4.182 4.118L15.1 18 10 14.728 4.9 18l1.282-6.882L2 7l5.44-.172L10 1z" />
                        </svg>
                        <span>${ res.vote_average }/10</span>
                    </div>
                </div>
                <div class="flex items-center mb-6">
                    <span class="text-gray-600 mr-2">Genres:</span>
                    <span>${ genre }</span>
                </div>
                <h2 class="text-xl font-semibold mb-4">Streaming Services in ${ country.value }</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 auto-rows-max gap-4 mb-4">
                        ${ service }
                </div>
                
            </div>
            <!-- Movie Poster -->
            <div class="md:w-1/3">
                <img src="https://image.tmdb.org/t/p/w500${ res.poster_path }" alt="Movie Poster" class="rounded-lg">
            </div>
        </div>
    `;
    } catch (error) {
      console.error(error);
    }
  };

  async function fetchRegions() {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ authorization }`
      }
    };
    
    let url = 'https://api.themoviedb.org/3/watch/providers/regions?language=en-US';
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      let countryNames = [];
      for (let obj of data.results) {
        countryNames.push(obj.english_name);
      }
      setCountryListInput(countryNames);
    } catch (error) {
      console.log(error);
    }
  }
  //Main page
  const [countryInput, setCountryInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [countryList, setCountryListInput] = useState([]);
  
  //Similar to onMounted in Vue
  useEffect(() => {
    //Fetch supported regions
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
            value={ countryInput } 
            onChange={(e) => setCountryInput(e.target.value)}
        >
            <option value="">Select a country</option>
            {countryList.map((country, index) => (
              <option key={ index } value={ country }>
                { country }
              </option>
            ))}
        </select>
        <input type="text" id="title" className="border rounded border-black p-2" placeholder="Enter title here..." value = { titleInput } onChange={(e) => setTitleInput(e.target.value)}></input>
        <button className="rounded p-2 bg-cyan-400 hover:bg-sky-400" onClick={handleSubmit}>Submit</button>
        </div> 
        <div id="err_msg" className="p-4"></div>
        <div id="loading" className="w-screen"></div>
        <div id="result" className="container mx-auto px-4 py-8 mb-16"></div>
      </div>
    </div>
  )
}
