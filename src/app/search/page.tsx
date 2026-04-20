'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchTMDB, getGenres } from '@/lib/tmdb';
import { filterAndSortMovies } from '@/lib/filterMovies';
import SidebarFilters from '@/components/SidebarFilters';
import MovieGrid from '@/components/MovieGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q      = searchParams.get('q') || '';
  const genre  = searchParams.get('genre') || '';
  const year   = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '0';
  const sort   = searchParams.get('sort') || 'popularity';

  const [movies, setMovies] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== '0') params.set(key, value);
        else params.delete(key);
      });
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Fetch movies when q changes
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const endpoint = q.trim() ? '/search/movie' : '/trending/movie/week';
        const params = q.trim()
          ? { query: q, page: '1', include_adult: 'false' }
          : { page: '1' };
        const data = await fetchTMDB<any>(endpoint, params);
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalResults(data.total_results || 0);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    const t = setTimeout(load, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [q]);

  // Load genres once
  useEffect(() => {
    getGenres().then(d => setGenres(d.genres || []));
  }, []);

  // Infinite scroll load more
  const loadMore = useCallback(async () => {
    if (currentPage >= totalPages || isLoading) return;
    const nextPage = currentPage + 1;
    const endpoint = q.trim() ? '/search/movie' : '/trending/movie/week';
    const params = q.trim()
      ? { query: q, page: String(nextPage), include_adult: 'false' }
      : { page: String(nextPage) };
    try {
      const data = await fetchTMDB<any>(endpoint, params);
      setMovies(prev => {
        const ids = new Set(prev.map((m: any) => m.id));
        return [...prev, ...data.results.filter((m: any) => !ids.has(m.id))];
      });
      setCurrentPage(nextPage);
    } catch (err) {
      console.error(err);
    }
  }, [currentPage, totalPages, isLoading, q]);

  const [isFetchingMore] = useInfiniteScroll(loadMore, currentPage < totalPages, 200);

  // Client-side filter+sort — same logic as existing FilterBar.js
  const filteredMovies = useMemo(
    () =>
      filterAndSortMovies(movies, {
        sortBy: sort as any,
        filterByRating: rating,
        filterByGenre: genre,
        filterByYear: year,
      }),
    [movies, sort, rating, genre, year]
  );

  return (
    <div className="min-h-screen bg-dark-base">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-10 pb-16">
        {/* Top bar */}
        <div className="mb-6">
          {q ? (
            <p className="text-white/60 text-sm">
              Showing{' '}
              <span className="text-white font-medium">
                {totalResults.toLocaleString()}
              </span>{' '}
              results for{' '}
              <span className="text-pink-brand font-medium">"{q}"</span>
            </p>
          ) : (
            <p className="text-white/60 text-sm">
              Browsing <span className="text-white font-medium">trending movies</span>
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <SidebarFilters
            sortBy={sort}
            setSortBy={v => updateParams({ sort: v })}
            filterByRating={rating}
            setFilterByRating={v => updateParams({ rating: v })}
            filterByGenre={genre}
            setFilterByGenre={v => updateParams({ genre: v })}
            filterByYear={year}
            setFilterByYear={v => updateParams({ year: v })}
            genres={genres}
          />

          {/* Results */}
          <div className="flex-1 min-w-0 min-h-[60vh]">
            {isLoading && movies.length === 0 ? (
              <LoadingSpinner />
            ) : (
              <MovieGrid
                movies={filteredMovies}
                emptyMessage={q ? `No results for "${q}"` : 'No movies found.'}
              />
            )}
            {(isLoading || isFetchingMore) && movies.length > 0 && (
              <LoadingSpinner size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExploreContent />
    </Suspense>
  );
}
