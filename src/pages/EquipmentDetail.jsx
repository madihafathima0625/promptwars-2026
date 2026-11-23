/**
 * @fileoverview Equipment detail and booking request screen.
 * Two-column layout: Large illustration hero and technical specifications on the left,
 * structured booking request form on the right.
 */
import { useState, useId } from 'react'
import { useParams, Link } from 'react-router-dom'
import { validateRequestInput } from '../data/validate.js'
import { saveRequest } from '../data/store.js'
import CategoryIcon from '../components/CategoryIcon.jsx'

const CATEGORY_DISPLAY_LABELS = {
  '3d-printer': '3D printer',
  'single-board-computer': 'Single-board computer',
  'microcontroller-kit': 'Microcontroller kit',
  'logic-analyser': 'Logic analyser',
  'soldering-station': 'Soldering station',
  'fpga-board': 'FPGA board',
  'oscilloscope': 'Oscilloscope',
  'multimeter': 'Multimeter',
}

function getCategoryLabel(slug) {
  if (!slug) return ''
  if (CATEGORY_DISPLAY_LABELS[slug]) return CATEGORY_DISPLAY_LABELS[slug]
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, m => m.toUpperCase())
}

const STAGES = [
  { value: 'capstone',     label: 'Capstone project (Highest Stage Priority · 20 pts)' },
  { value: 'mini-project', label: 'Mini-project (14 pts)' },
  { value: 'coursework',   label: 'Coursework (8 pts)' },
  { value: 'practice',     label: 'Practice / self-study (3 pts)' },
]

/**
 * @param {{
 *   equipment: import('../data/seed.js').Equipment[],
 *   persona: import('../data/seed.js').Persona,
 *   onStateChange: () => void
 * }} props
 */
export default function EquipmentDetail({ equipment, persona, onStateChange }) {
  const { id } = useParams()
  const equip = equipment.find(e => e.id === id)

  const uid = useId()

  const [form, setForm] = useState({
    projectTitle: '',
    projectStage: '',
    deadline: '',
    startAt: '',
    endAt: '',
  })
  const [errors, setErrors]   = useState({})
  const [success, setSuccess] = useState(false)
  const [liveMsg, setLiveMsg] = useState('')

  if (!persona || persona.role !== 'student') {
    return (
      <main id="main-content" className="app-main">
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h1 className="empty-state-title">Student Persona Required</h1>
          <p className="empty-state-text">
            Equipment booking requests can only be submitted by student researchers. Please select a student persona (such as Asha or Ravi) to proceed.
          </p>
          <Link to="/" className="btn btn-primary">
            Choose a persona
          </Link>
        </div>
      </main>
    )
  }

  if (!equip) {
    return (
      <main id="main-content" className="app-main">
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h1 className="empty-state-title">Instrument Not Found</h1>
          <p className="empty-state-text">
            The requested laboratory equipment could not be identified or is currently decommissioned.
          </p>
          <Link to="/discover" className="btn btn-primary">
            Return to catalogue
          </Link>
        </div>
      </main>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(err => {
      const n = { ...err }
      delete n[name]
      return n
    })
    setSuccess(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const now = new Date().toISOString()
    const result = validateRequestInput(form, equipment, equip.id, now)

    if (!result.valid) {
      setErrors(result.errors)
      setSuccess(false)
      setLiveMsg('Please correct the highlighted form errors before submitting.')
      return
    }

    const req = {
      id:           `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId:    persona.studentId,
      equipmentId:  equip.id,
      projectTitle: form.projectTitle.trim(),
      projectStage: form.projectStage,
      deadline:     new Date(form.deadline).toISOString(),
      startAt:      new Date(form.startAt).toISOString(),
      endAt:        new Date(form.endAt).toISOString(),
      createdAt:    now,
      status:       'pending',
      decision:     null,
    }

    saveRequest(req)
    onStateChange()
    setSuccess(true)
    setErrors({})
    setLiveMsg('Your equipment booking request has been submitted successfully.')
    setForm({ projectTitle: '', projectStage: '', deadline: '', startAt: '', endAt: '' })
  }

  const hasErrors = Object.keys(errors).length > 0

  function renderErrorIcon() {
    return (
      <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </svg>
    )
  }

  return (
    <main id="main-content" className="app-main">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--sp-base)' }}>
        <Link to="/discover" className="btn-quiet">
          ← Back to catalogue
        </Link>
      </nav>

      {/* Screen-reader feedback region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMsg}
      </div>

      <div className="detail-two-col-layout">
        {/* ── Left Column: Specs, Illustration & Allocation Guidance ──── */}
        <section className="detail-spec-panel" aria-labelledby="instrument-spec-title">
          <div className="detail-illustration-hero" aria-hidden="true">
            <CategoryIcon category={equip.category} className="hero-main-svg" />
          </div>

          <div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="stage-pill">{getCategoryLabel(equip.category)}</span>
              <span className="stage-pill">{equip.department}</span>
            </div>
            <h1 id="instrument-spec-title" className="page-title">
              {equip.name}
            </h1>
            <p className="meta-subtext" style={{ fontSize: '0.95rem', marginTop: '4px' }}>
              Located in <strong>{equip.lab}</strong>
            </p>
          </div>

          <p style={{ color: 'var(--c-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {equip.description}
          </p>

          <div className="detail-stats-grid">
            <div className="detail-stat-box">
              <span className="detail-stat-label">Available Units</span>
              <span className="detail-stat-val">{equip.quantity}</span>
            </div>
            <div className="detail-stat-box">
              <span className="detail-stat-label">Max Session</span>
              <span className="detail-stat-val">{equip.maxSessionHours}h</span>
            </div>
            <div className="detail-stat-box">
              <span className="detail-stat-label">Department</span>
              <span style={{ fontWeight: 600, color: 'var(--c-ink)', fontSize: '0.9rem' }}>
                {equip.department}
              </span>
            </div>
            <div className="detail-stat-box">
              <span className="detail-stat-label">Room / Bench</span>
              <span style={{ fontWeight: 600, color: 'var(--c-ink)', fontSize: '0.9rem' }}>
                {equip.lab}
              </span>
            </div>
          </div>

          <div className="explanation-callout" style={{ marginTop: 'var(--sp-md)' }}>
            <strong>How your request is scored:</strong> When multiple students request overlapping slots, LabLink calculates a transparent 100-point score:
            <ul style={{ paddingLeft: '1.2rem', marginTop: '6px', fontSize: '0.825rem' }}>
              <li><strong>Urgency (up to 35 pts):</strong> Proximity of your project deadline.</li>
              <li><strong>Stage (up to 20 pts):</strong> Capstones receive priority over coursework.</li>
              <li><strong>Fairness (up to 30 pts):</strong> Prioritizes students with fewer approved hours in the last 30 days.</li>
              <li><strong>Reliability (up to 15 pts):</strong> Rewarded for attending scheduled bookings.</li>
            </ul>
          </div>
        </section>

        {/* ── Right Column: Booking Request Form ──────────────────────── */}
        <section className="booking-form-card" aria-labelledby="booking-form-heading">
          {success && (
            <div className="banner banner-success" role="status">
              <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
              </svg>
              <div>
                <strong>Request submitted successfully!</strong> Track your live fair allocation ranking on{' '}
                <Link to="/requests" style={{ color: 'var(--c-primary)', fontWeight: 700 }}>
                  My Requests
                </Link>.
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="banner banner-danger" role="alert">
              <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
              </svg>
              <span>Please resolve the highlighted field errors before submitting.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="form-fieldset">
              <legend id="booking-form-heading" className="form-legend">
                Request Session Slot
              </legend>

              {/* Project Title */}
              <div className={`field${errors.projectTitle ? ' field-error' : ''}`}>
                <label htmlFor={`${uid}-title`}>Project Title</label>
                <input
                  id={`${uid}-title`}
                  name="projectTitle"
                  type="text"
                  placeholder="e.g., High-Speed Signal Integrity Analysis"
                  value={form.projectTitle}
                  onChange={handleChange}
                  aria-invalid={!!errors.projectTitle}
                  aria-describedby={errors.projectTitle ? `${uid}-title-err` : `${uid}-title-hint`}
                  required
                />
                <span id={`${uid}-title-hint`} className="field-hint">
                  A concise project title (between 3 and 80 characters).
                </span>
                {errors.projectTitle && (
                  <span id={`${uid}-title-err`} className="field-error-msg" role="alert">
                    {renderErrorIcon()} {errors.projectTitle}
                  </span>
                )}
              </div>

              {/* Project Stage */}
              <div className={`field${errors.projectStage ? ' field-error' : ''}`}>
                <label htmlFor={`${uid}-stage`}>Academic Project Stage</label>
                <select
                  id={`${uid}-stage`}
                  name="projectStage"
                  value={form.projectStage}
                  onChange={handleChange}
                  aria-invalid={!!errors.projectStage}
                  aria-describedby={errors.projectStage ? `${uid}-stage-err` : `${uid}-stage-hint`}
                  required
                >
                  <option value="">Select project stage...</option>
                  {STAGES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <span id={`${uid}-stage-hint`} className="field-hint">
                  Stage determines engine priority weighting (Capstone: 20 pts, Mini-Project: 14 pts).
                </span>
                {errors.projectStage && (
                  <span id={`${uid}-stage-err`} className="field-error-msg" role="alert">
                    {renderErrorIcon()} {errors.projectStage}
                  </span>
                )}
              </div>

              {/* Project Deadline */}
              <div className={`field${errors.deadline ? ' field-error' : ''}`}>
                <label htmlFor={`${uid}-deadline`}>Project Submission Deadline</label>
                <input
                  id={`${uid}-deadline`}
                  name="deadline"
                  type="datetime-local"
                  value={form.deadline}
                  onChange={handleChange}
                  aria-invalid={!!errors.deadline}
                  aria-describedby={errors.deadline ? `${uid}-deadline-err` : `${uid}-deadline-hint`}
                  required
                />
                <span id={`${uid}-deadline-hint`} className="field-hint">
                  Must be in the future and after your requested session end time.
                </span>
                {errors.deadline && (
                  <span id={`${uid}-deadline-err`} className="field-error-msg" role="alert">
                    {renderErrorIcon()} {errors.deadline}
                  </span>
                )}
              </div>

              {/* Slot Start Time */}
              <div className={`field${errors.startAt ? ' field-error' : ''}`}>
                <label htmlFor={`${uid}-startAt`}>Requested Session Start</label>
                <input
                  id={`${uid}-startAt`}
                  name="startAt"
                  type="datetime-local"
                  value={form.startAt}
                  onChange={handleChange}
                  aria-invalid={!!errors.startAt}
                  aria-describedby={errors.startAt ? `${uid}-start-err` : `${uid}-start-hint`}
                  required
                />
                <span id={`${uid}-start-hint`} className="field-hint">
                  Must be scheduled in the future.
                </span>
                {errors.startAt && (
                  <span id={`${uid}-start-err`} className="field-error-msg" role="alert">
                    {renderErrorIcon()} {errors.startAt}
                  </span>
                )}
              </div>

              {/* Slot End Time */}
              <div className={`field${errors.endAt ? ' field-error' : ''}`}>
                <label htmlFor={`${uid}-endAt`}>Requested Session End</label>
                <input
                  id={`${uid}-endAt`}
                  name="endAt"
                  type="datetime-local"
                  value={form.endAt}
                  onChange={handleChange}
                  aria-invalid={!!errors.endAt}
                  aria-describedby={errors.endAt ? `${uid}-end-err` : `${uid}-end-hint`}
                  required
                />
                <span id={`${uid}-end-hint`} className="field-hint">
                  Must be after start time and within the max session limit ({equip.maxSessionHours}h).
                </span>
                {errors.endAt && (
                  <span id={`${uid}-end-err`} className="field-error-msg" role="alert">
                    {renderErrorIcon()} {errors.endAt}
                  </span>
                )}
              </div>
            </fieldset>

            <button type="submit" className="btn btn-primary btn-full">
              Submit allocation request
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
