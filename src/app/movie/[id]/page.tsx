'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchTMDB, POSTER_URL, PROFILE_URL } from '@/lib/tmdb';
import FavoriteButton from '@/components/FavoriteButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [actors, setActors] = useState<any[]>([]);
  const [watchProviders, setWatchProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [movieData, creditsData, providersData] = await Promise.all([
          fetchTMDB(`/movie/${id}`),
          fetchTMDB(`/movie/${id}/credits`),
          fetchTMDB(`/movie/${id}/watch/providers`).catch(() => null),
        ]);
        setMovie(movieData);
        setActors((creditsData?.cast || []).slice(0, 10));
        setWatchProviders(providersData?.results?.US || null);
        document.title = `${movieData.title} | LaxMovies`;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { document.title = 'LaxMovies | Browse Movies'; };
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-white/60">Failed to load movie.</p>
      <button onClick={() => router.back()} className="text-sm text-pink-brand hover:underline">← Go Back</button>
    </div>
  );
  if (!movie) return null;

  const renderProviders = (providers: any[], label: string) => {
    if (!providers?.length) return null;
    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">{label}</h4>
        <div className="flex flex-wrap gap-3">
          {providers.map(p => (
            <div key={p.provider_id} className="flex flex-col items-center gap-1 w-14">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                <Image
                  src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                  alt={p.provider_name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] text-white/50 text-center leading-tight">{p.provider_name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-base">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header actions */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back
          </button>
          <FavoriteButton movie={movie} />
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-10">
          {/* Poster */}
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] bg-white/5 shrink-0">
            {movie.poster_path && (
              <Image
                src={POSTER_URL(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                sizes="280px"
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{movie.title}</h1>
            <p className="text-white/50 text-sm mb-4">Release Date: {movie.release_date || '—'}</p>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(movie.genres || []).map((g: any) => (
                <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/80">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-white/70 leading-relaxed text-sm md:text-base mb-6">
              {movie.overview || 'No description available.'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-2 shadow-[0_0_16px_rgba(255,215,0,0.12)]">
                <span className="text-gold text-lg">★</span>
                <span className="text-white font-semibold text-lg">
                  {movie.vote_average?.toFixed(1)}
                </span>
                <span className="text-white/40 text-sm">/10</span>
              </div>
              <span className="text-white/40 text-sm">
                ({(movie.vote_count || 0).toLocaleString()} votes)
              </span>
            </div>
          </div>
        </div>

        {/* Where to Watch */}
        <div className="mb-10 p-6 bg-dark-surface rounded-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <h3 className="text-xl font-extrabold text-pink-brand mb-5 border-l-4 border-pink-brand pl-4">Where to Watch</h3>
          {!watchProviders ? (
            <p className="text-white/40 text-sm">No streaming options available in the US at this time.</p>
          ) : (
            <div>
              {renderProviders(watchProviders.flatrate, 'Stream')}
              {renderProviders(watchProviders.rent, 'Rent')}
              {renderProviders(watchProviders.buy, 'Buy')}
              {watchProviders.link && (
                <a
                  href={watchProviders.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-pink-brand hover:underline"
                >
                  View all options on JustWatch →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Top Cast */}
        {actors.length > 0 && (
          <div>
            <h3 className="text-xl font-extrabold text-pink-brand mb-5 border-l-4 border-pink-brand pl-4">Top Cast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {actors.map(actor => (
                <div key={actor.id} className="bg-dark-surface border border-white/10 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-200">
                  <div className="relative w-full aspect-[2/3] bg-white/5">
                    {actor.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                        alt={actor.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 160px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white leading-tight truncate">{actor.name}</p>
                    <p className="text-xs text-white/40 leading-tight truncate mt-0.5">as {actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
