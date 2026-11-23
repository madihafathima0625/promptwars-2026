/**
 * @fileoverview Top navigation header with precision instrument styling.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { setPersona } from '../data/store.js'

/**
 * @param {{
 *   persona: import('../data/seed.js').Persona|null,
 *   onReset: () => void,
 *   onSwitchPersona?: () => void
 * }} props
 */
export default function Nav({ persona, onReset, onSwitchPersona }) {
  const navigate = useNavigate()

  function handleSwitch() {
    setPersona(null)
    onSwitchPersona?.()
    navigate('/')
  }

  return (
    <header className="app-header">
      <nav className="nav-inner" aria-label="Main navigation">
        <Link to="/" className="brand-link" aria-label="LabLink Home">
          {/* Inline SVG Instrument Mark */}
          <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" />
            <path d="M7 12h2l2-4 3 8 2-4h3" />
          </svg>
          <span>LabLink</span>
        </Link>

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
              <div className="persona-badge">
                <span>{persona.name}</span>
                <span className="persona-role-tag">({persona.role})</span>
              </div>
              <button
                className="btn btn-header-ghost btn-sm"
                onClick={handleSwitch}
                type="button"
                aria-label={`Switch persona, currently signed in as ${persona.name}`}
              >
                Switch persona
              </button>
              <button
                className="btn btn-header-danger btn-sm"
                onClick={onReset}
                type="button"
                aria-label="Reset demo data to initial state"
              >
                Reset demo data
              </button>
            </>
          ) : (
            <span className="nav-empty-persona">No persona selected</span>
          )}
        </div>
      </nav>
    </header>
  )
}
