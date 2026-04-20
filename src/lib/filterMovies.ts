export interface FilterState {
  sortBy: 'popularity' | 'rating' | 'title' | 'release';
  filterByRating: string;
  filterByGenre: string;
  filterByYear: string;
}

export function filterAndSortMovies(movies: any[], filters: FilterState): any[] {
  return movies
    .filter(movie => {
      const matchesRating = movie.vote_average >= Number(filters.filterByRating);
      const matchesGenre =
        !filters.filterByGenre ||
        (movie.genre_ids || []).includes(Number(filters.filterByGenre));
      const matchesYear =
        !filters.filterByYear ||
        movie.release_date?.startsWith(filters.filterByYear);
      return matchesRating && matchesGenre && matchesYear;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'release':
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        default:
          return b.popularity - a.popularity;
      }
    });
}
