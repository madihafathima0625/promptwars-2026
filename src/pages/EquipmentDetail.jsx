/**
 * @fileoverview Equipment detail and booking request form with precision instrument styling.
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
          <svg className="empty-state-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h1 className="empty-state-title">Student Persona Required</h1>
          <p className="empty-state-text">
            Please switch to a student persona (such as Asha or Ravi) to submit equipment booking requests.
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
          <svg className="empty-state-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 className="empty-state-title">Equipment not found</h1>
          <p className="empty-state-text">
            The requested equipment could not be found or has been decommissioned.
          </p>
          <Link to="/discover" className="btn btn-primary">
            Back to catalogue
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
      setLiveMsg('Please correct the highlighted form errors.')
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

  function renderErrorIcon() {
    return (
      <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </svg>
    )
  }

  return (
    <main id="main-content" className="app-main">
      <nav aria-label="Breadcrumb">
        <Link to="/discover" className="back-link">
          ← Back to catalogue
        </Link>
      </nav>

      <div className="equip-detail-header">
        <div className="equip-detail-pills">
          <span className="stat-chip">{equip.category}</span>
          <span className="stat-chip">{equip.department}</span>
          <span className="stat-chip">{equip.lab}</span>
        </div>
        <h1 className="page-title">{equip.name}</h1>
        <p className="equip-detail-desc">{equip.description}</p>
        <div className="equip-detail-stats">
          <span>Available Units: <strong>{equip.quantity}</strong></span>
          <span>Max Session Length: <strong>{equip.maxSessionHours} hours</strong></span>
          <span>Location: <strong>{equip.lab}</strong></span>
        </div>
      </div>

      <div className="form-panel">
        {/* Aria-live region for form feedback */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveMsg}
        </div>

        {success && (
          <div className="banner banner-success" role="status">
            <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
            <div>
              <strong>Request submitted.</strong> Check{' '}
              <Link to="/requests" className="back-link">
                My Requests
              </Link>{' '}
              to inspect your fair allocation score and rank.
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="banner banner-danger" role="alert">
            <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
            </svg>
            <span>Please correct the errors in the booking form before submitting.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="form-fieldset">
            <legend className="form-legend">Request Session Slot</legend>

            {/* Project Title */}
            <div className={`field${errors.projectTitle ? ' field-error' : ''}`}>
              <label htmlFor={`${uid}-title`}>Project Title</label>
              <input
                id={`${uid}-title`}
                name="projectTitle"
                type="text"
                value={form.projectTitle}
                onChange={handleChange}
                autoComplete="off"
                aria-required="true"
                aria-describedby={errors.projectTitle ? `${uid}-title-err` : `${uid}-title-hint`}
                placeholder="e.g. Wireless Sensor Array Debugging"
              />
              <span id={`${uid}-title-hint`} className="field-hint">
                Brief description of your planned academic work (3–80 characters).
              </span>
              {errors.projectTitle && (
                <span id={`${uid}-title-err`} className="field-error-msg" role="alert">
                  {renderErrorIcon()}
                  <span>{errors.projectTitle}</span>
                </span>
              )}
            </div>

            {/* Project Stage */}
            <div className={`field${errors.projectStage ? ' field-error' : ''}`}>
              <label htmlFor={`${uid}-stage`}>Project Stage</label>
              <select
                id={`${uid}-stage`}
                name="projectStage"
                value={form.projectStage}
                onChange={handleChange}
                aria-required="true"
                aria-describedby={errors.projectStage ? `${uid}-stage-err` : `${uid}-stage-hint`}
              >
                <option value="">Select project stage…</option>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span id={`${uid}-stage-hint`} className="field-hint">
                Capstone receives the highest stage priority in the allocation engine.
              </span>
              {errors.projectStage && (
                <span id={`${uid}-stage-err`} className="field-error-msg" role="alert">
                  {renderErrorIcon()}
                  <span>{errors.projectStage}</span>
                </span>
              )}
            </div>

            {/* Deadline */}
            <div className={`field${errors.deadline ? ' field-error' : ''}`}>
              <label htmlFor={`${uid}-deadline`}>Project Submission Deadline</label>
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
                Your session slot must end on or before this deadline.
              </span>
              {errors.deadline && (
                <span id={`${uid}-deadline-err`} className="field-error-msg" role="alert">
                  {renderErrorIcon()}
                  <span>{errors.deadline}</span>
                </span>
              )}
            </div>

            {/* Session Start */}
            <div className={`field${errors.startAt ? ' field-error' : ''}`}>
              <label htmlFor={`${uid}-start`}>Requested Session Start</label>
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
                  {renderErrorIcon()}
                  <span>{errors.startAt}</span>
                </span>
              )}
            </div>

            {/* Session End */}
            <div className={`field${errors.endAt ? ' field-error' : ''}`}>
              <label htmlFor={`${uid}-end`}>Requested Session End</label>
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
                Maximum allowable session: {equip.maxSessionHours} hours.
              </span>
              {errors.endAt && (
                <span id={`${uid}-end-err`} className="field-error-msg" role="alert">
                  {renderErrorIcon()}
                  <span>{errors.endAt}</span>
                </span>
              )}
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-full">
            Submit booking request
          </button>
        </form>
      </div>
    </main>
  )
}
