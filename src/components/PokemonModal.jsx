import React, { useState, useEffect } from 'react'
import { padId, getSpriteUrl, getCryUrl, formatStats, formatAbilities, getGenerationById } from '../utils/helpers'
import pokemonAPI from '../services/pokeApi'
import AudioPlayer from './AudioPlayer'
import './PokemonModal.css'

function SpriteBox({ src, label }) {
  const [loaded, setLoaded] = useState(true)
  if (!src || !loaded) return null
  
  return (
    <div className="sprite-box">
      <img 
        src={src} 
        alt={label}
        onError={() => setLoaded(false)}
      />
      <span>{label}</span>
    </div>
  )
}

function StatRow({ name, value }) {
  const percentage = Math.min(100, Math.round((value / 255) * 100))
  const color = value >= 100 ? '#3CB371' : value >= 60 ? '#EEC900' : '#e63946'
  
  return (
    <div className="stat-row">
      <span className="stat-name">{name.replace('special-', 'sp.')}</span>
      <div className="stat-bar">
        <div 
          className="stat-fill"
          style={{ width: percentage + '%', backgroundColor: color }}
        />
      </div>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function PokemonModal({ pokemon, onClose, onPrevious, onNext, hasPrevious, hasNext }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setDetail(null)
    setLoading(true)
    
    const fetchDetail = async () => {
      try {
        const response = await pokemonAPI.getPokemonByIdOrName(pokemon.id)
        setDetail(response.data)
      } catch (error) {
        console.error('Error fetching pokemon detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [pokemon.id])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && hasNext) onNext()
      if (e.key === 'ArrowLeft' && hasPrevious) onPrevious()
      if (e.key === 'Escape') onClose()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasNext, hasPrevious, onNext, onPrevious, onClose])

  const generation = getGenerationById(pokemon.id)
  const sprites = {
    front: getSpriteUrl(pokemon.id, 'front'),
    back: getSpriteUrl(pokemon.id, 'back'),
    shiny: getSpriteUrl(pokemon.id, 'shiny'),
    shinyBack: getSpriteUrl(pokemon.id, 'shinyBack'),
    female: getSpriteUrl(pokemon.id, 'female'),
    backFemale: getSpriteUrl(pokemon.id, 'backFemale'),
    shinyFemale: getSpriteUrl(pokemon.id, 'shinyFemale'),
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-id">#{padId(pokemon.id)}</div>
            <h2 className="modal-title">{pokemon.name}</h2>
            <div className="modal-types">
              {pokemon.types?.map(t => (
                <span 
                  key={t.type.name}
                  className="type-badge"
                  style={{ backgroundColor: '#e63946' }}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>
          <div className="modal-nav">
            <button 
              className="nav-btn"
              disabled={!hasPrevious}
              onClick={onPrevious}
            >
              ← Previous
            </button>
            <button 
              className="nav-btn"
              disabled={!hasNext}
              onClick={onNext}
            >
              Next →
            </button>
            <button className="close-btn" onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Main Front Sprite */}
          <div className="main-sprite-section">
            <img
              className="main-sprite"
              src={sprites.front}
              alt={pokemon.name}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>

          {/* Cry Audio Player */}
          <div className="section">
            <h3 className="section-title">Pokémon Cry</h3>
            <AudioPlayer src={getCryUrl(pokemon.id)} pokemonName={pokemon.name} />
          </div>

          {/* Other Sprites */}
          <div className="section">
            <h3 className="section-title">Other Sprites</h3>
            <div className="sprites-grid">
              <SpriteBox src={sprites.back} label="Back" />
              <SpriteBox src={sprites.shiny} label="Shiny" />
              <SpriteBox src={sprites.shinyBack} label="Shiny Back" />
              <SpriteBox src={sprites.female} label="♀ Female" />
              <SpriteBox src={sprites.backFemale} label="♀ Back" />
              <SpriteBox src={sprites.shinyFemale} label="♀ Shiny" />
            </div>
          </div>

          {loading && <div className="loading">Loading details...</div>}

          {detail && (
            <>
              {/* Stats */}
              <div className="two-col">
                <div className="info-box">
                  <h3 className="section-title">
                    Base Stats · BST {detail.stats.reduce((a, s) => a + s.base_stat, 0)}
                  </h3>
                  {detail.stats.map(s => (
                    <StatRow key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                  ))}
                </div>

                {/* Info */}
                <div className="info-box">
                  <h3 className="section-title">Info</h3>
                  <div className="info-row">
                    <span className="info-label">Generation</span>
                    <span className="info-value">{generation}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Height</span>
                    <span className="info-value">{(detail.height / 10).toFixed(1)} m</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Weight</span>
                    <span className="info-value">{(detail.weight / 10).toFixed(1)} kg</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Base Exp</span>
                    <span className="info-value">{detail.base_experience ?? '—'}</span>
                  </div>
                </div>
              </div>

              {/* Abilities */}
              <div className="section">
                <h3 className="section-title">Abilities</h3>
                <div className="pills">
                  {detail.abilities.map(a => (
                    <span 
                      key={a.ability.name}
                      className={`pill${a.is_hidden ? ' hidden' : ''}`}
                    >
                      {a.ability.name}{a.is_hidden ? ' ★' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Moves */}
              <div className="section">
                <h3 className="section-title">Moves (First 30)</h3>
                <div className="pills">
                  {detail.moves.slice(0, 30).map(m => (
                    <span key={m.move.name} className="pill">
                      {m.move.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PokemonModal
