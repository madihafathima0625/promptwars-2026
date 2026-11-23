/**
 * @fileoverview Persona picker and welcome page.
 * Split hero layout with editorial typography, live laboratory count strip,
 * and three role-focused entry cards (Student, Faculty, Admin).
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { setPersona, getState } from '../data/store.js'

/**
 * @param {{ onPersonaChange: () => void }} props
 */
export default function PersonaPicker({ onPersonaChange }) {
  const navigate = useNavigate()

  const storeState = useMemo(() => getState(), [])
  const equipCount = storeState.equipment?.length ?? 12
  const totalUnits = useMemo(
    () => storeState.equipment?.reduce((sum, e) => sum + (e.quantity || 1), 0) ?? 18,
    [storeState.equipment]
  )
  const deptCount = useMemo(
    () => new Set(storeState.equipment?.map(e => e.department)).size || 4,
    [storeState.equipment]
  )

  function pickPersona(personaId, targetRoute) {
    setPersona(personaId)
    onPersonaChange()
    navigate(targetRoute)
  }

  return (
    <main id="main-content" className="app-main">
      {/* ── 1. Split Hero ──────────────────────────────────────────────── */}
      <section className="hero-split-grid" aria-label="Welcome and product introduction">
        <div className="hero-copy-pane">
          <h1 className="hero-editorial-title">
            Every lab on campus, open to every project.
          </h1>
          <p className="hero-editorial-sub">
            LabLink connects student researchers with shared department instruments.
            Deterministic, transparent scoring balances deadline urgency, project stage, and historical fairness.
          </p>
          <div className="hero-value-prop">
            Fair access to every lab, with reasons you can read.
          </div>
        </div>

        <div className="hero-illustration-pane" aria-hidden="true">
          {/* Precision Lab Instrument Illustration */}
          <svg
            className="hero-main-svg"
            viewBox="0 0 420 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Table Surface */}
            <rect x="20" y="230" width="380" height="8" rx="4" fill="var(--c-border)" />
            <rect x="50" y="238" width="16" height="30" rx="2" fill="var(--c-border-strong)" />
            <rect x="354" y="238" width="16" height="30" rx="2" fill="var(--c-border-strong)" />

            {/* Benchtop Dual-Channel Oscilloscope */}
            <rect x="50" y="70" width="220" height="150" rx="10" fill="var(--bg-surface)" stroke="var(--c-primary)" strokeWidth="3" />
            <rect x="66" y="86" width="130" height="118" rx="6" fill="var(--bg-page)" stroke="var(--c-sage)" strokeWidth="2" />
            {/* Calibrated Screen Grid */}
            <line x1="131" y1="86" x2="131" y2="204" stroke="var(--c-sage-pale)" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="66" y1="145" x2="196" y2="145" stroke="var(--c-sage-pale)" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Waveform Trace */}
            <path
              d="M72 145c15-45 30-45 45 0s30 45 45 0 20-30 30 0"
              stroke="var(--c-primary)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Secondary Amber Waveform Trace */}
            <path
              d="M72 155c20 20 40-20 60 0s40 20 60 0"
              stroke="var(--c-amber)"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
            />
            {/* Oscilloscope Control Cluster */}
            <circle cx="230" cy="104" r="14" fill="var(--c-sage-soft)" stroke="var(--c-primary)" strokeWidth="2" />
            <line x1="230" y1="104" x2="238" y2="96" stroke="var(--c-primary)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="230" cy="146" r="12" fill="var(--c-sage-soft)" stroke="var(--c-primary)" strokeWidth="2" />
            <line x1="230" y1="146" x2="223" y2="152" stroke="var(--c-primary)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="215" cy="190" r="5" fill="var(--c-amber)" />
            <circle cx="245" cy="190" r="5" fill="var(--c-sage)" />

            {/* Microcontroller Test Board */}
            <rect x="290" y="130" width="90" height="90" rx="8" fill="var(--c-sage-soft)" stroke="var(--c-primary)" strokeWidth="2" />
            <rect x="312" y="152" width="46" height="46" rx="4" fill="var(--bg-surface)" stroke="var(--c-primary)" strokeWidth="1.5" />
            <circle cx="335" cy="175" r="8" fill="var(--c-sage-pale)" />
            {/* Probing Cable connecting Oscilloscope to Board */}
            <path
              d="M245 190c30 40 50 10 75-10"
              stroke="var(--c-amber-text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </section>

      {/* ── 2. Available Today Live Data Strip ──────────────────────────── */}
      <section className="available-today-strip" aria-label="Live laboratory equipment availability">
        <div className="strip-item">
          <span className="strip-num">{equipCount}</span>
          <span className="strip-label">Instrument Types</span>
        </div>
        <div className="strip-divider" aria-hidden="true" />
        <div className="strip-item">
          <span className="strip-num">{totalUnits}</span>
          <span className="strip-label">Units Available Today</span>
        </div>
        <div className="strip-divider" aria-hidden="true" />
        <div className="strip-item">
          <span className="strip-num">{deptCount}</span>
          <span className="strip-label">Engineering Labs</span>
        </div>
        <div className="strip-divider" aria-hidden="true" />
        <div className="strip-item">
          <span className="strip-num">100%</span>
          <span className="strip-label">Explainable Allocation</span>
        </div>
      </section>

      {/* ── 3. Three Entry Role Cards ───────────────────────────────────── */}
      <section aria-labelledby="role-select-heading">
        <h2 id="role-select-heading" className="page-title" style={{ marginBottom: 'var(--sp-base)' }}>
          Choose your perspective
        </h2>
        <p className="page-subtitle">
          Experience LabLink from either a student researcher seeking lab access or an administrator managing allocation queues.
        </p>

        <div className="entry-cards-grid" role="list">
          {/* Card 1: Student Researcher (Sage) */}
          <article
            className="entry-card entry-card-student"
            role="listitem"
            aria-labelledby="card-student-title"
          >
            <h3 id="card-student-title" className="entry-role-title">Student Researcher</h3>
            <p className="entry-tagline">
              Explore lab apparatus, submit project time-slots, and inspect explainable fair allocation scoring in real time.
            </p>
            <div className="entry-actions-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => pickPersona('asha', '/discover')}
                aria-label="Continue as Asha Krishnan (Capstone, 0 prior hours)"
              >
                Asha (Capstone)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => pickPersona('ravi', '/discover')}
                aria-label="Continue as Ravi Sharma (Mini-Project, 12 approved hours)"
              >
                Ravi (Mini-Project)
              </button>
            </div>
          </article>

          {/* Card 2: Faculty & Supervisor (Amber) */}
          <article
            className="entry-card entry-card-faculty"
            role="listitem"
            aria-labelledby="card-faculty-title"
          >
            <h3 id="card-faculty-title" className="entry-role-title">Faculty & Supervisor</h3>
            <p className="entry-tagline">
              Oversee departmental laboratory schedules, check capstone project deadlines, and verify equitable student distribution.
            </p>
            <div className="entry-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => pickPersona('drrao', '/admin')}
                aria-label="Continue as Dr. Priya Rao with faculty supervisor perspective"
              >
                Explore as Dr. Rao
              </button>
            </div>
          </article>

          {/* Card 3: Laboratory Administrator (Forest Green) */}
          <article
            className="entry-card entry-card-admin"
            role="listitem"
            aria-labelledby="card-admin-title"
          >
            <h3 id="card-admin-title" className="entry-role-title">Laboratory Administrator</h3>
            <p className="entry-tagline">
              Run allocation batches, review capacity constraints, resolve contention with live rankings, and log explainable overrides.
            </p>
            <div className="entry-actions-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => pickPersona('drrao', '/admin')}
                aria-label="Enter Allocation Console as Dr. Priya Rao"
              >
                Open Allocation Desk
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ── 4. Calm Demo Disclosure Note ───────────────────────────────── */}
      <div className="banner banner-amber" role="note" style={{ marginTop: 'var(--sp-xl)' }}>
        <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
        <div>
          <strong>Demo simulation notice:</strong> Roles are simulated in your browser with state saved to localStorage.
          No backend or third-party service is contacted.
        </div>
      </div>
    </main>
  )
}
