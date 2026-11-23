/**
 * @fileoverview Accessible status badge with inline SVG icon and clear text.
 *
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
  const text = labels[status] ?? status

  function renderIcon() {
    if (status === 'approved' || status === 'recommend_approve') {
      return (
        <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
        </svg>
      )
    }

    if (status === 'rejected' || status === 'recommend_reject') {
      return (
        <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      )
    }

    if (status === 'waitlist') {
      return (
        <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-4.5a.75.75 0 0 1 .75.75v3.5l2.25 1.5a.75.75 0 1 1-.832 1.248l-2.668-1.78A.75.75 0 0 1 7.25 8V4.25A.75.75 0 0 1 8 3.5Z" />
        </svg>
      )
    }

    if (status === 'invalid') {
      return (
        <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
      )
    }

    // Default: pending / clock
    return (
      <svg className="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5a.75.75 0 0 1-.22.53l-2 2a.75.75 0 0 1-1.06-1.06L7 7.94V4.75a.75.75 0 0 1 1.5 0Z" />
      </svg>
    )
  }

  return (
    <span className={`badge badge-${cssKey}`} aria-label={`Status: ${text}`}>
      {renderIcon()}
      <span>{text}</span>
    </span>
  )
}
