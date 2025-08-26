class PokemonService {
    static async listPokemons(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Failed to fetch pokemons');
        const data = await response.json();
        return data;
    }

    static async getPokemon(param) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${param}`);
        if (!response.ok) throw new Error('Failed to fetch pokemon');
        const data = await response.json();
        return data;
    }

    static async getPokemonsByElement(element, page = 1, limit = 20) {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${element}`);
        if (!response.ok) throw new Error('Failed to fetch pokemons by type');
        const typeData = await response.json();
        
        const allPokemons = typeData.pokemon.map(p => p.pokemon);
        const offset = (page - 1) * limit;
        const paginatedPokemons = allPokemons.slice(offset, offset + limit);

        const detailedPokemons = await Promise.all(
            paginatedPokemons.map(async (poke) => {
                const pokeResponse = await fetch(poke.url);
                if (!pokeResponse.ok) throw new Error(`Failed to fetch ${poke.name}`);
                const pokeDetails = await pokeResponse.json();
                return pokeDetails;
            })
        );

        return {
            page,
            total: allPokemons.length,
            pokemons: detailedPokemons
        };
    }

    static async getPokemonTypes() {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        if (!response.ok) throw new Error('Failed to fetch types');
        const data = await response.json();
        return data.results
            .map(type => type.name)
            .filter(type => !['unknown', 'shadow'].includes(type))
            .sort();
    }
}

export default PokemonService;