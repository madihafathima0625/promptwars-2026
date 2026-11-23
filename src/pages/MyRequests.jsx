/**
 * @fileoverview My Requests page displaying pending allocations and decided booking history.
 * Formatted as a vertical booking timeline with status node pins, project metadata chips,
 * and transparent score factor disclosure panels.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { allocate } from '../engine/allocate.js'
import { buildHistory } from '../data/history.js'
import StatusBadge from '../components/StatusBadge.jsx'
import DecisionPanel from '../components/DecisionPanel.jsx'

/** @param {string} iso */
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/** @param {string} iso */
function fmtDT(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function renderStatusPinIcon(status) {
  if (status === 'approved' || status === 'recommend_approve') {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true" focusable="false">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
      </svg>
    )
  }
  if (status === 'rejected' || status === 'recommend_reject') {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true" focusable="false">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    )
  }
  if (status === 'waitlist') {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true" focusable="false">
        <circle cx="4" cy="8" r="1.5" />
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="12" cy="8" r="1.5" />
      </svg>
    )
  }
  // Pending or default
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * @param {{
 *   requests: import('../data/seed.js').Request[],
 *   equipment: import('../data/seed.js').Equipment[],
 *   persona: import('../data/seed.js').Persona
 * }} props
 */
export default function MyRequests({ requests, equipment, persona }) {
  const now = new Date().toISOString()

  // All requests for this student (unconditional hook)
  const myRequests = useMemo(
    () => (persona ? requests.filter(r => r.studentId === persona.studentId) : []),
    [requests, persona]
  )

  // Run the allocator over ALL pending requests to produce live recommendations (unconditional hook)
  const decisionMap = useMemo(() => {
    const allPending = requests.filter(r => r.status === 'pending')
    const history    = buildHistory(requests, now)
    if (allPending.length === 0) return {}

    const decisions = allocate({ requests: allPending, equipment, history, now })
    return Object.fromEntries(decisions.map(d => [d.requestId, d]))
  }, [requests, equipment, now])

  // Guard against null persona after hooks are evaluated
  if (!persona) {
    return (
      <main id="main-content" className="app-main">
        <div className="page-header">
          <h1 className="page-title">My Requests</h1>
        </div>
        <div className="empty-state" role="status">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h2 className="empty-state-title">Persona Required</h2>
          <p className="empty-state-text">
            Please select a student persona to review your booking requests and allocation recommendations.
          </p>
          <Link to="/" className="btn btn-primary">
            Choose Persona
          </Link>
        </div>
      </main>
    )
  }

  // Separate mine into pending vs decided
  const myPending = myRequests.filter(r => r.status === 'pending')
  const myDecided = myRequests.filter(r => r.status !== 'pending')

  if (myRequests.length === 0) {
    return (
      <main id="main-content" className="app-main">
        <div className="page-header">
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track your equipment allocation requests and recommendations.</p>
        </div>
        <div className="empty-state" role="status">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h2 className="empty-state-title">No requests found</h2>
          <p className="empty-state-text">
            You have not submitted any equipment booking requests for {persona.name} yet.
          </p>
          <Link to="/discover" className="btn btn-primary">
            Browse equipment catalogue
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="app-main">
      <div className="page-header">
        <h1 className="page-title">My Booking Timeline</h1>
        <p className="page-subtitle">
          Showing <strong>{myRequests.length}</strong> request{myRequests.length !== 1 ? 's' : ''} for{' '}
          <strong>{persona.name}</strong> ({persona.studentId}).
        </p>
      </div>

      {/* ── Pending Requests Timeline ─────────────────────────────────── */}
      {myPending.length > 0 && (
        <section aria-labelledby="pending-timeline-heading" style={{ marginBottom: 'var(--sp-2xl)' }}>
          <h2 id="pending-timeline-heading" className="page-title" style={{ fontSize: '1.4rem' }}>
            Pending Queues ({myPending.length})
          </h2>
          <div className="banner banner-info" role="note">
            <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
              <circle cx="8" cy="8" r="8" />
              <path d="M8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFFFFF" />
            </svg>
            <span>
              <strong>Real-Time Recommendation Preview:</strong> The engine scores below update dynamically as requests enter or leave the queue. Final confirmation is logged by the laboratory administrator.
            </span>
          </div>

          <div className="booking-timeline" role="list" aria-label="Pending allocation requests">
            {myPending.map(req => {
              const decision = decisionMap[req.id]
              const equip = equipment.find(e => e.id === req.equipmentId)
              const equipName = equip?.name ?? req.equipmentId
              const statusKey = decision?.outcome ?? 'pending'

              return (
                <article
                  key={req.id}
                  className="timeline-entry"
                  role="listitem"
                  aria-labelledby={`req-title-${req.id}`}
                >
                  <div className="timeline-node-pin" aria-hidden="true">
                    {renderStatusPinIcon(statusKey)}
                  </div>

                  <div className="timeline-header-row">
                    <h3 id={`req-title-${req.id}`} className="timeline-title">
                      {req.projectTitle}
                    </h3>
                    <StatusBadge status={statusKey} />
                  </div>

                  <div className="timeline-meta-chips">
                    <span>Instrument: <strong>{equipName}</strong></span>
                    <span>Stage: <span className="stage-pill">{req.projectStage}</span></span>
                    <span>Slot: <strong>{fmtDT(req.startAt)} – {fmtDT(req.endAt)}</strong></span>
                    <span>Project Deadline: <strong>{fmtDate(req.deadline)}</strong></span>
                  </div>

                  {decision && (
                    <DecisionPanel decision={decision} isPending={true} />
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Decided Requests Timeline ─────────────────────────────────── */}
      {myDecided.length > 0 && (
        <section aria-labelledby="decided-timeline-heading">
          <h2 id="decided-timeline-heading" className="page-title" style={{ fontSize: '1.4rem' }}>
            Confirmed History ({myDecided.length})
          </h2>

          <div className="booking-timeline" role="list" aria-label="Decided equipment requests">
            {myDecided.map(req => {
              const equip = equipment.find(e => e.id === req.equipmentId)
              const equipName = equip?.name ?? req.equipmentId

              return (
                <article
                  key={req.id}
                  className="timeline-entry"
                  role="listitem"
                  aria-labelledby={`decided-title-${req.id}`}
                >
                  <div className="timeline-node-pin" aria-hidden="true">
                    {renderStatusPinIcon(req.status)}
                  </div>

                  <div className="timeline-header-row">
                    <h3 id={`decided-title-${req.id}`} className="timeline-title">
                      {req.projectTitle}
                    </h3>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="timeline-meta-chips">
                    <span>Instrument: <strong>{equipName}</strong></span>
                    <span>Stage: <span className="stage-pill">{req.projectStage}</span></span>
                    <span>Slot: <strong>{fmtDT(req.startAt)} – {fmtDT(req.endAt)}</strong></span>
                    <span>Project Deadline: <strong>{fmtDate(req.deadline)}</strong></span>
                  </div>

                  {req.decision && (
                    <DecisionPanel decision={req.decision} isPending={false} />
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
