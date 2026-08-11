const TMDB_IMAGE = "https://image.tmdb.org/t/p/w200";
const PLACEHOLDER = "https://placehold.co/200x300/27272a/71717a?text=No+Image";

export default function SearchResults({ results, onSelect }) {
  return (
    <div className="max-w-3xl mx-auto px-4 w-full">
      <p className="text-zinc-400 text-sm mb-4">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {results.map((movie) => (
          <button
            key={movie.id}
            onClick={() => onSelect(movie.id)}
            className="group text-left bg-zinc-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all"
          >
            <img
              src={movie.poster_path ? `${TMDB_IMAGE}${movie.poster_path}` : PLACEHOLDER}
              alt={`${movie.title} poster`}
              className="w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-opacity"
            />
            <div className="p-2">
              <p className="text-white text-xs font-semibold line-clamp-2 leading-snug">{movie.title}</p>
              {movie.release_date && (
                <p className="text-zinc-400 text-xs mt-0.5">{movie.release_date.slice(0, 4)}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
