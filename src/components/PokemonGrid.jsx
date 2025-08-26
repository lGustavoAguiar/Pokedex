import PokemonCard from './PokemonCard';
import './PokemonGrid.css';

const PokemonGrid = ({ pokemon, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="pokemon-grid-loading">
        <div className="loading-spinner"></div>
        <p>Carregando Pokémons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-grid-error">
        <p>❌ Erro ao carregar Pokémons: {error}</p>
      </div>
    );
  }

  if (!pokemon || pokemon.length === 0) {
    return (
      <div className="pokemon-grid-empty">
        <p>🔍 Nenhum Pokémon encontrado</p>
        <p className="empty-subtitle">Tente buscar por outro nome ou ID</p>
      </div>
    );
  }

  return (
    <div className="pokemon-grid">
      {pokemon.map((poke, index) => (
        <PokemonCard 
          key={poke.id} 
          pokemon={poke} 
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default PokemonGrid;
