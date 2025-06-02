import React from 'react';
import { Navigate } from 'react-router-dom';
import MovieList from '../components/MovieList';
import { useAuth } from '../contexts/AuthContext';

const Favorites = ({ favourites, handleFavouritesClick, handleRemoveFavourite, processingMovies }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <div className="auth-required-container">
                <div className="auth-required-content">
                    <h2>Authentication Required</h2>
                    <p>Please sign in to view your favorites.</p>
                    <Navigate to="/login" replace />
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <div className="favorites-header">
                <span className="logo-text">My <span>Favorites</span>{favourites.length > 0 && <span className="count-inline"> ({favourites.length})</span>}</span>
            </div>
            
            {favourites.length === 0 ? (
                <div className="no-favorites-message">
                    <p>You haven't added any favorites yet.</p>
                    <p className="suggestion">Browse movies and click the heart icon to add them to your favorites!</p>
                </div>
            ) : (
                <MovieList
                    movies={favourites}
                    handleFavouritesClick={handleFavouritesClick}
                    handleRemoveFavourite={handleRemoveFavourite}
                    favourites={favourites}
                    user={currentUser}
                    processingMovies={processingMovies}
                />
            )}
        </div>
    );
};

export default Favorites; 