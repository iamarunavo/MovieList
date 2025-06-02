import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetails.css';

// Import TMDB configuration from App.js
const TMDB_CONFIG = {
    baseUrl: 'https://api.themoviedb.org/3',
    apiKey: process.env.REACT_APP_TMDB_API_KEY,
    imageBase: 'https://image.tmdb.org/t/p'
};

// API request helper
const fetchTMDB = async (endpoint, params = {}) => {
    const url = new URL(`${TMDB_CONFIG.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', TMDB_CONFIG.apiKey);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json();
};

const MovieDetails = ({ favourites = [], handleAddFavourite, handleRemoveFavourite, user, processingMovies }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchProviders, setWatchProviders] = useState(null);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [providersError, setProvidersError] = useState(null);

    const isFavourite = movie && favourites.some(fav => fav.id === movie.id);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const [movieData, creditsData] = await Promise.all([
                    fetchTMDB(`/movie/${id}`),
                    fetchTMDB(`/movie/${id}/credits`)
                ]);
                
                setMovie(movieData);
                document.title = `${movieData.title} | LaxMovies`;

                if (creditsData && creditsData.cast) {
                    setActors(creditsData.cast.slice(0, 10));
                }
            } catch (error) {
                setError(error.message);
                console.error('Error fetching movie details:', error);
                document.title = 'Movie Not Found | LaxMovies';
            } finally {
                setLoading(false);
            }
        };

        const fetchWatchProviders = async () => {
            setLoadingProviders(true);
            setProvidersError(null);
            try {
                const data = await fetchTMDB(`/movie/${id}/watch/providers`);
                setWatchProviders(data.results?.US || null);
            } catch (error) {
                setProvidersError(error.message);
                console.error('Error fetching watch providers:', error);
            } finally {
                setLoadingProviders(false);
            }
        };

        fetchMovieDetails();
        fetchWatchProviders();

        return () => {
            document.title = 'LaxMovies | Browse Movies';
        };
    }, [id]);

    const handleFavoriteClick = async () => {
        if (!user) {
            alert("Please sign in to manage favorites");
            return;
        }
        if (!movie || processingMovies.has(movie.id)) return;
        
        if (isFavourite) {
            await handleRemoveFavourite(movie);
        } else {
            await handleAddFavourite(movie);
        }
    };

    const WatchProvidersSection = () => {
        if (loadingProviders) {
            return (
                <div className="watch-providers-loading">
                    <div className="spinner" aria-label="Loading watch providers" />
                    <span>Loading streaming options...</span>
                </div>
            );
        }

        if (providersError) {
            return (
                <div className="watch-providers-error">
                    Unable to load streaming options: {providersError}
                </div>
            );
        }

        if (!watchProviders || (!watchProviders.flatrate && !watchProviders.rent && !watchProviders.buy)) {
            return (
                <div className="watch-providers-empty">
                    No streaming options available at this time.
                </div>
            );
        }

        const renderProviderList = (providers, category) => {
            if (!providers || providers.length === 0) return null;

            return (
                <div className="provider-category">
                    <h4>{category}</h4>
                    <div className="provider-list">
                        {providers.map(provider => (
                            <div
                                key={provider.provider_id}
                                className="provider-item"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="provider-logo"
                                />
                                <span className="provider-name">{provider.provider_name}</span>
                                <span className="provider-category-label">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <div className="watch-providers-content">
                <div className="watch-providers-header">
                    <p className="watch-providers-info">
                        Find detailed availability information on JustWatch:
                    </p>
                    <a 
                        href={watchProviders.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="justwatch-link"
                    >
                        <svg width="86" height="20" viewBox="0 0 86 20" className="justwatch-logo">
                            <path fill="currentColor" d="M13.7 7.14l-5.23 2.97v8.8L13.7 16.5V7.14zM19.86 3.3L14.63 6.27v9.67l5.23-2.98V3.3zM8.47 4.9L2.5 7.14v9.37l5.97-2.24V4.9zM20.66 0l-6.04 2.24v9.37l6.04-2.24V0zM40.87 5.09h2.76v10.15h-2.76V5.09zM51.56 7.96c-.616-.407-1.309-.632-2.02-.66-1.16 0-2.06.54-2.06 1.44 0 .84.66 1.14 1.56 1.38l.96.24c1.77.45 3.21 1.23 3.21 3.15 0 2.19-1.92 3.45-4.59 3.45-1.291.003-2.567-.277-3.72-.81l.81-2.22c.78.42 1.92.78 2.91.78 1.32 0 2.01-.48 2.01-1.29 0-.72-.57-1.08-1.68-1.38l-.96-.24c-1.68-.42-3.06-1.29-3.06-3.12 0-2.22 1.89-3.57 4.47-3.57 1.243-.022 2.476.246 3.6.78l-.78 2.07h-.6zM59.16 13.15v2.1h-6.81V5.09h2.76v8.06h4.05zM65.88 11.11h-1.86v4.14h-2.76V5.09h4.92c2.43 0 4.05 1.23 4.05 3 .074.825-.219 1.643-.81 2.25-.592.607-1.404.959-2.25.99l3.33 3.9h-3.24l-3-4.14 1.62.02zm-.27-2.01c1.11 0 1.74-.48 1.74-1.2s-.63-1.2-1.74-1.2h-1.59v2.4h1.59zM77.03 5.09h2.76v10.15h-2.76V5.09z"/>
                        </svg>
                        View all streaming options
                    </a>
                </div>
                <div className="providers-grid">
                    {renderProviderList(watchProviders.flatrate, "Stream")}
                    {renderProviderList(watchProviders.rent, "Rent")}
                    {renderProviderList(watchProviders.buy, "Buy")}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="movie-details loading">Loading...</div>;
    }

    if (error) {
        return <div className="movie-details error">Error: {error}</div>;
    }

    if (!movie) {
        return <div className="movie-details">Movie not found</div>;
    }

    return (
        <div className="movie-details-container">
            <button 
                onClick={() => navigate('/')} 
                className="back-button"
            >
                ← Back to Movies
            </button>
            <div className="movie-main-details">
                <div className="poster-container">
                    <img
                        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                        alt={movie.title}
                        className="movie-poster"
                    />
                </div>
                <div className="movie-info">
                    <h2>{movie.title}</h2>
                    <p className="release-date">Release Date: {movie.release_date}</p>
                    <div className="genres">
                        {movie.genres.map(genre => genre.name).join(', ')}
                    </div>
                    <p className="overview">{movie.overview}</p>
                    <div className="movie-stats">
                        <div className="rating">
                            <span className="star">★</span> {movie.vote_average.toFixed(1)}/10
                        </div>
                        <div className="votes">({movie.vote_count.toLocaleString()} votes)</div>
                    </div>
                    <div className="favorites-buttons">
                        {user ? (
                            <button
                                className={`btn-favorite ${isFavourite ? 'remove' : 'add'}`}
                                onClick={handleFavoriteClick}
                                disabled={processingMovies.has(movie?.id)}
                                aria-label={isFavourite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                {processingMovies.has(movie?.id) ? (
                                    <>
                                        <div className="spinner" aria-hidden="true" />
                                        <span>{isFavourite ? 'Removing...' : 'Adding...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" aria-hidden="true">
                                            <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                                        </svg>
                                        <span>{isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="login-prompt">
                                Sign in to manage favorites
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="watch-providers-section">
                <h3>Where to Watch</h3>
                <WatchProvidersSection />
            </div>

            <div className="actors-section">
                <h3>Top Cast</h3>
                <div className="actors-grid">
                    {actors.map(actor => (
                        actor.profile_path && (
                            <div key={actor.id} className="actor-card">
                                <img
                                    src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
                                    alt={actor.name}
                                    className="actor-image"
                                />
                                <p className="actor-name">{actor.name}</p>
                                <p className="character-name">as {actor.character}</p>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
