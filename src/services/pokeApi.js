import axios from 'axios'

const API_BASE_URL = 'https://pokeapi.co/api/v2'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})


export const pokemonAPI = {
  
  getAllPokemon: (limit = 1025, offset = 0) => 
    api.get(`/pokemon?limit=${limit}&offset=${offset}`),

  
  getPokemonByIdOrName: (idOrName) => 
    api.get(`/pokemon/${idOrName}`),

  
  getPokemonSpecies: (id) => 
    api.get(`/pokemon-species/${id}`),

 
  getPokemonByType: (typeName) => 
    api.get(`/type/${typeName}`),

 
  getAllTypes: () => 
    api.get(`/type`),

  
  getAbilityByName: (abilityName) => 
    api.get(`/ability/${abilityName}`),

  
  getAllAbilities: (limit = 300, offset = 0) => 
    api.get(`/ability?limit=${limit}&offset=${offset}`),

  
  getHabitatByName: (habitatName) => 
    api.get(`/pokemon-habitat/${habitatName}`),

  
  getAllHabitats: () => 
    api.get(`/pokemon-habitat`),

 
  getGenderByName: (genderName) => 
    api.get(`/gender/${genderName}`),

 
  getAllGenders: () => 
    api.get(`/gender`),


  getRegionByName: (regionName) => 
    api.get(`/region/${regionName}`),

 
  getAllRegions: () => 
    api.get(`/region`),

 
  getGenerationByNum: (genNum) => 
    api.get(`/generation/${genNum}`),


  getAllGenerations: () => 
    api.get(`/generation`),
}

export default pokemonAPI
