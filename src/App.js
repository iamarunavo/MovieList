import React, { useState, useEffect, useMemo, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Favorites from './pages/Favorites';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import logo from './assets/logo.svg';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { validateEnvVariables } from './utils/envValidator';

// Validate environment variables in development
if (process.env.NODE_ENV === 'development') {
    validateEnvVariables();
}

// TMDB API Configuration
const TMDB_CONFIG = {
    baseUrl: 'https://api.themoviedb.org/3',
    apiKey: process.env.REACT_APP_TMDB_API_KEY,
    imageBase: 'https://image.tmdb.org/t/p'
};

// Validate API configuration
if (!TMDB_CONFIG.apiKey) {
    console.error("TMDB API Key is missing!");
} else {
    console.log("TMDB API Key is configured");
}

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

const App = () => {
    const [movies, setMovies] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [processingMovies, setProcessingMovies] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('popularity');
    const [filterByRating, setFilterByRating] = useState('0');
    const [filterByGenre, setFilterByGenre] = useState('');
    const [filterByYear, setFilterByYear] = useState('');
    const [genres, setGenres] = useState([]);
    const { currentUser, logout } = useAuth();

    // Fetch trending movies initially
    useEffect(() => {
        const fetchTrendingMovies = async () => {
            try {
                setIsLoading(true);
                const [page1Data, page2Data] = await Promise.all([
                    fetchTMDB('/trending/movie/week', { page: '1' }),
                    fetchTMDB('/trending/movie/week', { page: '2' })
                ]);
                
                if (page1Data.results && page2Data.results) {
                    setMovies([...page1Data.results, ...page2Data.results]);
                } else {
                    console.error('Invalid API response structure:', { page1Data, page2Data });
                }
            } catch (error) {
                console.error('Error fetching trending movies:', error.message);
                setMovies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrendingMovies();
    }, []);

    // Handle search with debounce
    useEffect(() => {
        const searchMovies = async () => {
            if (!searchTerm.trim()) {
                const [page1Data, page2Data] = await Promise.all([
                    fetchTMDB('/trending/movie/week', { page: '1' }),
                    fetchTMDB('/trending/movie/week', { page: '2' })
                ]);
                
                if (page1Data.results && page2Data.results) {
                    setMovies([...page1Data.results, ...page2Data.results]);
                }
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchTMDB('/search/movie', {
                    query: searchTerm.trim(),
                    include_adult: 'false'
                });
                if (data.results) {
                    setMovies(data.results);
                }
            } catch (error) {
                console.error('Error searching movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            searchMovies();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch genres
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await fetchTMDB('/genre/movie/list');
                if (data.genres) {
                    setGenres(data.genres);
                }
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };

        fetchGenres();
    }, []);

    // Memoize callbacks
    const handleSearchTermChange = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleSignOut = useCallback(async () => {
        try {
            await logout();
            setFavourites([]);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, [logout]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!currentUser) {
                setFavourites([]);
                return;
            }

            try {
                const favoritesRef = collection(db, 'favorites');
                const q = query(favoritesRef, where('userId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const userFavorites = [];
                querySnapshot.forEach((doc) => {
                    userFavorites.push(doc.data().movie);
                });
                setFavourites(userFavorites);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [currentUser]);

    useEffect(() => {
        // Validate API key on mount
        if (!TMDB_CONFIG.apiKey) {
            console.error('TMDB API key is missing');
        } else if (TMDB_CONFIG.apiKey.length !== 32) {
            console.error('TMDB API key has incorrect length');
        } else {
            console.log('TMDB API connection successful');
        }
    }, []);

    // Filter and sort movies
    const filteredMovies = useMemo(() => {
        return movies
            .filter(movie => {
                const matchesRating = movie.vote_average >= Number(filterByRating);
                const matchesGenre = !filterByGenre || movie.genre_ids.includes(Number(filterByGenre));
                const matchesYear = !filterByYear || movie.release_date?.startsWith(filterByYear);
                return matchesRating && matchesGenre && matchesYear;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'rating':
                        return b.vote_average - a.vote_average;
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'release':
                        return new Date(b.release_date) - new Date(a.release_date);
                    case 'popularity':
                    default:
                        return b.popularity - a.popularity;
                }
            });
    }, [movies, sortBy, filterByRating, filterByGenre, filterByYear]);

    const handleAddFavorite = async (movie) => {
        if (!currentUser || processingMovies.has(movie.id)) return;
        
        setProcessingMovies(prev => new Set([...prev, movie.id]));
        try {
            const favoriteRef = doc(db, 'favorites', `${currentUser.uid}_${movie.id}`);
            await setDoc(favoriteRef, {
                userId: currentUser.uid,
                movie: movie,
                addedAt: new Date().toISOString()
            });
            setFavourites(prev => [...prev, movie]);
        } catch (error) {
            console.error('Error adding favorite:', error);
            alert('Failed to add to favorites. Please try again.');
        } finally {
            setProcessingMovies(prev => {
                const newSet = new Set(prev);
                newSet.delete(movie.id);
                return newSet;
            });
        }
    };

    const handleRemoveFavorite = async (movie) => {
        if (!currentUser || processingMovies.has(movie.id)) return;

        setProcessingMovies(prev => new Set([...prev, movie.id]));
        try {
            const favoriteRef = doc(db, 'favorites', `${currentUser.uid}_${movie.id}`);
            await deleteDoc(favoriteRef);
            setFavourites(prev => prev.filter(fav => fav.id !== movie.id));
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Failed to remove from favorites. Please try again.');
        } finally {
            setProcessingMovies(prev => {
                const newSet = new Set(prev);
                newSet.delete(movie.id);
                return newSet;
            });
        }
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    currentUser ? <Navigate to="/" /> : <Login />
                } />
                <Route path="/signup" element={
                    currentUser ? <Navigate to="/" /> : <SignUp />
                } />
                <Route path="/" element={
                    <>
                        <div className='container-fluid movie-app'>
                            <Navbar 
                                logo={logo}
                                searchTerm={searchTerm}
                                setSearchTerm={handleSearchTermChange}
                                currentUser={currentUser}
                                favourites={favourites}
                                handleSignOut={handleSignOut}
                            />
                            <FilterBar
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
                            <div className='row'>
                                {isLoading ? (
                                    <div className="loading-spinner">Loading...</div>
                                ) : (
                                    <MovieList
                                        movies={filteredMovies}
                                        handleFavouritesClick={handleAddFavorite}
                                        handleRemoveFavourite={handleRemoveFavorite}
                                        favourites={favourites}
                                        user={currentUser}
                                        processingMovies={processingMovies}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                } />
                <Route path="/movie/:id" element={
                    <MovieDetails
                        favourites={favourites}
                        handleAddFavourite={handleAddFavorite}
                        handleRemoveFavourite={handleRemoveFavorite}
                        user={currentUser}
                        processingMovies={processingMovies}
                    />
                } />
                <Route path="/favorites" element={
                    <>
                        <div className='container-fluid movie-app'>
                            <Navbar 
                                logo={logo}
                                searchTerm={searchTerm}
                                setSearchTerm={handleSearchTermChange}
                                currentUser={currentUser}
                                favourites={favourites}
                                handleSignOut={handleSignOut}
                            />
                            <Favorites
                                favourites={favourites}
                                handleFavouritesClick={handleAddFavorite}
                                handleRemoveFavourite={handleRemoveFavorite}
                                processingMovies={processingMovies}
                            />
                        </div>
                    </>
                } />
            </Routes>
        </Router>
    );
};

export default App;

