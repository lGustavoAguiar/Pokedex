import PokemonService from './pokemonService.js';

const POKEMON_PER_PAGE = 20;

const formatPokemonData = (pokemonData) => {
  return {
    id: pokemonData.id,
    name: pokemonData.name,
    types: pokemonData.types.map(type => type.type.name),
    image: pokemonData.sprites.other['official-artwork']?.front_default || 
           pokemonData.sprites.front_default ||
           `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`
  };
};

export const getPokemonByPage = async (page = 1) => {
  try {
    const data = await PokemonService.listPokemons(page, POKEMON_PER_PAGE);

    const pokemonPromises = data.results.map(async (pokemon) => {
      const pokemonData = await PokemonService.getPokemon(pokemon.name);
      return pokemonData;
    });
    
    const pokemonDetails = await Promise.all(pokemonPromises);
    const formattedPokemon = pokemonDetails.map(formatPokemonData);

    const totalPokemon = data.count || 1302;
    const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);
    
    return {
      pokemon: formattedPokemon,
      totalPages,
      currentPage: page,
      totalCount: totalPokemon
    };
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    throw error;
  }
};

export const searchPokemon = async (query, page = 1) => {
  if (!query || query.trim() === '') {
    return getPokemonByPage(page);
  }
  
  const searchQuery = query.trim().toLowerCase();
  
  try {
    // Primeiro, tenta buscar o Pokémon exato
    const pokemonData = await PokemonService.getPokemon(searchQuery);
    const formattedPokemon = formatPokemonData(pokemonData);
    
    return {
      pokemon: [formattedPokemon],
      totalPages: 1,
      currentPage: 1,
      totalCount: 1
    };
  } catch (error) {
    // Se não encontrar exato, busca por Pokémons que começam com o termo
    try {
      if (!pokemonSuggestionsCache) {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        pokemonSuggestionsCache = data.results.map((pokemon, index) => ({
          id: index + 1,
          name: pokemon.name,
          url: pokemon.url
        }));
      }

      // Filtrar pokémons que começam com o termo de busca
      const matchingPokemons = pokemonSuggestionsCache
        .filter(pokemon => 
          pokemon.name.toLowerCase().startsWith(searchQuery) ||
          pokemon.id.toString().includes(searchQuery)
        )
        .slice((page - 1) * POKEMON_PER_PAGE, page * POKEMON_PER_PAGE);

      if (matchingPokemons.length === 0) {
        return {
          pokemon: [],
          totalPages: 0,
          currentPage: 1,
          totalCount: 0
        };
      }

      // Buscar detalhes completos dos pokémons encontrados
      const pokemonPromises = matchingPokemons.map(async (pokemon) => {
        const pokemonData = await PokemonService.getPokemon(pokemon.name);
        return pokemonData;
      });
      
      const pokemonDetails = await Promise.all(pokemonPromises);
      const formattedPokemon = pokemonDetails.map(formatPokemonData);

      // Calcular total de resultados para paginação
      const totalMatching = pokemonSuggestionsCache.filter(pokemon => 
        pokemon.name.toLowerCase().startsWith(searchQuery) ||
        pokemon.id.toString().includes(searchQuery)
      ).length;

      const totalPages = Math.ceil(totalMatching / POKEMON_PER_PAGE);

      return {
        pokemon: formattedPokemon,
        totalPages,
        currentPage: page,
        totalCount: totalMatching
      };
    } catch (searchError) {
      console.error('Error in fallback search:', searchError);
      return {
        pokemon: [],
        totalPages: 0,
        currentPage: 1,
        totalCount: 0
      };
    }
  }
};

export const getPokemonByType = async (type, page = 1) => {
  if (!type || type.trim() === '') {
    return getPokemonByPage(page);
  }
  
  try {
    const data = await PokemonService.getPokemonsByElement(type.toLowerCase(), page, POKEMON_PER_PAGE);
    const formattedPokemon = data.pokemons.map(formatPokemonData);
    
    const totalPages = Math.ceil(data.total / POKEMON_PER_PAGE);
    
    return {
      pokemon: formattedPokemon,
      totalPages,
      currentPage: page,
      totalCount: data.total
    };
  } catch (error) {
    console.error('Error fetching Pokemon by type:', error);
    throw error;
  }
};

export const getPokemonTypes = async () => {
  try {
    const types = await PokemonService.getPokemonTypes();
    
    return {
      types,
      totalCount: types.length
    };
  } catch (error) {
    console.error('Error fetching Pokemon types:', error);
    throw error;
  }
};

// Cache para sugestões de Pokémon
let pokemonSuggestionsCache = null;

export const getPokemonSuggestions = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchQuery = query.trim().toLowerCase();
  
  try {
    // Se não temos cache, buscar lista básica de pokémons
    if (!pokemonSuggestionsCache) {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await response.json();
      pokemonSuggestionsCache = data.results.map((pokemon, index) => ({
        id: index + 1,
        name: pokemon.name,
        url: pokemon.url
      }));
    }

    // Filtrar pokémons que correspondem à busca
    const filteredPokemons = pokemonSuggestionsCache
      .filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchQuery) ||
        pokemon.id.toString().includes(searchQuery)
      )
      .slice(0, 8); // Limitar a 8 sugestões

    return filteredPokemons.map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name,
      displayName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
    }));
  } catch (error) {
    console.error('Error fetching Pokemon suggestions:', error);
    return [];
  }
};

export const getPokemonDetails = async (pokemonId) => {
  try {
    const pokemonData = await PokemonService.getPokemon(pokemonId);
    const speciesData = await PokemonService.getPokemonSpecies(pokemonData.species.url);
    
    return {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height,
      weight: pokemonData.weight,
      types: pokemonData.types.map(type => type.type.name),
      abilities: pokemonData.abilities.map(ability => ({
        name: ability.ability.name,
        isHidden: ability.is_hidden
      })),
      stats: pokemonData.stats.map(stat => ({
        name: stat.stat.name,
        baseStat: stat.base_stat,
        effort: stat.effort
      })),
      image: pokemonData.sprites.other['official-artwork']?.front_default || 
             pokemonData.sprites.front_default ||
             `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`,
      sprites: {
        front_default: pokemonData.sprites.front_default,
        front_shiny: pokemonData.sprites.front_shiny,
        back_default: pokemonData.sprites.back_default,
        back_shiny: pokemonData.sprites.back_shiny,
        official_artwork: pokemonData.sprites.other['official-artwork']?.front_default
      },
      description: speciesData.flavor_text_entries
        .find(entry => entry.language.name === 'en')?.flavor_text
        .replace(/\f/g, ' ') || 'Descrição não disponível',
      genus: speciesData.genera
        .find(genus => genus.language.name === 'en')?.genus || 'Pokémon',
      baseExperience: pokemonData.base_experience,
      captureRate: speciesData.capture_rate,
      growthRate: speciesData.growth_rate.name,
      habitat: speciesData.habitat?.name || 'Desconhecido',
      generation: speciesData.generation.name
    };
  } catch (error) {
    console.error('Error fetching Pokemon details:', error);
    throw error;
  }
};