import React, { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header'
import PokemonGrid from './components/PokemonGrid'
import PokemonModal from './components/PokemonModal'
import Landing from './components/Landing'
import LoadingSpinner from './components/LoadingSpinner'
import pokemonAPI from './services/pokeApi'
import { getIdFromUrl } from './utils/helpers'

function App() {
  const [phase, setPhase] = useState('landing') // 'landing' or 'app'
  const [allPokemon, setAllPokemon] = useState([])
  const [filteredPokemon, setFilteredPokemon] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('name')
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [status, setStatus] = useState('')
  const loadingTimeoutRef = useRef(null)

  // Progressive loading in batches
  const loadAllPokemon = useCallback(async () => {
    setIsLoadingInitial(true)
    
    try {
      // Fetch pokemon list (1025 total)
      const response = await pokemonAPI.getAllPokemon(1025, 0)
      const basePokemonList = response.data.results

      // Load in batches of 50
      const BATCH_SIZE = 50
      const detailedPokemon = []

      for (let i = 0; i < basePokemonList.length; i += BATCH_SIZE) {
        // Create batch promises
        const batchPromises = basePokemonList
          .slice(i, i + BATCH_SIZE)
          .map(pokemon =>
            pokemonAPI
              .getPokemonByIdOrName(pokemon.name)
              .then(response => response.data)
              .catch(error => {
                console.error(`Failed to load ${pokemon.name}:`, error)
                return null
              })
          )

        // Wait for batch to complete
        const results = await Promise.all(batchPromises)
        const validResults = results.filter(r => r !== null)
        detailedPokemon.push(...validResults)

        // Update state progressively so pokemon appear as they load
        setAllPokemon([...detailedPokemon].sort((a, b) => a.id - b.id))
        setStatus(`Loading Pokémon... ${Math.min(i + BATCH_SIZE, basePokemonList.length)}/${basePokemonList.length}`)

        // Hide loading spinner after first batch appears
        if (i === 0) {
          setIsLoadingInitial(false)
        }
      }

      setStatus('')
    } catch (error) {
      console.error('Error loading pokemon:', error)
      setStatus('Error loading data')
      setIsLoadingInitial(false)
    }
  }, [])

  // Handle filter and search
  useEffect(() => {
    let results = allPokemon

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().replace(/\s+/g, ' ').trim()
      results = allPokemon.filter(p => {
        if (filterType === 'name') {
          // Normalize both for comparison (spaces and hyphens are equivalent)
          const normalizedName = p.name.toLowerCase().replace(/-/g, ' ')
          const normalizedQuery = query.replace(/-/g, ' ')
          return normalizedName.includes(normalizedQuery)
        } else if (filterType === 'id') {
          return p.id.toString().includes(query)
        } else if (filterType === 'type') {
          return p.types?.some(t => t.type.name.toLowerCase().replace(/-/g, ' ').includes(query.replace(/-/g, ' ')))
        } else if (filterType === 'ability') {
          return p.abilities?.some(a => a.ability.name.toLowerCase().replace(/-/g, ' ').includes(query.replace(/-/g, ' ')))
        }
        return true
      })
    }

    setFilteredPokemon(results)
  }, [searchQuery, filterType, allPokemon])

  const handleEnter = () => {
    setPhase('app')
    loadAllPokemon()
  }

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon)
    const index = filteredPokemon.findIndex(p => p.id === pokemon.id)
    setSelectedIndex(index)
  }

  const handlePrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1
      setSelectedIndex(newIndex)
      setSelectedPokemon(filteredPokemon[newIndex])
    }
  }, [selectedIndex, filteredPokemon])

  const handleNext = useCallback(() => {
    if (selectedIndex < filteredPokemon.length - 1) {
      const newIndex = selectedIndex + 1
      setSelectedIndex(newIndex)
      setSelectedPokemon(filteredPokemon[newIndex])
    }
  }, [selectedIndex, filteredPokemon])

  if (phase === 'landing') {
    return <Landing onEnter={handleEnter} />
  }

  return (
    <div className="app">
      {isLoadingInitial && <LoadingSpinner message="Fetching Pokémon..." />}

      <Heade
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        totalCount={1025}
        loadedCount={allPokemon.length}
      />

      <main className="main-container">
        <PokemonGrid
          pokemonList={filteredPokemon}
          onCardClick={handleCardClick}
          isLoading={isLoadingInitial}
          groupByGeneration={!searchQuery}
        />
      </main>

      {status && (
        <div className="status-bar">
          <div className="status-dot" />
          {status}
        </div>
      )}

      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => {
            setSelectedPokemon(null)
            setSelectedIndex(null)
          }}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex < filteredPokemon.length - 1}
        />
      )}
    </div>
  )
}

export default App
