/**
 * @fileoverview My Requests page ( /requests ).
 * Shows pending requests with live allocation preview, and decided requests
 * with their final stored status.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { allocate } from '../engine/allocate.js'
import { buildHistory } from '../data/history.js'
import StatusBadge from '../components/StatusBadge.jsx'
import DecisionPanel from '../components/DecisionPanel.jsx'

/** @param {string} iso */
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return iso }
}
/** @param {string} iso */
function fmtDT(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
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

  // Guard against null persona after all hooks are evaluated
  if (!persona) {
    return (
      <main id="main-content" className="app-main">
        <div className="page-header">
          <h1>My Requests</h1>
        </div>
        <div className="empty-state" role="status">
          <span aria-hidden="true" style={{ fontSize: '2rem' }}>👤</span>
          <p>Please select a student persona to view your requests.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--sp-5)' }}>
            Choose persona
          </Link>
        </div>
      </main>
    )
  }

  // Separate mine into pending vs decided
  const myPending  = myRequests.filter(r => r.status === 'pending')
  const myDecided  = myRequests.filter(r => r.status !== 'pending')

  if (myRequests.length === 0) {
    return (
      <main id="main-content" className="app-main">
        <div className="page-header">
          <h1>My Requests</h1>
        </div>
        <div className="empty-state" role="status">
          <span aria-hidden="true" style={{ fontSize: '2rem' }}>📋</span>
          <p>You have not submitted any requests yet.</p>
          <Link to="/discover" className="btn btn-primary" style={{ marginTop: 'var(--sp-5)' }}>
            Browse equipment
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="app-main">
      <div className="page-header">
        <h1>My Requests</h1>
        <p>Showing {myRequests.length} request{myRequests.length !== 1 ? 's' : ''} for {persona.name}.</p>
      </div>

      {myPending.length > 0 && (
        <section aria-labelledby="pending-heading">
          <h2 id="pending-heading" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--sp-5)' }}>
            Pending — allocation preview
          </h2>
          <div className="banner banner-info" role="note">
            Scores below are computed by the Fair Allocation Engine in real time.
            They are a preview only — a lab admin makes the final decision.
          </div>

          <div style={{ marginTop: 'var(--sp-5)' }}>
            {myPending.map(req => {
              const decision = decisionMap[req.id]
              const equipName = equipment.find(e => e.id === req.equipmentId)?.name ?? req.equipmentId
              return (
                <article className="request-item" key={req.id}>
                  <div className="request-header">
                    <div className="request-title">{req.projectTitle}</div>
                    {decision
                      ? <StatusBadge status={decision.outcome} />
                      : <StatusBadge status="pending" />
                    }
                  </div>
                  <div className="request-meta">
                    <span>Equipment: <strong>{equipName}</strong></span>
                    <span>Stage: <strong>{req.projectStage}</strong></span>
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
        <section aria-labelledby="decided-heading" style={{ marginTop: 'var(--sp-10)' }}>
          <h2 id="decided-heading" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--sp-5)' }}>
            Decided requests
          </h2>
          <div>
            {myDecided.map(req => {
              const equipName = equipment.find(e => e.id === req.equipmentId)?.name ?? req.equipmentId
              return (
                <article className="request-item" key={req.id}>
                  <div className="request-header">
                    <div className="request-title">{req.projectTitle}</div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="request-meta">
                    <span>Equipment: <strong>{equipName}</strong></span>
                    <span>Stage: <strong>{req.projectStage}</strong></span>
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
