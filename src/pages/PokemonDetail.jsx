import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPokemonDetails } from '../data/pokemonApi';
import './PokemonDetail.css';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPokemonDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await getPokemonDetails(id);
        setPokemon(details);
      } catch (err) {
        setError('Erro ao carregar detalhes do Pokémon');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPokemonDetails();
    }
  }, [id]);

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

  const formatStatName = (statName) => {
    const statNames = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'At. Especial',
      'special-defense': 'Def. Especial',
      'speed': 'Velocidade'
    };
    return statNames[statName] || capitalizeFirst(statName);
  };

  if (loading) {
    return (
      <div className="pokemon-detail-container">
        <div className="loading-detail">
          <div className="pokeball-loading">
            <div className="pokeball-spinner"></div>
          </div>
          <p>Carregando detalhes do Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-detail-container">
        <div className="error-detail">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="pokemon-detail-container">
        <div className="error-detail">
          <p>Pokémon não encontrado</p>
          <button onClick={() => navigate('/')} className="back-button">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-detail-container">
      <button onClick={() => navigate('/')} className="back-button">
        ← Voltar
      </button>

      <div className="pokemon-detail-card">
        <div className="pokemon-header">
          <div className="pokemon-image-container">
            <img 
              src={pokemon.image} 
              alt={pokemon.name}
              className="pokemon-detail-image"
            />
          </div>
          <div className="pokemon-basic-info">
            <h1 className="pokemon-detail-name">
              {capitalizeFirst(pokemon.name)}
            </h1>
            <p className="pokemon-detail-id">
              #{String(pokemon.id).padStart(3, '0')}
            </p>
            <p className="pokemon-genus">{pokemon.genus}</p>
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

        <div className="pokemon-description">
          <h3>Descrição</h3>
          <p>{pokemon.description}</p>
        </div>

        <div className="pokemon-info-grid">
          <div className="pokemon-physical-info">
            <h3>Informações Físicas</h3>
            <div className="info-item">
              <span className="info-label">Altura:</span>
              <span className="info-value">{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div className="info-item">
              <span className="info-label">Peso:</span>
              <span className="info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
            <div className="info-item">
              <span className="info-label">Experiência Base:</span>
              <span className="info-value">{pokemon.baseExperience}</span>
            </div>
          </div>

          <div className="pokemon-abilities">
            <h3>Habilidades</h3>
            {pokemon.abilities.map((ability, index) => (
              <div key={index} className="ability-item">
                <span className="ability-name">
                  {capitalizeFirst(ability.name.replace('-', ' '))}
                </span>
                {ability.isHidden && (
                  <span className="hidden-ability">(Oculta)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pokemon-stats">
          <h3>Estatísticas Base</h3>
          <div className="stats-container">
            {pokemon.stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-info">
                  <span className="stat-name">
                    {formatStatName(stat.name)}
                  </span>
                  <span className="stat-value">{stat.baseStat}</span>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ 
                      width: `${(stat.baseStat / 255) * 100}%`,
                      backgroundColor: stat.baseStat > 100 ? '#4CAF50' : 
                                     stat.baseStat > 70 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pokemon-sprites">
          <h3>Sprites</h3>
          <div className="sprites-container">
            {pokemon.sprites.front_default && (
              <div className="sprite-item">
                <img src={pokemon.sprites.front_default} alt="Frente normal" />
                <span>Normal</span>
              </div>
            )}
            {pokemon.sprites.front_shiny && (
              <div className="sprite-item">
                <img src={pokemon.sprites.front_shiny} alt="Frente shiny" />
                <span>Shiny</span>
              </div>
            )}
            {pokemon.sprites.back_default && (
              <div className="sprite-item">
                <img src={pokemon.sprites.back_default} alt="Costas normal" />
                <span>Costas</span>
              </div>
            )}
            {pokemon.sprites.back_shiny && (
              <div className="sprite-item">
                <img src={pokemon.sprites.back_shiny} alt="Costas shiny" />
                <span>Costas Shiny</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
