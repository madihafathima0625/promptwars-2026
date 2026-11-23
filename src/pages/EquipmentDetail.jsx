/**
 * @fileoverview Equipment detail + booking request form ( /equipment/:id ).
 */
import { useState, useId } from 'react'
import { useParams, Link } from 'react-router-dom'
import { validateRequestInput } from '../data/validate.js'
import { saveRequest } from '../data/store.js'

const STAGES = [
  { value: 'capstone',     label: 'Capstone project' },
  { value: 'mini-project', label: 'Mini-project' },
  { value: 'coursework',   label: 'Coursework' },
  { value: 'practice',     label: 'Practice / self-study' },
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
          <h1>Student persona required</h1>
          <p>Please select a student persona (Asha or Ravi) to submit booking requests.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--sp-5)' }}>
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
          <span aria-hidden="true" style={{ fontSize: '2rem' }}>⚠️</span>
          <h1>Equipment not found</h1>
          <p>The item you are looking for does not exist or has been removed.</p>
          <Link to="/discover" className="btn btn-primary" style={{ marginTop: 'var(--sp-5)' }}>
            Back to catalogue
          </Link>
        </div>
      </main>
    )
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    // Clear field error on change
    setErrors(err => { const n = { ...err }; delete n[e.target.name]; return n })
    setSuccess(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const now = new Date().toISOString()
    const result = validateRequestInput(form, equipment, equip.id, now)
    if (!result.valid) {
      setErrors(result.errors)
      setSuccess(false)
      setLiveMsg('Please fix the errors in the form.')
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
    setLiveMsg('Your request has been submitted successfully.')
    setForm({ projectTitle: '', projectStage: '', deadline: '', startAt: '', endAt: '' })
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <main id="main-content" className="app-main">
      <nav aria-label="Breadcrumb">
        <Link to="/discover" style={{ fontSize: '0.875rem', color: 'var(--c-text-muted)' }}>
          ← Equipment catalogue
        </Link>
      </nav>

      <div className="equip-detail-header" style={{ marginTop: 'var(--sp-4)' }}>
        <div className="equip-detail-pills">
          <span className="equip-pill">{equip.category}</span>
          <span className="equip-pill">{equip.department}</span>
          <span className="equip-pill">{equip.lab}</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{equip.name}</h1>
        <p className="equip-detail-desc">{equip.description}</p>
        <div style={{ display: 'flex', gap: 'var(--sp-5)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
          <span>Available quantity: <strong>{equip.quantity}</strong></span>
          <span>Max session: <strong>{equip.maxSessionHours} h</strong></span>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--sp-5)' }}>
          Request a session
        </h2>

        {/* Aria-live region for form feedback */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMsg}</div>

        {success && (
          <div className="alert alert-success" role="status" style={{ marginBottom: 'var(--sp-4)' }}>
            ✓ Request submitted successfully. Visit <Link to="/requests">My Requests</Link> to see the allocation preview.
          </div>
        )}

        {hasErrors && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
            Please correct the errors below before submitting.
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Project title */}
          <div className={`field${errors.projectTitle ? ' field-error' : ''}`}>
            <label htmlFor={`${uid}-title`}>Project title</label>
            <input
              id={`${uid}-title`}
              name="projectTitle"
              type="text"
              value={form.projectTitle}
              onChange={handleChange}
              autoComplete="off"
              aria-required="true"
              aria-describedby={errors.projectTitle ? `${uid}-title-err` : undefined}
            />
            {errors.projectTitle && (
              <span id={`${uid}-title-err`} className="field-error-msg" role="alert">
                {errors.projectTitle}
              </span>
            )}
          </div>

          {/* Project stage */}
          <div className={`field${errors.projectStage ? ' field-error' : ''}`}>
            <label htmlFor={`${uid}-stage`}>Project stage</label>
            <select
              id={`${uid}-stage`}
              name="projectStage"
              value={form.projectStage}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.projectStage ? `${uid}-stage-err` : undefined}
            >
              <option value="">Select stage…</option>
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {errors.projectStage && (
              <span id={`${uid}-stage-err`} className="field-error-msg" role="alert">
                {errors.projectStage}
              </span>
            )}
          </div>

          {/* Deadline */}
          <div className={`field${errors.deadline ? ' field-error' : ''}`}>
            <label htmlFor={`${uid}-deadline`}>Project deadline</label>
            <input
              id={`${uid}-deadline`}
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.deadline ? `${uid}-deadline-err` : `${uid}-deadline-hint`}
            />
            <span id={`${uid}-deadline-hint`} className="field-hint">
              Your session must end on or before this date.
            </span>
            {errors.deadline && (
              <span id={`${uid}-deadline-err`} className="field-error-msg" role="alert">
                {errors.deadline}
              </span>
            )}
          </div>

          {/* Start date-time */}
          <div className={`field${errors.startAt ? ' field-error' : ''}`}>
            <label htmlFor={`${uid}-start`}>Session start</label>
            <input
              id={`${uid}-start`}
              name="startAt"
              type="datetime-local"
              value={form.startAt}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.startAt ? `${uid}-start-err` : undefined}
            />
            {errors.startAt && (
              <span id={`${uid}-start-err`} className="field-error-msg" role="alert">
                {errors.startAt}
              </span>
            )}
          </div>

          {/* End date-time */}
          <div className={`field${errors.endAt ? ' field-error' : ''}`}>
            <label htmlFor={`${uid}-end`}>Session end</label>
            <input
              id={`${uid}-end`}
              name="endAt"
              type="datetime-local"
              value={form.endAt}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.endAt ? `${uid}-end-err` : `${uid}-end-hint`}
            />
            <span id={`${uid}-end-hint`} className="field-hint">
              Maximum session length: {equip.maxSessionHours} h.
            </span>
            {errors.endAt && (
              <span id={`${uid}-end-err`} className="field-error-msg" role="alert">
                {errors.endAt}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Submit request
          </button>
        </form>
      </div>
    </main>
  )
}
