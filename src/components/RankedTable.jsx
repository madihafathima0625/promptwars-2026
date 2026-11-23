/**
 * @fileoverview Accessible ranked allocation table for a group of requests on one piece of equipment.
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

  // Identify the top-ranked item in this group to calculate loser gaps
  const topItem = items[0]
  const winnerScore = topItem?.recommendation?.score ?? 0

  return (
    <div
      className="table-responsive"
      tabIndex={0}
      role="region"
      aria-label={`Allocation queue for ${equipment.name}`}
    >
      <table className="data-table">
        <caption>
          Allocation Queue: <strong>{equipment.name}</strong> ({equipment.lab} · Qty: {equipment.quantity} · Max: {equipment.maxSessionHours}h)
        </caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Student</th>
            <th scope="col">Project</th>
            <th scope="col">Stage</th>
            <th scope="col">Deadline</th>
            <th scope="col">Score</th>
            <th scope="col">Breakdown</th>
            <th scope="col">Recommendation</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ request, recommendation, studentName, capacityAvailable }) => {
            const rank = recommendation?.rank ?? '-'
            const breakdown = recommendation?.breakdown ?? {}
            const alternatives = recommendation?.alternatives ?? []
            const isWinner = recommendation?.outcome === 'recommend_approve'
            const scoreGap = winnerScore - (recommendation?.score ?? 0)

            return (
              <tr key={request.id} className={isWinner ? 'table-row-recommended' : ''}>
                <th scope="row" className="cell-rank">
                  #{rank}
                </th>
                <td>
                  <strong>{studentName}</strong>
                  <div className="meta-subtext">{request.studentId}</div>
                </td>
                <td>
                  <strong>{request.projectTitle}</strong>
                  <div className="meta-subtext">
                    {fmtDT(request.startAt)} – {fmtDT(request.endAt)}
                  </div>
                </td>
                <td>
                  <span className="stage-pill">{request.projectStage}</span>
                </td>
                <td>{fmtDate(request.deadline)}</td>
                <td>
                  <span className="tabular-score">{recommendation?.score ?? 0}</span>
                  <span className="meta-subtext"> / 100</span>
                  {!isWinner && scoreGap > 0 && (
                    <div className="meta-subtext">(-{scoreGap} to #1)</div>
                  )}
                </td>
                <td>
                  <div className="factor-tag-group" aria-label="Score breakdown factors">
                    <span className="factor-tag" title="Urgency score (out of 35)">
                      Urg: {breakdown.urgency ?? 0}/35
                    </span>
                    <span className="factor-tag" title="Project stage score (out of 20)">
                      Stg: {breakdown.stage ?? 0}/20
                    </span>
                    <span className="factor-tag" title="Fairness score (out of 30)">
                      Fair: {breakdown.fairness ?? 0}/30
                    </span>
                    <span className="factor-tag" title="Reliability score (out of 15)">
                      Rel: {breakdown.reliability ?? 0}/15
                    </span>
                  </div>
                </td>
                <td>
                  <div className="btn-group">
                    <StatusBadge status={recommendation?.outcome ?? 'pending'} />
                    {isWinner && (
                      <span className="recommended-pill">Recommended</span>
                    )}
                  </div>
                  {recommendation?.explanation && (
                    <details className="inline-explanation">
                      <summary>Explain & options</summary>
                      <div className="inline-explanation-content">
                        <p>{recommendation.explanation}</p>
                        {alternatives.length > 0 && (
                          <div className="alt-preview">
                            <strong>Available alternatives:</strong>
                            <ul className="alt-preview-list">
                              {alternatives.map((alt, idx) => (
                                <li key={idx}>
                                  {alt.type === 'next_slot' && (
                                    <>Next slot: {fmtDT(alt.startAt)} – {fmtDT(alt.endAt)}</>
                                  )}
                                  {alt.type === 'equivalent' && (
                                    <>Equivalent: {alt.name} ({alt.category})</>
                                  )}
                                  {alt.type === 'waitlist_position' && (
                                    <>Waitlist position: #{alt.position}</>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </td>
                <td>
                  <DecisionControls
                    recommendation={recommendation}
                    studentName={studentName}
                    equipmentName={equipment.name}
                    capacityAvailable={capacityAvailable}
                    onDecide={({ action, overrideReason }) =>
                      onDecide({ request, recommendation, action, overrideReason })
                    }
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
