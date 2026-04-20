import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: any[];
  emptyMessage?: string;
}

export default function MovieGrid({ movies, emptyMessage = 'No movies found.' }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} size="md" />
      ))}
    </div>
  );
}
