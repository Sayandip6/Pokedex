import axios from 'axios'

const API_BASE_URL = 'https://pokeapi.co/api/v2'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Pokémon endpoints
export const pokemonAPI = {
  // Fetch all pokemon with pagination
  getAllPokemon: (limit = 1025, offset = 0) => 
    api.get(`/pokemon?limit=${limit}&offset=${offset}`),

  // Fetch specific pokemon by ID or name
  getPokemonByIdOrName: (idOrName) => 
    api.get(`/pokemon/${idOrName}`),

  // Fetch pokemon species info
  getPokemonSpecies: (id) => 
    api.get(`/pokemon-species/${id}`),

  // Fetch pokemon by type
  getPokemonByType: (typeName) => 
    api.get(`/type/${typeName}`),

  // Fetch all types
  getAllTypes: () => 
    api.get(`/type`),

  // Fetch abilities
  getAbilityByName: (abilityName) => 
    api.get(`/ability/${abilityName}`),

  // Fetch all abilities
  getAllAbilities: (limit = 300, offset = 0) => 
    api.get(`/ability?limit=${limit}&offset=${offset}`),

  // Fetch habitats
  getHabitatByName: (habitatName) => 
    api.get(`/pokemon-habitat/${habitatName}`),

  // Fetch all habitats
  getAllHabitats: () => 
    api.get(`/pokemon-habitat`),

  // Fetch gender info
  getGenderByName: (genderName) => 
    api.get(`/gender/${genderName}`),

  // Fetch all genders
  getAllGenders: () => 
    api.get(`/gender`),

  // Fetch region info
  getRegionByName: (regionName) => 
    api.get(`/region/${regionName}`),

  // Fetch all regions
  getAllRegions: () => 
    api.get(`/region`),

  // Fetch generation info
  getGenerationByNum: (genNum) => 
    api.get(`/generation/${genNum}`),

  // Fetch all generations
  getAllGenerations: () => 
    api.get(`/generation`),
}

export default pokemonAPI
