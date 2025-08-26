import { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, value = '', placeholder = "Buscar Pokémon por nome ou ID..." }) => {
  const [searchValue, setSearchValue] = useState(value);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue.trim());
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="search-button"
          aria-label="Buscar"
        >
          🔍
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
