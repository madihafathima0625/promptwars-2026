/**
 * @fileoverview Score breakdown disclosure panel for the allocation engine output.
 *
 * @param {{
 *   decision: import('../engine/allocate.js').Decision,
 *   isPending: boolean
 * }} props
 */
export default function DecisionPanel({ decision, isPending }) {
  if (!decision) return null

  const { score, breakdown, rank, explanation, alternatives } = decision

  return (
    <details className="disclosure">
      <summary>
        <span>Why this decision?</span>
        <span className="disclosure-arrow" aria-hidden="true">▼</span>
      </summary>
      <div className="disclosure-body">
        {isPending && (
          <p className="preview-notice" role="note">
            Recommendation preview — not final until an admin decides.
          </p>
        )}

        <div className="score-total">
          Total score: <span style={{ color: 'var(--c-accent)' }}>{score}</span> / 100
          {rank > 0 && <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}> · Rank #{rank}</span>}
        </div>

        <div className="score-grid" role="list" aria-label="Score breakdown">
          {Object.entries(breakdown).map(([factor, value]) => (
            <div className="score-item" key={factor} role="listitem">
              <div className="score-label">{factor}</div>
              <div className="score-val">{value}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.875rem', marginBottom: 'var(--sp-4)' }}>
          <strong>Engine explanation:</strong> {explanation}
        </p>

        {alternatives && alternatives.length > 0 && (
          <section>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
              Suggested alternatives
            </h3>
            <ul className="alt-list">
              {alternatives.map((alt, i) => (
                <li className="alt-item" key={i}>
                  {alt.type === 'next_slot' && (
                    <>
                      <div className="alt-type">Next available slot</div>
                      <div>
                        {fmtDT(alt.startAt)} – {fmtDT(alt.endAt)}
                      </div>
                    </>
                  )}
                  {alt.type === 'equivalent' && (
                    <>
                      <div className="alt-type">Equivalent equipment</div>
                      <div>{alt.name} <span style={{ color: 'var(--c-text-muted)' }}>({alt.category})</span></div>
                    </>
                  )}
                  {alt.type === 'waitlist_position' && (
                    <>
                      <div className="alt-type">Waitlist position</div>
                      <div>#{alt.position} in queue</div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </details>
  )
}

/** @param {string} iso */
function fmtDT(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}
