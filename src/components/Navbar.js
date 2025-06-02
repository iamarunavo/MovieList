import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';

const Navbar = memo(({ 
    logo, 
    searchTerm, 
    setSearchTerm, 
    currentUser, 
    favourites, 
    handleSignOut 
}) => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-left">
                    <div className="brand-group">
                        <Link to="/" className="logo-container">
                            <img src={logo} alt="LaxMovies Logo" className="logo-image" />
                        </Link>
                        <Link to="/" className="brand-title">
                            <span className="logo-text">Lax<span>Movies</span></span>
                        </Link>
                    </div>
                    <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
                <div className="auth-section">
                    {currentUser ? (
                        <div className="user-section">
                            <Link to="/favorites" className="favorites-link">
                                My Favorites
                                {favourites.length > 0 && (
                                    <span className="favorites-count">{favourites.length}</span>
                                )}
                            </Link>
                            <span className="user-name">{currentUser.displayName || currentUser.email}</span>
                            <button 
                                onClick={handleSignOut}
                                className="btn btn-outline-danger"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline-primary">Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
});

Navbar.displayName = 'Navbar';

export default Navbar; 