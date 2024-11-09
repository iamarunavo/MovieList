import React from 'react';

const FilterBar = ({ setFilterByGenre, setFilterByYear, setSortOrder, genres }) => {
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2000 + 1 }, (_, index) => 2000 + index);

    return (
        <div className='d-flex justify-content-between mb-4'>
            {/* Genre Filter */}
            <select onChange={(e) => setFilterByGenre(e.target.value)} className='form-select'>
                <option value=''>All Genres</option>
                {genres && Array.isArray(genres) && genres.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
            </select>

            {/* Year of Release Filter */}
            <select onChange={(e) => setFilterByYear(e.target.value)} className='form-select'>
                <option value=''>All Years</option>
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            {/* Alphabetical Sorting */}
            <select onChange={(e) => setSortOrder(e.target.value)} className='form-select'>
                <option value=''>Sort by</option>
                <option value='asc'>Alphabetical (A-Z)</option>
                <option value='desc'>Alphabetical (Z-A)</option>
            </select>
        </div>
    );
};

export default FilterBar;
