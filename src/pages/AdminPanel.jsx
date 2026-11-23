/**
 * @fileoverview Admin Panel for LabLink with precision instrument styling.
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { allocate } from '../engine/allocate.js'
import { buildHistory } from '../data/history.js'
import { createDemoConflict, PERSONAS } from '../data/seed.js'
import { saveRequest, updateRequest, getState, getPersona } from '../data/store.js'
import { hasCapacity, buildDecisionRecord } from '../data/decisions.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RankedTable from '../components/RankedTable.jsx'

/**
 * @param {string} studentId
 * @returns {string}
 */
function getStudentName(studentId) {
  const p = PERSONAS.find(x => x.studentId === studentId)
  if (p) return p.name
  if (studentId === 'stu-asha') return 'Asha Krishnan'
  if (studentId === 'stu-ravi') return 'Ravi Sharma'
  if (studentId === 'stu-drrao') return 'Dr. Priya Rao'
  return studentId
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
 * @param {Object} props
 * @param {import('../data/seed.js').Request[]} [props.requests]
 * @param {import('../data/seed.js').Equipment[]} [props.equipment]
 * @param {import('../data/seed.js').Persona} [props.persona]
 * @param {() => void} [props.onStateChange]
 */
export default function AdminPanel({
  requests: propRequests,
  equipment: propEquipment,
  persona: propPersona,
  onStateChange,
}) {
  const activePersona = propPersona ?? getPersona()
  const currentRequests = propRequests ?? getState().requests
  const currentEquipment = propEquipment ?? getState().equipment

  const [notice, setNotice] = useState(null)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  // Current time obtained in the UI layer only
  const now = useMemo(() => new Date().toISOString(), [])

  // NOTE: This role check is client-side for demonstration purposes only.
  // In a production deployment, access control must be verified server-side
  // using institutional SSO tokens, session cookies, and role-based ACLs.
  const isAdmin = activePersona?.role === 'admin'

  // Partition requests
  const pendingRequests = useMemo(
    () => currentRequests.filter(r => r.status === 'pending'),
    [currentRequests]
  )

  const approvedRequests = useMemo(
    () => currentRequests.filter(r => r.status === 'approved'),
    [currentRequests]
  )

  const decidedRequests = useMemo(
    () => currentRequests.filter(r => r.status === 'approved' || r.status === 'rejected'),
    [currentRequests]
  )

  // Run allocation engine over all pending requests
  const { validByEquipment, invalidItems } = useMemo(() => {
    if (pendingRequests.length === 0) {
      return { validByEquipment: new Map(), invalidItems: [] }
    }

    const history = buildHistory(currentRequests, now)
    const decisions = allocate({
      requests: pendingRequests,
      equipment: currentEquipment,
      history,
      now,
    })

    const decMap = new Map(decisions.map(d => [d.requestId, d]))
    const validGroupMap = new Map()
    const invalidList = []

    for (const req of pendingRequests) {
      const dec = decMap.get(req.id)
      if (dec?.outcome === 'invalid') {
        invalidList.push({ request: req, decision: dec })
      } else {
        if (!validGroupMap.has(req.equipmentId)) {
          validGroupMap.set(req.equipmentId, [])
        }
        validGroupMap.get(req.equipmentId).push({
          request: req,
          recommendation: dec,
          studentName: getStudentName(req.studentId),
          capacityAvailable: hasCapacity(req, currentEquipment, approvedRequests),
        })
      }
    }

    // Sort items within each equipment group by engine rank
    for (const [, items] of validGroupMap) {
      items.sort((a, b) => (a.recommendation?.rank ?? 999) - (b.recommendation?.rank ?? 999))
    }

    return {
      validByEquipment: validGroupMap,
      invalidItems: invalidList,
    }
  }, [pendingRequests, currentRequests, currentEquipment, approvedRequests, now])

  // ── 1. Role-gate check ──────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <main id="main-content" className="app-main">
        <div className="page-header">
          <h1 className="page-title">Admin Access Required</h1>
          <p className="page-subtitle">This console is restricted to laboratory administrators.</p>
        </div>

        <div className="banner banner-warn" role="alert">
          <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          </svg>
          <div>
            <strong>Access Denied:</strong> Currently signed in as{' '}
            <strong>{activePersona ? activePersona.name : 'an unauthenticated user'}</strong>.
            Only administrator accounts (such as Dr. Priya Rao) may access the equipment allocation console.
          </div>
        </div>

        <div className="banner banner-info" role="note">
          <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="8" />
            <path d="M8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFFFFF" />
          </svg>
          <div>
            <em>Security Note:</em> This check is simulated on the client for this demo.
            Production systems would strictly enforce roles server-side using secure SSO authentication.
          </div>
        </div>

        <div className="mt-4">
          <Link to="/" className="btn btn-primary">
            Switch persona to Dr. Rao
          </Link>
        </div>
      </main>
    )
  }

  // ── 2. Action: Load Demo Conflict ───────────────────────────────────────
  function handleLoadDemoConflict() {
    const conflictReqs = createDemoConflict(new Date().toISOString())
    const existingIds = new Set(currentRequests.map(r => r.id))
    const alreadyLoaded = conflictReqs.some(cr => existingIds.has(cr.id))

    if (alreadyLoaded) {
      const msg = 'Demo conflict requests (Asha & Ravi competing for Oscilloscope) are already loaded in the queue.'
      setNotice({ type: 'warn', message: msg })
      setLiveAnnouncement(msg)
      return
    }

    for (const cr of conflictReqs) {
      saveRequest(cr)
    }
    onStateChange?.()

    const msg = 'Loaded demo conflict: Asha Krishnan and Ravi Sharma competing for Siglent SDS1202X-E Oscilloscope.'
    setNotice({ type: 'success', message: msg })
    setLiveAnnouncement(msg)
  }

  // ── 3. Action: Record Decision ──────────────────────────────────────────
  function handleDecide({ request, recommendation, action, overrideReason }) {
    const adminName = activePersona.name
    const decisionRecord = buildDecisionRecord({
      recommendation,
      action,
      adminName,
      now: new Date().toISOString(),
      overrideReason,
    })

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    updateRequest(request.id, {
      status: newStatus,
      decision: decisionRecord,
    })
    onStateChange?.()

    const studentName = getStudentName(request.studentId)
    const actionLabel = action === 'approve' ? 'Approved' : 'Rejected'
    const overrideLabel = overrideReason ? ` with override reason: "${overrideReason}"` : ''
    const announcement = `${actionLabel} ${studentName}'s request for "${request.projectTitle}"${overrideLabel}.`

    setNotice({ type: 'success', message: announcement })
    setLiveAnnouncement(announcement)
  }

  return (
    <main id="main-content" className="app-main">
      <div className="page-header">
        <h1 className="page-title">Equipment Allocation Console</h1>
        <p className="page-subtitle">
          Review fair allocation rankings, verify slot capacity, and issue explainable booking decisions.
        </p>
      </div>

      {/* Screen-reader live announcement region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Demo security disclaimer banner */}
      <div className="banner banner-info" role="note">
        <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="8" />
          <path d="M8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFFFFF" />
        </svg>
        <div>
          <strong>Demo mode:</strong> Roles and allocation state are simulated locally.
          Production enforces role-based access control and audit logging on an institutional server.
        </div>
      </div>

      {/* Notification banner */}
      {notice && (
        <div
          className={`banner ${notice.type === 'warn' ? 'banner-warn' : 'banner-success'}`}
          role="status"
        >
          <span>{notice.message}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm banner-dismiss-btn"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top action toolbar */}
      <div className="admin-toolbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleLoadDemoConflict}
        >
          ⚡ Load demo conflict
        </button>
        <span className="admin-toolbar-hint">
          Simulates competing requests from Asha and Ravi for the same single-unit oscilloscope.
        </span>
      </div>

      {/* ── Pending Queues by Equipment ──────────────────────────────────── */}
      <section aria-labelledby="pending-queues-heading">
        <h2 id="pending-queues-heading" className="section-heading">
          Pending Queues ({pendingRequests.length} requests awaiting decision)
        </h2>

        {validByEquipment.size === 0 && invalidItems.length === 0 ? (
          <div className="empty-state" role="status">
            <svg className="empty-state-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="empty-state-title">Queue clear</h3>
            <p className="empty-state-text">
              There are no pending equipment requests in the queue. Click &ldquo;Load demo conflict&rdquo; above to test contention.
            </p>
          </div>
        ) : (
          Array.from(validByEquipment.entries()).map(([equipmentId, items]) => {
            const equip = currentEquipment.find(e => e.id === equipmentId) ?? {
              id: equipmentId,
              name: equipmentId,
              lab: 'Lab',
              quantity: 1,
              maxSessionHours: 4,
            }

            return (
              <RankedTable
                key={equipmentId}
                equipment={equip}
                items={items}
                onDecide={handleDecide}
              />
            )
          })
        )}
      </section>

      {/* ── Invalid Requests Section ────────────────────────────────────── */}
      {invalidItems.length > 0 && (
        <section aria-labelledby="invalid-requests-heading">
          <h2 id="invalid-requests-heading" className="section-heading section-heading-danger">
            Invalid Requests ({invalidItems.length})
          </h2>
          <div className="banner banner-warn" role="note">
            <svg className="banner-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
            </svg>
            <span>
              The following requests failed engine hard constraints (such as past dates, exceeding session length, or ending past project deadline).
            </span>
          </div>

          <div className="card-grid">
            {invalidItems.map(({ request, decision }) => {
              const equip = currentEquipment.find(e => e.id === request.equipmentId)
              const studentName = getStudentName(request.studentId)

              return (
                <div key={request.id} className="card card-invalid">
                  <div className="card-invalid-header">
                    <strong>{request.projectTitle}</strong>
                    <StatusBadge status="invalid" />
                  </div>
                  <div className="meta-subtext">
                    Student: <strong>{studentName}</strong> ({request.studentId}) · Instrument: <strong>{equip?.name ?? request.equipmentId}</strong>
                  </div>
                  <div className="banner banner-danger">
                    <div>
                      <strong>Failed Constraints:</strong>
                      <ul className="invalid-reasons-list">
                        {(decision.reasons || []).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDecide({
                          request,
                          recommendation: decision,
                          action: 'reject',
                          overrideReason: null,
                        })
                      }
                      aria-label={`Reject invalid request from ${studentName}`}
                    >
                      Reject invalid request
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Decided Requests History ─────────────────────────────────────── */}
      <section aria-labelledby="decided-history-heading">
        <h2 id="decided-history-heading" className="section-heading">
          Decided Requests Audit Log ({decidedRequests.length})
        </h2>

        {decidedRequests.length === 0 ? (
          <p className="text-muted">No requests have been decided yet.</p>
        ) : (
          <div
            className="table-responsive"
            tabIndex={0}
            role="region"
            aria-label="Audit log of decided requests"
          >
            <table className="data-table">
              <caption>Audit log of approved and rejected lab equipment bookings</caption>
              <thead>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col">Student</th>
                  <th scope="col">Equipment</th>
                  <th scope="col">Project</th>
                  <th scope="col">Session Time</th>
                  <th scope="col">Score</th>
                  <th scope="col">Decided By</th>
                  <th scope="col">Override Reason</th>
                </tr>
              </thead>
              <tbody>
                {decidedRequests.map(req => {
                  const equip = currentEquipment.find(e => e.id === req.equipmentId)
                  const studentName = getStudentName(req.studentId)
                  const dec = req.decision

                  return (
                    <tr key={req.id}>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <strong>{studentName}</strong>
                        <div className="meta-subtext">{req.studentId}</div>
                      </td>
                      <td>{equip?.name ?? req.equipmentId}</td>
                      <td>
                        <strong>{req.projectTitle}</strong>
                        <div className="meta-subtext">Stage: {req.projectStage}</div>
                      </td>
                      <td>
                        {fmtDT(req.startAt)} – {fmtDT(req.endAt)}
                      </td>
                      <td>
                        {dec?.score != null ? (
                          <span className="tabular-score">{dec.score} / 100</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <strong>{dec?.decidedBy || 'Admin'}</strong>
                        {dec?.decidedAt && (
                          <div className="meta-subtext">{fmtDT(dec.decidedAt)}</div>
                        )}
                      </td>
                      <td>
                        {dec?.overrideReason ? (
                          <span className="override-audit-pill" title={dec.overrideReason}>
                            ⚠️ {dec.overrideReason}
                          </span>
                        ) : (
                          <span className="text-muted">Standard approval</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
