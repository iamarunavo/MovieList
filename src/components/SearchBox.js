import React, { useCallback, useRef, memo } from 'react';

const SearchBox = memo(({ searchTerm, setSearchTerm }) => {
	const inputRef = useRef(null);

	const handleChange = useCallback((e) => {
		const value = e.target.value;
		requestAnimationFrame(() => {
			setSearchTerm(value);
		});
	}, [setSearchTerm]);

	const handleClear = useCallback((e) => {
		e.preventDefault();
		setSearchTerm('');
		inputRef.current?.focus();
	}, [setSearchTerm]);

	return (
		<div className='search-box'>
			<svg className='search-icon' width='20' height='20' viewBox='0 0 20 20'>
				<path
					fill='currentColor'
					fillRule='evenodd'
					d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
					clipRule='evenodd'
				/>
			</svg>
			<input
				ref={inputRef}
				type='text'
				className='search-input'
				placeholder='Search movies...'
				value={searchTerm}
				onChange={handleChange}
				aria-label="Search movies"
			/>
			{searchTerm && (
				<button
					className='search-clear'
					onClick={handleClear}
					aria-label='Clear search'
					type="button"
				>
					×
				</button>
			)}
		</div>
	);
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;