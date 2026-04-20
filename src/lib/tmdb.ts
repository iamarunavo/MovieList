const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const POSTER_URL = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder-poster.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const PROFILE_URL = (path: string | null, size: 'w200' | 'w500' = 'w200') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export async function fetchTMDB<T = any>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', process.env.NEXT_PUBLIC_TMDB_API_KEY!);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${endpoint}`);
  return res.json();
}

export const getTrending = (timeWindow: 'day' | 'week', page = 1) =>
  fetchTMDB<any>(`/trending/movie/${timeWindow}`, { page: String(page) });

export const searchMovies = (query: string, page = 1) =>
  fetchTMDB<any>('/search/movie', { query, page: String(page), include_adult: 'false' });

export const getMovieDetails = (id: string) =>
  fetchTMDB<any>(`/movie/${id}`);

export const getMovieCredits = (id: string) =>
  fetchTMDB<any>(`/movie/${id}/credits`);

export const getWatchProviders = (id: string) =>
  fetchTMDB<any>(`/movie/${id}/watch/providers`);

export const getGenres = () =>
  fetchTMDB<any>('/genre/movie/list');

export const getTopRated = (page = 1) =>
  fetchTMDB<any>('/movie/top_rated', { page: String(page) });
