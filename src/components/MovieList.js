import React from 'react';
import { Link } from 'react-router-dom';

const MovieList = ({ movies, handleFavouritesClick, handleRemoveFavourite, favourites = [], user, processingMovies = new Set() }) => {
    const isFavourite = (movie) => {
        return favourites.some(fav => fav.id === movie.id);
    };

    const handleFavoriteClick = (e, movie) => {
        e.preventDefault(); // Prevent navigating to movie details
        if (!user) {
            alert("Please sign in to manage favorites");
            return;
        }
        
        if (processingMovies.has(movie.id)) return;
        
        if (isFavourite(movie)) {
            handleRemoveFavourite(movie);
        } else {
            handleFavouritesClick(movie);
        }
    };

    return (
        <div className="movie-grid">
            {movies.map((movie, index) => (
                movie.poster_path && (
                    <div className="movie-card" key={movie.id || index}>
                        <div className="movie-card-poster">
                            <Link to={`/movie/${movie.id}`}>
                                <img
                                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                    alt={movie.title}
                                    className="poster-image"
                                />
                            </Link>
                            <button
                                onClick={(e) => handleFavoriteClick(e, movie)}
                                className={`favorite-button ${isFavourite(movie) ? 'is-favorite' : ''} ${processingMovies.has(movie.id) ? 'processing' : ''}`}
                                aria-label={isFavourite(movie) ? 'Remove from favorites' : 'Add to favorites'}
                                disabled={processingMovies.has(movie.id)}
                            >
                                {processingMovies.has(movie.id) ? (
                                    <div className="spinner" aria-hidden="true" />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill={isFavourite(movie) ? "#dc3545" : "none"} stroke="white">
                                        <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                                    </svg>
                                )}
                            </button>
                            {!user && (
                                <div className="login-prompt">
                                    Sign in to manage favorites
                                </div>
                            )}
                        </div>
                        <div className="movie-card-content">
                            <h3 className="movie-title" title={movie.title}>{movie.title}</h3>
                            <div className="movie-meta">
                                <span className="movie-year">{movie.release_date?.split('-')[0]}</span>
                                {movie.vote_average > 0 && (
                                    <div className="movie-rating">
                                        <span className="star">★</span>
                                        <span>{movie.vote_average.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            ))}
        </div>
    );
};

export default MovieList;
