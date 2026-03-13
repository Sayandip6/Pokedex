import React from 'react'
import './Header.css'
import GitHubLink from './GitHubLink'

function Header({ 
  searchQuery, 
  onSearchChange, 
  filterType, 
  onFilterChange, 
  totalCount,
  loadedCount 
}) {
  return (
    <header className="header">
      <div className="logo" onClick={() => onSearchChange('')}>
        PkDx
      </div>
      
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder={`Search by ${filterType}…`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')}>✕</button>
        )}
      </div>

      <div className="filter-tabs">
        {['name', 'id', 'type', 'ability'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filterType === f ? 'active' : ''}`}
            onClick={() => onFilterChange(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <span className="header-count">{loadedCount} / {totalCount}</span>
      
      <GitHubLink />
    </header>
  )
}

export default Header
