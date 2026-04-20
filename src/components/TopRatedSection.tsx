import ScrollRow from './ScrollRow';
import MovieCard from './MovieCard';

export default function TopRatedSection({ movies }: { movies: any[] }) {
  return (
    <ScrollRow title="Top Rated">
      {movies.map(m => (
        <MovieCard key={m.id} movie={m} size="sm" />
      ))}
    </ScrollRow>
  );
}
