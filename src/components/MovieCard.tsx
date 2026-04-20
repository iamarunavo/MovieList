'use client';

import Link from 'next/link';
import Image from 'next/image';
import { POSTER_URL } from '@/lib/tmdb';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';

interface MovieCardProps {
  movie: any;
  size?: 'sm' | 'md';
}

export default function MovieCard({ movie, size = 'md' }: MovieCardProps) {
  const { currentUser } = useAuth();
  const { isFavourite, addFavorite, removeFavorite, processingMovies } = useFavorites();
  const isFav = isFavourite(movie.id);
  const isProcessing = processingMovies.has(movie.id);

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) removeFavorite(movie);
    else addFavorite(movie);
  };

  const posterSize = size === 'sm' ? 'w200' : 'w500';

  return (
    <div className={`group flex flex-col transition-shadow duration-300 ${size === 'sm' ? 'w-[180px] shrink-0' : 'w-full'}`}>
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2 shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-shadow duration-300">
        <Link href={`/movie/${movie.id}`} className="block w-full h-full">
          {movie.poster_path ? (
            <Image
              src={POSTER_URL(movie.poster_path, posterSize)}
              alt={movie.title}
              fill
              sizes={size === 'sm' ? '180px' : '(max-width: 640px) 50vw, 200px'}
              className="object-cover transition-all duration-300 group-hover:scale-[1.04] group-hover:brightness-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dark-surface text-white/20 text-xs text-center px-2">
              No Poster
            </div>
          )}
        </Link>

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 left-2 bg-dark-deep/90 border border-white/15 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs font-semibold flex items-center gap-0.5">
            <span className="text-gold">★</span>
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Favorite button — only shown for logged-in users */}
        {currentUser && (
          <button
            onClick={handleFavClick}
            disabled={isProcessing}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isFav ? 'opacity-100 bg-red-500/30' : 'opacity-0 group-hover:opacity-100 bg-black/60'}
              ${isProcessing ? 'cursor-not-allowed' : 'hover:scale-110'}`}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isProcessing ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill={isFav ? '#dc3545' : 'none'}
                stroke="white"
                strokeWidth="1.5"
              >
                <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-0.5">
        {movie.title}
      </h3>
      <span className="text-xs text-white/50">
        {movie.release_date?.split('-')[0] || '—'}
      </span>
    </div>
  );
}
