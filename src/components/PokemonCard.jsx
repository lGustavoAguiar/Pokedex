import './PokemonCard.css';

const PokemonCard = ({ pokemon, animationDelay = 0 }) => {
  const getTypeColor = (type) => {
    const typeColors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return typeColors[type.toLowerCase()] || '#68A090';
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div 
      className="pokemon-card" 
      style={{ 
        animationDelay: `${animationDelay}s`,
        animation: 'cardSlideIn 0.6s ease-out forwards'
      }}
    >
      <div className="pokemon-image">
        <img 
          src={pokemon.image} 
          alt={pokemon.name}
          onError={(e) => {
            e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
          }}
        />
      </div>
      <div className="pokemon-info">
        <h3 className="pokemon-name">{capitalizeFirst(pokemon.name)}</h3>
        <p className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</p>
        <div className="pokemon-types">
          {pokemon.types.map((type, index) => (
            <span 
              key={index} 
              className="pokemon-type"
              style={{ backgroundColor: getTypeColor(type) }}
            >
              {capitalizeFirst(type)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
