/**
 * @fileoverview My Requests page displaying pending allocations and decided booking history.
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

  // Run the allocator over ALL pending requests to produce previews (unconditional hook)
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
          <svg className="empty-state-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
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
          <svg className="empty-state-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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
        <h1 className="page-title">My Requests</h1>
        <p className="page-subtitle">
          Showing {myRequests.length} request{myRequests.length !== 1 ? 's' : ''} for {persona.name}.
        </p>
      </div>

      {myPending.length > 0 && (
        <section aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="page-title">
            Pending Allocation Previews ({myPending.length})
          </h2>
          <div className="banner banner-info" role="note">
            <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
              <circle cx="8" cy="8" r="8" />
              <path d="M8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFFFFF" />
            </svg>
            <span>
              <strong>Recommendation preview (not final until an admin decides):</strong> Scores below are computed by the Fair Allocation Engine in real time.
            </span>
          </div>

          <div>
            {myPending.map(req => {
              const decision = decisionMap[req.id]
              const equipName = equipment.find(e => e.id === req.equipmentId)?.name ?? req.equipmentId

              return (
                <article className="request-item" key={req.id}>
                  <div className="request-header">
                    <h3 className="request-title">{req.projectTitle}</h3>
                    {decision ? (
                      <StatusBadge status={decision.outcome} />
                    ) : (
                      <StatusBadge status="pending" />
                    )}
                  </div>
                  <div className="request-meta">
                    <span>Instrument: <strong>{equipName}</strong></span>
                    <span>Stage: <span className="stage-pill">{req.projectStage}</span></span>
                    <span>Session: {fmtDT(req.startAt)} – {fmtDT(req.endAt)}</span>
                    <span>Deadline: {fmtDate(req.deadline)}</span>
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

      {myDecided.length > 0 && (
        <section aria-labelledby="decided-heading">
          <h2 id="decided-heading" className="page-title">
            Decided Requests ({myDecided.length})
          </h2>
          <div>
            {myDecided.map(req => {
              const equipName = equipment.find(e => e.id === req.equipmentId)?.name ?? req.equipmentId

              return (
                <article className="request-item" key={req.id}>
                  <div className="request-header">
                    <h3 className="request-title">{req.projectTitle}</h3>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="request-meta">
                    <span>Instrument: <strong>{equipName}</strong></span>
                    <span>Stage: <span className="stage-pill">{req.projectStage}</span></span>
                    <span>Session: {fmtDT(req.startAt)} – {fmtDT(req.endAt)}</span>
                    <span>Deadline: {fmtDate(req.deadline)}</span>
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
