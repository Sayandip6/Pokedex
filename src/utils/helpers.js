// Pad ID with leading zeros
export const padId = (id) => String(id).padStart(4, '0')

// Get pokemon sprite URL
export const getSpriteUrl = (pokemonId, variant = 'front') => {
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
  
  const variants = {
    front: `${baseUrl}/${pokemonId}.png`,
    back: `${baseUrl}/back/${pokemonId}.png`,
    shiny: `${baseUrl}/shiny/${pokemonId}.png`,
    shinyBack: `${baseUrl}/back/shiny/${pokemonId}.png`,
    female: `${baseUrl}/female/${pokemonId}.png`,
    backFemale: `${baseUrl}/back/female/${pokemonId}.png`,
    shinyFemale: `${baseUrl}/shiny/female/${pokemonId}.png`,
  }
  
  return variants[variant] || variants.front
}

// Get pokemon cry audio URL
export const getCryUrl = (pokemonId) => 
  `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`

// Type colors for UI
export const TYPE_COLORS = {
  fire: '#FF4500',
  water: '#1E90FF',
  grass: '#3CB371',
  electric: '#EEC900',
  psychic: '#FF69B4',
  ice: '#00CED1',
  dragon: '#7B68EE',
  dark: '#4a3728',
  fairy: '#FF85C2',
  normal: '#888',
  fighting: '#C03028',
  flying: '#7090C0',
  poison: '#A040A0',
  ground: '#C8A040',
  rock: '#85742c',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#9292a3',
}

// Get type color
export const getTypeColor = (type) => TYPE_COLORS[type] || '#666'

// Extract ID from pokemon URL
export const getIdFromUrl = (url) => {
  const match = url.match(/\/(\d+)\/$/)
  return match ? parseInt(match[1]) : null
}

// Generation ranges
export const GENERATION_RANGES = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
}

// Get generation by pokemon ID
export const getGenerationById = (id) => {
  for (const [gen, [min, max]] of Object.entries(GENERATION_RANGES)) {
    if (id >= min && id <= max) return parseInt(gen)
  }
  return null
}

// Format pokemon stats
export const formatStats = (stats) => {
  return stats.map(stat => ({
    name: stat.stat.name,
    value: stat.base_stat,
  }))
}

// Format pokemon abilities
export const formatAbilities = (abilities) => {
  return abilities.map(ability => ({
    name: ability.ability.name,
    isHidden: ability.is_hidden,
  }))
}
