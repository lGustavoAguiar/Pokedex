import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import PokemonGrid from '../components/PokemonGrid'
import Pagination from '../components/Pagination'
import TypeFilterBar from '../components/TypeFilterBar';
import { getPokemonByPage, searchPokemon, getPokemonByType } from '../data/pokemonApi'

const HomePage = () => {
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('');

  const loadPokemon = async (page = 1, query = '', type = '') => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (type) {
        result = await getPokemonByType(type, page);
      } else if (query) {
        result = await searchPokemon(query, page);
      } else {
        result = await getPokemonByPage(page);
      }
      setPokemon(result.pokemon);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setCurrentPage(result.currentPage);
    } catch (err) {
      setError('Erro ao carregar os Pokémons. Verifique sua conexão com a internet.')
      setPokemon([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPokemon(1, searchQuery, selectedType)
  }, [searchQuery, selectedType])

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)

    if (query) {
      setSelectedType('');
      loadPokemon(1, query, '');
    } else {
      loadPokemon(1, query, selectedType);
    }
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
 
    if (type) {
      setSearchQuery('');
      loadPokemon(1, '', type);
    } else {
      loadPokemon(1, searchQuery, type);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadPokemon(page, searchQuery, selectedType)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuizNavigation = () => {
    navigate('/quiz')
  }

  return (
    <main className="app-main">
      <SearchBar onSearch={handleSearch} value={searchQuery} />
      
      <div className="quiz-button-container">
        <button 
          className="quiz-button" 
          onClick={handleQuizNavigation}
        >
          🎯 Quiz Pokémon - Quem é esse Pokémon?
        </button>
      </div>

      <TypeFilterBar onTypeSelect={handleTypeSelect} selectedType={selectedType} />
      
      <div className="results-info">
        {searchQuery ? (
          <p>
            Resultados para "<strong>{searchQuery}</strong>": {totalCount} Pokémon(s) encontrado(s)
          </p>
        ) : selectedType ? (
          <p>
            Tipo "<strong>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</strong>": {totalCount} Pokémon(s) • Página {currentPage} de {totalPages}
          </p>
        ) : (
          <p>
            Mostrando 1302 pokémons • Página {currentPage} de {totalPages}
          </p>
        )}
      </div>

      <PokemonGrid 
        pokemon={pokemon} 
        loading={loading} 
        error={error} 
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </main>
  )
}

export default HomePage
