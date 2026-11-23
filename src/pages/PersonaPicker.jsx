/**
 * @fileoverview Persona picker screen ( / ).
 */
import { useNavigate } from 'react-router-dom'
import { setPersona, personas } from '../data/store.js'

/** Emoji avatars keyed by persona id */
const AVATARS = { asha: '🧑‍🔬', ravi: '👨‍💻', drrao: '🏛️' }

/**
 * @param {{ onPersonaChange: () => void }} props
 */
export default function PersonaPicker({ onPersonaChange }) {
  const navigate = useNavigate()

  function pick(persona) {
    setPersona(persona.id)
    onPersonaChange()
    if (persona.role === 'admin') navigate('/admin')
    else navigate('/discover')
  }

  return (
    <main id="main-content" className="app-main">
      <div className="page-header">
        <h1>Welcome to LabLink</h1>
        <p>Fair, explainable lab equipment allocation for students and staff.</p>
      </div>

      <div className="banner banner-info" role="note">
        <strong>Demo mode:</strong> roles are simulated and data is stored in your browser only.
        Production would use institutional SSO and a server-side database. No real personal data is collected.
      </div>

      <p style={{ marginBottom: 'var(--sp-2)', fontWeight: 600 }}>Select a persona to continue:</p>

      <div className="persona-grid" role="list">
        {personas.map(p => (
          <article
            key={p.id}
            className="card persona-card"
            role="listitem"
            onClick={() => pick(p)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') pick(p) }}
            tabIndex={0}
            aria-label={`Continue as ${p.name}, ${p.role}`}
          >
            <div className="persona-avatar" aria-hidden="true">{AVATARS[p.id]}</div>
            <div>
              <div className="persona-name">{p.name}</div>
              <div className="persona-role">{p.role}</div>
            </div>
            <p className="persona-bio">{p.bio}</p>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              tabIndex={-1}  /* parent is the interactive element */
              aria-hidden="true"
            >
              Continue as {p.name.split(' ')[0]}
            </button>
          </article>
        ))}
      </div>
    </main>
  )
}
