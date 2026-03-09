import React from 'react'
import PokemonCard from './PokemonCard'
import './PokemonGrid.css'

function SkeletonCard() {
  return <div className="pokemon-card skeleton" />
}

function PokemonGrid({ pokemonList, onCardClick, isLoading, groupByGeneration = false }) {
  if (pokemonList.length === 0 && !isLoading) {
    return (
      <div className="empty-state">
        <h3>No Pokémon Found</h3>
        <p>Try adjusting your search filters</p>
      </div>
    )
  }

  if (pokemonList.length === 0 && isLoading) {
    return null // Loading spinner is shown in App.jsx
  }

  if (groupByGeneration) {
    const groupedByGen = {}
    pokemonList.forEach(p => {
      const gen = Math.ceil(p.id / 151)
      if (!groupedByGen[gen]) groupedByGen[gen] = []
      groupedByGen[gen].push(p)
    })

    return (
      <>
        {Object.entries(groupedByGen).map(([gen, pokemon]) => (
          <div key={gen} className="generation-section">
            <h2 className="generation-header">
              <span className="gen-label">G{gen}</span>
              Generation {gen}
            </h2>
            <div className="pokemon-grid">
              {pokemon.map(p => (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  onClick={onCardClick}
                />
              ))}
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="pokemon-grid">
      {pokemonList.map(p => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          onClick={onCardClick}
        />
      ))}
    </div>
  )
}

export default PokemonGrid
