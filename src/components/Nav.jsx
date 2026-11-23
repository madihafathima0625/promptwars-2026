/**
 * @fileoverview Top navigation bar with persona info and reset control.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { setPersona } from '../data/store.js'

/**
 * @param {{ persona: import('../data/seed.js').Persona|null, onReset: () => void, onSwitchPersona: () => void }} props
 */
export default function Nav({ persona, onReset, onSwitchPersona }) {
  const navigate = useNavigate()

  function handleSwitch() {
    setPersona(null)
    onSwitchPersona?.()
    navigate('/')
  }

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">LabLink</Link>

        {persona && (
          <ul className="nav-links" role="list">
            {persona.role === 'student' && (
              <>
                <li><NavLink to="/discover">Discover</NavLink></li>
                <li><NavLink to="/requests">My Requests</NavLink></li>
              </>
            )}
            {persona.role === 'admin' && (
              <li><NavLink to="/admin">Admin Panel</NavLink></li>
            )}
          </ul>
        )}

        <div className="nav-spacer" aria-hidden="true" />

        <div className="nav-persona">
          {persona ? (
            <>
              <span>Signed in as <strong>{persona.name}</strong></span>
              <button className="btn btn-ghost btn-sm" onClick={handleSwitch} type="button">
                Switch persona
              </button>
              <button className="btn btn-danger btn-sm" onClick={onReset} type="button">
                Reset demo data
              </button>
            </>
          ) : (
            <span>No persona selected</span>
          )}
        </div>
      </div>
    </nav>
  )
}
