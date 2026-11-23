/**
 * @fileoverview Accessible contest panel and ranked allocation table for a group of requests on one instrument.
 * Renders side-by-side / stacked contender cards with winner ribbons, factor scores,
 * and semantic table structure for auditability and screen readers.
 */

import StatusBadge from './StatusBadge.jsx'
import DecisionControls from './DecisionControls.jsx'

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
 * @param {Object} props
 * @param {import('../data/seed.js').Equipment} props.equipment
 * @param {Array<{
 *   request: import('../data/seed.js').Request,
 *   recommendation: import('../engine/allocate.js').Decision,
 *   studentName: string,
 *   capacityAvailable: boolean
 * }>} props.items
 * @param {(params: { request: import('../data/seed.js').Request, recommendation: import('../engine/allocate.js').Decision, action: 'approve'|'reject', overrideReason: string|null }) => void} props.onDecide
 */
export default function RankedTable({ equipment, items, onDecide }) {
  if (!items || items.length === 0) {
    return null
  }

  // Top-ranked item in this group to calculate score gaps
  const topItem = items[0]
  const winnerScore = topItem?.recommendation?.score ?? 0

  return (
    <section
      className="contest-panel"
      aria-labelledby={`contest-title-${equipment.id}`}
    >
      {/* Contest Header */}
      <div className="contest-panel-header">
        <div>
          <h3 id={`contest-title-${equipment.id}`} className="contest-panel-title">
            {equipment.name}
          </h3>
          <div className="contest-panel-meta">
            {equipment.department} · {equipment.lab} · Available units: <strong>{equipment.quantity}</strong> · Max session: <strong>{equipment.maxSessionHours}h</strong>
          </div>
        </div>
        <span className="stage-pill">
          {items.length} competing request{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Visual Contenders Grid */}
      <div className="contenders-grid" role="list" aria-label={`Competing contenders for ${equipment.name}`}>
        {items.map(({ request, recommendation, studentName, capacityAvailable }) => {
          const rank = recommendation?.rank ?? '-'
          const breakdown = recommendation?.breakdown ?? {}
          const alternatives = recommendation?.alternatives ?? []
          const isWinner = recommendation?.outcome === 'recommend_approve'
          const scoreGap = winnerScore - (recommendation?.score ?? 0)

          return (
            <article
              key={request.id}
              className={`contender-card ${isWinner ? 'contender-card-winner' : ''}`}
              role="listitem"
              aria-labelledby={`contender-student-${request.id}`}
            >
              {/* Header Badge */}
              <div className="contender-header-badge">
                <span className="contender-rank">#{rank}</span>
                {isWinner ? (
                  <span className="recommended-ribbon">★ Recommended</span>
                ) : (
                  scoreGap > 0 && <span className="gap-note">-{scoreGap} pts to #1</span>
                )}
                <StatusBadge status={recommendation?.outcome ?? 'pending'} />
              </div>

              {/* Contender Student & Project */}
              <div>
                <h4 id={`contender-student-${request.id}`} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-ink)' }}>
                  {studentName}
                </h4>
                <div className="meta-subtext">{request.studentId}</div>
              </div>

              {/* Score Row */}
              <div className="contender-score-row">
                <span className="contender-score-num">{recommendation?.score ?? 0}</span>
                <span className="score-hero-max">/ 100</span>
                <span className="stage-pill" style={{ marginLeft: 'auto' }}>{request.projectStage}</span>
              </div>

              {/* Factor Breakdown Chips */}
              <div className="timeline-meta-chips" style={{ fontSize: '0.8rem' }} aria-label="Score factor breakdown">
                <span>Urg: <strong>{breakdown.urgency ?? 0}/35</strong></span>
                <span>Stg: <strong>{breakdown.stage ?? 0}/20</strong></span>
                <span>Fair: <strong>{breakdown.fairness ?? 0}/30</strong></span>
                <span>Rel: <strong>{breakdown.reliability ?? 0}/15</strong></span>
              </div>

              {/* Project & Timing */}
              <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                <div><strong>Project:</strong> {request.projectTitle}</div>
                <div className="meta-subtext">Slot: {fmtDT(request.startAt)} – {fmtDT(request.endAt)}</div>
                <div className="meta-subtext">Deadline: {fmtDate(request.deadline)}</div>
              </div>

              {/* Engine Explanation */}
              {recommendation?.explanation && (
                <div className="explanation-callout">
                  <strong>Allocation Engine:</strong> {recommendation.explanation}
                </div>
              )}

              {/* Alternatives if available */}
              {alternatives.length > 0 && (
                <div className="alt-list" style={{ marginTop: 'var(--sp-xs)' }}>
                  {alternatives.map((alt, idx) => (
                    <div key={idx} className="alt-card">
                      {alt.type === 'next_slot' && (
                        <div>Next slot: <strong>{fmtDT(alt.startAt)} – {fmtDT(alt.endAt)}</strong></div>
                      )}
                      {alt.type === 'equivalent' && (
                        <div>Equivalent: <strong>{alt.name}</strong> ({alt.category})</div>
                      )}
                      {alt.type === 'waitlist_position' && (
                        <div>Waitlist position: <strong>#{alt.position}</strong></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Decision Action Controls */}
              <DecisionControls
                recommendation={recommendation}
                studentName={studentName}
                equipmentName={equipment.name}
                capacityAvailable={capacityAvailable}
                onDecide={({ action, overrideReason }) =>
                  onDecide({ request, recommendation, action, overrideReason })
                }
              />
            </article>
          )
        })}
      </div>

      {/* Semantic Accessible Table View */}
      <details className="disclosure" style={{ marginTop: 'var(--sp-lg)' }}>
        <summary>
          <span>View accessible tabular breakdown ({equipment.name})</span>
          <svg className="disclosure-arrow" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </summary>
        <div className="disclosure-body" style={{ padding: 0 }}>
          <div className="table-responsive" style={{ border: 'none', margin: 0 }}>
            <table className="data-table">
              <caption>Queue breakdown for {equipment.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Student</th>
                  <th scope="col">Project</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Slot</th>
                  <th scope="col">Score</th>
                  <th scope="col">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ request, recommendation, studentName }) => (
                  <tr key={request.id}>
                    <td>#{recommendation?.rank ?? '-'}</td>
                    <td>{studentName} ({request.studentId})</td>
                    <td>{request.projectTitle}</td>
                    <td>{request.projectStage}</td>
                    <td>{fmtDT(request.startAt)} – {fmtDT(request.endAt)}</td>
                    <td className="tabular-score">{recommendation?.score ?? 0} / 100</td>
                    <td><StatusBadge status={recommendation?.outcome ?? 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>
  )
}
