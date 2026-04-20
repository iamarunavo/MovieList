'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getGenres } from '@/lib/tmdb';
import { filterAndSortMovies } from '@/lib/filterMovies';
import SidebarFilters from '@/components/SidebarFilters';
import MovieGrid from '@/components/MovieGrid';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FavoritesPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [favourites, setFavourites] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortBy, setSortBy] = useState('popularity');
  const [filterByRating, setFilterByRating] = useState('0');
  const [filterByGenre, setFilterByGenre] = useState('');
  const [filterByYear, setFilterByYear] = useState('');

  useEffect(() => {
    if (!currentUser && !isLoading) router.push('/login');
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    const fetchFavs = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        setFavourites(snap.docs.map(d => d.data().movie));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavs();
  }, [currentUser]);

  useEffect(() => {
    getGenres().then(d => setGenres(d.genres || []));
  }, []);

  const filtered = useMemo(
    () =>
      filterAndSortMovies(favourites, {
        sortBy: sortBy as any,
        filterByRating,
        filterByGenre,
        filterByYear,
      }),
    [favourites, sortBy, filterByRating, filterByGenre, filterByYear]
  );

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-dark-base">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-10 pb-16">
        <div className="flex gap-8">
          <SidebarFilters
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterByRating={filterByRating}
            setFilterByRating={setFilterByRating}
            filterByGenre={filterByGenre}
            setFilterByGenre={setFilterByGenre}
            filterByYear={filterByYear}
            setFilterByYear={setFilterByYear}
            genres={genres}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold text-pink-brand mb-6 border-l-4 border-pink-brand pl-4 tracking-tight">My Favorites</h1>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/5 rounded-xl">
                <span className="text-4xl">🎬</span>
                <p className="text-white text-lg font-medium">No favorites yet.</p>
                <p className="text-white/50 text-sm">
                  Browse movies and click the heart icon to save them here.
                </p>
              </div>
            ) : (
              <MovieGrid movies={filtered} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
