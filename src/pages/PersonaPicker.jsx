/**
 * @fileoverview Persona picker screen with initials avatars and role try-hints.
 */
import { useNavigate } from 'react-router-dom'
import { setPersona, personas } from '../data/store.js'

const INITIALS = {
  asha: 'AK',
  ravi: 'RS',
  drrao: 'PR',
}

const TRY_HINTS = {
  asha: 'Try Asha to submit capstone requests with zero prior usage hours and test urgency priority.',
  ravi: 'Try Ravi to test mini-project allocation with 12 approved hours and 1 past no-show.',
  drrao: 'Try Dr. Rao to manage equipment queues, resolve conflicts, and test admin overrides.',
}

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
        <h1 className="hero-title">LabLink</h1>
        <p className="page-subtitle">Fair access to every lab, with reasons you can read.</p>
      </div>

      <div className="banner banner-amber" role="note">
        <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
        <span>
          <strong>Demo mode:</strong> Roles are simulated and data is stored in your browser. Production would use institutional SSO and a database.
        </span>
      </div>

      <p className="page-subtitle">Select a persona to continue:</p>

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
            <div className="persona-card-header">
              <div className="persona-avatar" aria-hidden="true">
                {INITIALS[p.id] ?? p.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="persona-info">
                <span className="persona-name">{p.name}</span>
                <span className="persona-role-label">{p.role}</span>
              </div>
            </div>

            <p className="persona-try-hint">{TRY_HINTS[p.id] ?? p.bio}</p>

            <button
              className="btn btn-primary btn-sm"
              type="button"
              tabIndex={-1}
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
