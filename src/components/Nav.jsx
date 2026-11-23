/**
 * @fileoverview Light, airy top navigation bar with serif brand mark and persona controls.
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
          {/* Subtle pulse / instrument mark */}
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M7 12h2.5l1.8-4.5 2.4 8.5 2-4h2.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>LabLink</span>
        </Link>

        {persona && (
          <ul className="nav-links" role="list">
            {persona.role === 'student' && (
              <>
                <li>
                  <NavLink
                    to="/discover"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Catalogue
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/requests"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    My Requests
                  </NavLink>
                </li>
              </>
            )}
            {persona.role === 'admin' && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Allocation Desk
                </NavLink>
              </li>
            )}
          </ul>
        )}

        <div className="nav-spacer" aria-hidden="true" />

        <div className="nav-persona">
          {persona ? (
            <>
              <div className="persona-pill" aria-label={`Current persona: ${persona.name}, role ${persona.role}`}>
                <span>{persona.name}</span>
                <span className="persona-role-tag">({persona.role})</span>
              </div>
              <button
                className="btn-quiet"
                onClick={handleSwitch}
                type="button"
                aria-label={`Switch persona, currently signed in as ${persona.name}`}
              >
                Switch persona
              </button>
              <button
                className="btn-quiet btn-quiet-danger"
                onClick={onReset}
                type="button"
                aria-label="Reset demo data to initial state"
              >
                Reset demo data
              </button>
            </>
          ) : (
            <span className="meta-subtext">No persona selected</span>
          )}
        </div>
      </nav>
    </header>
  )
}
