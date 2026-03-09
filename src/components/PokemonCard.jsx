import React from 'react'
import { padId, getSpriteUrl, getTypeColor } from '../utils/helpers'
import './PokemonCard.css'

function TypeBadge({ type }) {
  return (
    <span 
      className="type-badge" 
      style={{ backgroundColor: getTypeColor(type) }}
      title={type}
    >
      {type}
    </span>
  )
}

function PokemonCard({ pokemon, onClick }) {
  const primaryType = pokemon.types?.[0]?.type?.name || 'normal'
  const typeColor = getTypeColor(primaryType)

  return (
    <div 
      className="pokemon-card"
      style={{ '--accent-color': typeColor }}
      onClick={() => onClick(pokemon)}
    >
      <div className="card-id">#{padId(pokemon.id)}</div>
      <img 
        className="card-image"
        src={getSpriteUrl(pokemon.id, 'front')}
        alt={pokemon.name}
        loading="lazy"
      />
      <h3 className="card-name">{pokemon.name}</h3>
      <div className="card-types">
        {pokemon.types?.map(t => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </div>
    </div>
  )
}

export default PokemonCard
