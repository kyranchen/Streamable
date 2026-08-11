export default function SearchBar({
  countryList,
  countryInput,
  titleInput,
  regionsLoading,
  onCountryChange,
  onTitleChange,
  onSubmit,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto w-full px-4 mb-6">
      <select
        className="bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
        value={countryInput}
        onChange={(e) => onCountryChange(e.target.value)}
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
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      />
      <button
        className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        onClick={onSubmit}
      >
        Search
      </button>
    </div>
  );
}
