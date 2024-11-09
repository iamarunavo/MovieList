import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MovieDetails.css'; 

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [actors, setActors] = useState([]);

    useEffect(() => {
        const apiKey = 'b3c383343eb4caebcd343c251b05b668'; 

        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
                const data = await response.json();
                setMovie(data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        const fetchMovieCredits = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`);
                const data = await response.json();
                if (data && data.cast) {
                    setActors(data.cast.slice(0, 10));
                }
            } catch (error) {
                console.error('Error fetching movie credits:', error);
            }
        };

        fetchMovieDetails();
        fetchMovieCredits();
    }, [id]);

    if (!movie) {
        return <div className="movie-details">Loading...</div>;
    }

    return (
        <div className="movie-details-container">
            <div className="movie-main-details">
                <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                />
                <div className="movie-info">
                    <h2>{movie.title}</h2>
                    <p className="release-date">Release Date: {movie.release_date}</p>
                    <div className="genres">
                        {movie.genres.map(genre => genre.name).join(', ')}
                    </div>
                    <p>Overview: {movie.overview}</p>
                </div>
            </div>

            <div className="actors-section">
                <h3>Top Cast</h3>
                <div className="actors-grid">
                    {actors.map(actor => (
                        <div key={actor.id} className="actor-card">
                            <img
                                src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
                                alt={actor.name}
                                className="actor-image"
                            />
                            <p>{actor.name}</p>
                            <p className="character-name">as {actor.character}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
