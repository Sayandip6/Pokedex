import React from 'react'
import './LoadingSpinner.css'

function LoadingSpinner({ message = 'Loading Pokémon...' }) {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
