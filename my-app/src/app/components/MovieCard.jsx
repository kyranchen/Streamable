export default function MovieCard({ movie, countryName }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row">

          {/* Poster */}
          <div className="md:w-56 flex-shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-white mb-1">{movie.title}</h1>

            {/* Year · Runtime · Rating */}
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
              <span>{year}</span>
              <span>·</span>
              <span>{movie.runtime} min</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
            </div>

            {/* Genre pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((g) => (
                <span key={g.id} className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-full text-xs font-medium">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-zinc-300 text-sm leading-relaxed mb-5 line-clamp-4">
              {movie.overview}
            </p>

            {/* Streaming services */}
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Available on in {countryName}
            </p>
            <div className="flex flex-wrap gap-2">
              {movie.streamingProviders?.length > 0 ? (
                movie.streamingProviders
                  .filter((s) => s.logo_path)
                  .map((s) => (
                    <div key={s.provider_id} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-lg px-3 py-2">
                      <img
                        src={`https://image.tmdb.org/t/p/w92${s.logo_path}`}
                        alt={s.provider_name}
                        className="w-8 h-8 rounded-md flex-shrink-0"
                      />
                      <span className="text-sm text-white font-medium leading-tight">
                        {s.provider_name}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-zinc-500 text-sm">Not available in this region</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
