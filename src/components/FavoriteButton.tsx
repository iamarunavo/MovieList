'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function FavoriteButton({ movie }: { movie: any }) {
  const { currentUser } = useAuth();
  const { isFavourite, addFavorite, removeFavorite, processingMovies } = useFavorites();
  const router = useRouter();

  if (!currentUser) return null;

  const isFav = isFavourite(movie.id);
  const isProcessing = processingMovies.has(movie.id);

  const handleClick = async () => {
    if (isProcessing) return;
    if (isFav) await removeFavorite(movie);
    else await addFavorite(movie);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
        ${isFav
          ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
          : 'bg-pink-brand/20 border border-pink-brand/40 text-pink-brand hover:bg-pink-brand/30'
        }
        ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
    >
      {isProcessing ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill={isFav ? '#dc3545' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
        </svg>
      )}
      {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
    </button>
  );
}
