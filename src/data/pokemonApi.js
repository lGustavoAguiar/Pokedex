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
    const pokemonData = await PokemonService.getPokemon(searchQuery);
    const formattedPokemon = formatPokemonData(pokemonData);
    
    return {
      pokemon: [formattedPokemon],
      totalPages: 1,
      currentPage: 1,
      totalCount: 1
    };
  } catch (error) {

    return {
      pokemon: [],
      totalPages: 0,
      currentPage: 1,
      totalCount: 0
    };
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