import { useState, useEffect, useRef } from 'react';
import { getPokemonSuggestions } from '../data/pokemonApi';
import './SearchBar.css';

const SearchBar = ({ onSearch, value = '', placeholder = "Buscar Pokémon por nome ou ID..." }) => {
  const [searchValue, setSearchValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Debounce para buscar sugestões
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchValue && searchValue.trim().length >= 2) {
        setIsLoading(true);
        try {
          const pokemonSuggestions = await getPokemonSuggestions(searchValue);
          setSuggestions(pokemonSuggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Erro ao buscar sugestões:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSearchValue = selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex] 
      ? suggestions[selectedSuggestionIndex].name 
      : searchValue.trim();
    
    onSearch(finalSearchValue);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          const selectedPokemon = suggestions[selectedSuggestionIndex];
          setSearchValue(selectedPokemon.name);
          onSearch(selectedPokemon.name);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion.name);
    onSearch(suggestion.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleClear = () => {
    setSearchValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            aria-label="Limpar busca"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="search-button"
          aria-label="Buscar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>

        {/* Dropdown de sugestões */}
        {showSuggestions && (
          <div className="suggestions-dropdown" ref={suggestionsRef}>
            {isLoading ? (
              <div className="suggestion-item loading">
                <div className="suggestion-loading-spinner"></div>
                <span>Buscando...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <img 
                    src={suggestion.image} 
                    alt={suggestion.displayName}
                    className="suggestion-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="suggestion-info">
                    <span className="suggestion-name">{suggestion.displayName}</span>
                    <span className="suggestion-id">#{suggestion.id.toString().padStart(3, '0')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="suggestion-item no-results">
                <span>Nenhum Pokémon encontrado</span>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
