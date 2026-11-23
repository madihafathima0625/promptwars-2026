/**
 * @fileoverview Status badge component. Conveys status by text AND colour.
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  const labels = {
    pending:   'Pending',
    approved:  'Approved',
    rejected:  'Rejected',
    waitlist:  'Waitlisted',
    no_show:   'No-show',
    cancelled: 'Cancelled',
    invalid:   'Invalid',
    recommend_approve: 'Likely Approve',
    recommend_reject:  'Likely Reject',
  }

  const cssKey = status?.replace('recommend_', '') ?? 'pending'

  return (
    <span className={`badge badge-${cssKey}`} aria-label={`Status: ${labels[status] ?? status}`}>
      {labels[status] ?? status}
    </span>
  )
}
