/**
 * @fileoverview Score breakdown disclosure panel with horizontal factor bars.
 *
 * @param {{
 *   decision: import('../engine/allocate.js').Decision,
 *   isPending: boolean
 * }} props
 */

const FACTOR_CONFIG = [
  { key: 'urgency',     label: 'Urgency',     max: 35 },
  { key: 'stage',       label: 'Stage',       max: 20 },
  { key: 'fairness',    label: 'Fairness',    max: 30 },
  { key: 'reliability', label: 'Reliability', max: 15 },
]

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

export default function DecisionPanel({ decision, isPending }) {
  if (!decision) return null

  const {
    score = 0,
    breakdown = {},
    rank,
    explanation,
    alternatives = [],
    decidedBy,
    decidedAt,
    overrideReason,
    recommendedOutcome,
    action,
  } = decision

  return (
    <details className="disclosure">
      <summary>
        <span>{isPending ? 'Why this recommendation?' : 'Decision breakdown & audit trail'}</span>
        <svg className="disclosure-arrow" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </summary>

      <div className="disclosure-body">
        {isPending ? (
          <div className="banner banner-info" role="note">
            Recommendation preview — computed live by the allocation engine. Final decision is confirmed by admin.
          </div>
        ) : (
          decidedBy && (
            <div className="meta-subtext">
              Decided by <strong>{decidedBy}</strong>
              {decidedAt ? ` on ${fmtDT(decidedAt)}` : ''}
              {action && ` (${action.toUpperCase()})`}
              {recommendedOutcome && (
                <span> · Recommendation was: <em>{recommendedOutcome}</em></span>
              )}
            </div>
          )
        )}

        {overrideReason && (
          <div className="banner banner-warn" role="note">
            <strong>Admin Override Reason:</strong> {overrideReason}
          </div>
        )}

        {/* Large Total Score Hero */}
        <div className="score-hero-display">
          <span className="score-hero-number">{score}</span>
          <span className="score-hero-max">/ 100</span>
          {rank > 0 && <span className="score-hero-rank">Engine Rank #{rank}</span>}
        </div>

        {/* Four Horizontal Factor Bars */}
        <div className="factor-bars-list" role="list" aria-label="Score factor breakdown">
          {FACTOR_CONFIG.map(({ key, label, max }) => {
            const val = breakdown[key] ?? 0
            const pct = Math.min(100, Math.max(0, (val / max) * 100))

            return (
              <div className="factor-bar-row" key={key} role="listitem">
                <span className="factor-bar-name">{label}</span>
                <div className="factor-bar-track">
                  <div
                    className={`factor-bar-fill factor-bar-fill-${key}`}
                    style={{ width: `${pct}%` }}
                    role="img"
                    aria-label={`${label}: ${val} of ${max} points`}
                  />
                </div>
                <span className="factor-bar-num">
                  {val} <span className="stat-chip-label">/{max}</span>
                </span>
              </div>
            )
          })}
        </div>

        {/* Engine Explanation */}
        {explanation && (
          <div className="explanation-callout">
            <strong>Reasoning:</strong> {explanation}
          </div>
        )}

        {/* Alternatives if present */}
        {alternatives.length > 0 && (
          <div className="alternatives-container">
            <div className="alternatives-title">Suggested alternatives</div>
            <ul className="alt-list">
              {alternatives.map((alt, i) => (
                <li className="alt-card" key={i}>
                  {alt.type === 'next_slot' && (
                    <>
                      <div className="alt-badge">Next available slot</div>
                      <div>{fmtDT(alt.startAt)} – {fmtDT(alt.endAt)}</div>
                    </>
                  )}
                  {alt.type === 'equivalent' && (
                    <>
                      <div className="alt-badge">Equivalent equipment</div>
                      <div>{alt.name} <span className="meta-subtext">({alt.category})</span></div>
                    </>
                  )}
                  {alt.type === 'waitlist_position' && (
                    <>
                      <div className="alt-badge">Waitlist</div>
                      <div>Queue position #{alt.position}</div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}
