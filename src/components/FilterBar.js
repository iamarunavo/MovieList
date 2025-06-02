import React, { useCallback } from 'react';

const FilterBar = ({ sortBy, setSortBy, filterByRating, setFilterByRating, filterByGenre, setFilterByGenre, filterByYear, setFilterByYear, genres }) => {
    // Generate an array of years from 1990 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

    const handleSortChange = useCallback((e) => {
        setSortBy(e.target.value);
    }, [setSortBy]);

    const handleRatingChange = useCallback((e) => {
        setFilterByRating(e.target.value);
    }, [setFilterByRating]);

    const handleGenreChange = useCallback((e) => {
        setFilterByGenre(e.target.value);
    }, [setFilterByGenre]);

    const handleYearChange = useCallback((e) => {
        setFilterByYear(e.target.value);
    }, [setFilterByYear]);

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <label htmlFor="sort">Sort By</label>
                <div className="select-wrapper">
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="filter-select"
                    >
                        <option value="popularity">Popularity</option>
                        <option value="rating">Rating</option>
                        <option value="title">Title (A-Z)</option>
                        <option value="release">Release Date</option>
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label htmlFor="genre">Genre</label>
                <div className="select-wrapper">
                    <select
                        id="genre"
                        value={filterByGenre}
                        onChange={handleGenreChange}
                        className="filter-select"
                    >
                        <option value="">All Genres</option>
                        {genres.map(genre => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label htmlFor="year">Year</label>
                <div className="select-wrapper">
                    <select
                        id="year"
                        value={filterByYear}
                        onChange={handleYearChange}
                        className="filter-select"
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label htmlFor="rating">Rating</label>
                <div className="select-wrapper">
                    <select
                        id="rating"
                        value={filterByRating}
                        onChange={handleRatingChange}
                        className="filter-select"
                    >
                        <option value="0">All Ratings</option>
                        <option value="7">7+ Stars</option>
                        <option value="8">8+ Stars</option>
                        <option value="9">9+ Stars</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilterBar);
