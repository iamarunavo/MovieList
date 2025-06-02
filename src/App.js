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

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

// Add debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('API Key exists:', !!process.env.REACT_APP_TMDB_API_KEY);
console.log('Firebase config exists:', !!process.env.REACT_APP_FIREBASE_API_KEY);

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
                // Log the API URL being called (without the key)
                console.log('Fetching from:', `${TMDB_API_BASE}/trending/movie/week`);
                
                // Fetch first two pages to ensure we have enough movies
                const [page1Response, page2Response] = await Promise.all([
                    fetch(`${TMDB_API_BASE}/trending/movie/week?api_key=${API_KEY}&page=1`),
                    fetch(`${TMDB_API_BASE}/trending/movie/week?api_key=${API_KEY}&page=2`)
                ]);
                
                if (!page1Response.ok) {
                    throw new Error(`HTTP error! status: ${page1Response.status}`);
                }
                if (!page2Response.ok) {
                    throw new Error(`HTTP error! status: ${page2Response.status}`);
                }
                
                const page1Data = await page1Response.json();
                const page2Data = await page2Response.json();
                
                if (page1Data.results && page2Data.results) {
                    setMovies([...page1Data.results, ...page2Data.results]);
                } else {
                    console.error('Invalid API response structure:', { page1Data, page2Data });
                }
            } catch (error) {
                console.error('Error fetching trending movies:', error.message);
                setMovies([]); // Set empty array on error
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
                // If search is cleared, fetch trending movies again from both pages
                const [page1Response, page2Response] = await Promise.all([
                    fetch(`${TMDB_API_BASE}/trending/movie/week?api_key=${API_KEY}&page=1`),
                    fetch(`${TMDB_API_BASE}/trending/movie/week?api_key=${API_KEY}&page=2`)
                ]);
                
                const page1Data = await page1Response.json();
                const page2Data = await page2Response.json();
                
                if (page1Data.results && page2Data.results) {
                    setMovies([...page1Data.results, ...page2Data.results]);
                }
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(
                    `${TMDB_API_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm.trim())}&include_adult=false`
                );
                const data = await response.json();
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
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

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
        const fetchGenres = async () => {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
                );
                const data = await response.json();
                if (data.genres) {
                    setGenres(data.genres);
                }
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };

        fetchGenres();
    }, []);

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

