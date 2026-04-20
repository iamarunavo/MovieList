'use client';

interface Genre {
  id: number;
  name: string;
}

interface SidebarFiltersProps {
  sortBy: string;
  setSortBy: (v: string) => void;
  filterByRating: string;
  setFilterByRating: (v: string) => void;
  filterByGenre: string;
  setFilterByGenre: (v: string) => void;
  filterByYear: string;
  setFilterByYear: (v: string) => void;
  genres: Genre[];
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

const selectClass =
  'w-full appearance-none bg-dark-deep/80 border border-white/15 rounded-lg text-white text-sm px-3 py-2 cursor-pointer ' +
  'focus:outline-none focus:border-pink-brand focus:ring-1 focus:ring-pink-brand/20 hover:bg-white/10 transition-colors';

const RATING_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '7', label: '7+' },
  { value: '8', label: '8+' },
  { value: '9', label: '9+' },
];

export default function SidebarFilters({
  sortBy,
  setSortBy,
  filterByRating,
  setFilterByRating,
  filterByGenre,
  setFilterByGenre,
  filterByYear,
  setFilterByYear,
  genres,
}: SidebarFiltersProps) {
  return (
    <aside className="w-56 shrink-0">
      <div className="ps-panel p-5">
        <div className="pb-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
            Sort By
          </h3>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={selectClass}
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="title">Title (A–Z)</option>
            <option value="release">Release Date</option>
          </select>
        </div>

        <div className="border-t border-white/[0.06] pt-5 pb-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
            Genre
          </h3>
          <select
            value={filterByGenre}
            onChange={e => setFilterByGenre(e.target.value)}
            className={selectClass}
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g.id} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-white/[0.06] pt-5 pb-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
            Year
          </h3>
          <select
            value={filterByYear}
            onChange={e => setFilterByYear(e.target.value)}
            className={selectClass}
          >
            <option value="">All Years</option>
            {YEARS.map(y => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
            Rating
          </h3>
          <div className="flex flex-wrap gap-2">
            {RATING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterByRating(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterByRating === opt.value
                    ? 'bg-pink-brand text-white shadow-[0_0_12px_rgba(255,27,141,0.4)]'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
