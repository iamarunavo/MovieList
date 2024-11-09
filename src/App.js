import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import MovieList from './components/MovieList';
import MovieListHeading from './components/MovieListHeading';
import SearchBox from './components/SearchBox';
import AddFavourites from './components/AddFavourites';
import RemoveFavourites from './components/RemoveFavourites';
import FilterBar from './components/FilterBar'; 
import MovieDetails from './components/MovieDetails'; 
const apiKey = 'b3c383343eb4caebcd343c251b05b668';
const App = () => {
    const [movies, setMovies] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [filterByGenre, setFilterByGenre] = useState('');
    const [filterByYear, setFilterByYear] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [genres, setGenres] = useState([]); 

    const getMovieRequest = async (searchValue) => {
      const apiKey = 'b3c383343eb4caebcd343c251b05b668'; 
      let url;
  
      if (searchValue) {
          url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchValue}`;
      } else {
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`;
      }
  
      
      try {
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const responseJson = await response.json();
          if (responseJson.results) {
              setMovies(responseJson.results);
          }
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };
  useEffect(() => {
    const fetchGenres = async () => {
        const apiKey = 'b3c383343eb4caebcd343c251b05b668';
        try {
            const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
            const data = await response.json();
            if (data.genres) {
                setGenres(data.genres); 
            } else {
                setGenres([]); 
            }
        } catch (error) {
            console.error('Error fetching genres:', error);
            setGenres([]); 
    };

    fetchGenres();
}, []);
    useEffect(() => {
        getMovieRequest(searchValue);
    }, [searchValue]);

    useEffect(() => {
        const movieFavourites = JSON.parse(localStorage.getItem('react-movie-app-favourites'));
        if (movieFavourites) {
            setFavourites(movieFavourites);
        }
    }, []);

    const saveToLocalStorage = (items) => {
        localStorage.setItem('react-movie-app-favourites', JSON.stringify(items));
    };

    const addFavouriteMovie = (movie) => {
        const newFavouriteList = [...favourites, movie];
        setFavourites(newFavouriteList);
        saveToLocalStorage(newFavouriteList);
    };

    const removeFavouriteMovie = (movie) => {
      
      const newFavouriteList = favourites.filter(
        (favourite) => favourite.id !== movie.id 
    );
  

      setFavourites(newFavouriteList);
      saveToLocalStorage(newFavouriteList);
  };
  

    const filteredMovies = movies
    .filter(movie => {
 
        if (filterByGenre && movie.genre_ids) {
            return movie.genre_ids.includes(parseInt(filterByGenre, 10)); 
        }
        return true; 
    })
    .filter(movie => {
   
        if (filterByYear && movie.release_date) {
            return movie.release_date.startsWith(filterByYear); 
        }
        return true; 
    })
    .sort((a, b) => {
        // Sorting by title
        if (sortOrder === 'asc') {
            return a.title.localeCompare(b.title);
        } else if (sortOrder === 'desc') {
            return b.title.localeCompare(a.title); 
        }
        return 0; 
    });





    return (
        <Router>
            <div className='container-fluid movie-app'>
                <Routes> {}
                    {}
                    <Route
                        path='/'
                        element={
                            <>
                                <div className='row d-flex align-items-center mt-4 mb-4'>
                                    <MovieListHeading heading='Movies' />
                                    <SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
                                </div>
                                <FilterBar
                                 setFilterByGenre={setFilterByGenre}
                                 setFilterByYear={setFilterByYear}
                                 setSortOrder={setSortOrder}
                                 genres={genres} 
                                />
                                <div className='row'>
                                    <MovieList
                                        movies={filteredMovies} 
                                        handleFavouritesClick={addFavouriteMovie}
                                        favouriteComponent={AddFavourites}
                                    />
                                </div>

                                <div className='row d-flex align-items-center mt-4 mb-4'>
                                    <MovieListHeading heading='Favourites' />
                                </div>
                                <div className='row'>
                                    <MovieList
                                        movies={favourites}
                                        handleFavouritesClick={removeFavouriteMovie}
                                        favouriteComponent={RemoveFavourites}
                                    />
                                </div>
                            </>
                        }
                    />
                    
                    {}
                    <Route path='/movie/:id' element={<MovieDetails />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;

