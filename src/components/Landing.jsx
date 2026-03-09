import React, { useState } from 'react'
import './Landing.css'

function Landing({ onEnter }) {
  const [exiting, setExiting] = useState(false)

  const handleEnter = () => {
    setExiting(true)
    setTimeout(onEnter, 720)
  }

  return (
    <div className={`landing ${exiting ? 'exit' : ''}`}>
      <div className="poke-ball">
        <div className="poke-ball-inner" />
      </div>
      <h1 className="landing-title">Pokédex</h1>
      <p className="landing-subtitle">All Generations · All Data</p>
      <button className="enter-btn" onClick={handleEnter}>
        <span>Enter</span>
      </button>
    </div>
  )
}

export default Landing
