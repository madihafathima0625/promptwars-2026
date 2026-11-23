/**
 * @fileoverview Decision controls (Approve / Reject) with capacity checks and override reason prompt.
 */

import { useState, useId } from 'react'
import { requiresOverrideReason } from '../data/decisions.js'

/**
 * @param {Object} props
 * @param {import('../engine/allocate.js').Decision} [props.recommendation]
 * @param {string} props.studentName
 * @param {string} props.equipmentName
 * @param {boolean} props.capacityAvailable
 * @param {(params: { action: 'approve'|'reject', overrideReason: string|null }) => void} props.onDecide
 */
export default function DecisionControls({
  recommendation,
  studentName,
  equipmentName,
  capacityAvailable,
  onDecide,
}) {
  const [activeAction, setActiveAction] = useState(null) // 'approve' | 'reject' | null
  const [overrideText, setOverrideText] = useState('')
  const [validationError, setValidationError] = useState('')
  const [capacityError, setCapacityError] = useState('')

  const baseId = useId()
  const reasonInputId = `${baseId}-reason`
  const errorId = `${baseId}-error`
  const hintId = `${baseId}-hint`
  const capErrorId = `${baseId}-cap-error`

  const approveLabel = `Approve ${studentName}'s request for ${equipmentName}`
  const rejectLabel = `Reject ${studentName}'s request for ${equipmentName}`

  function handleApproveClick() {
    setCapacityError('')
    setValidationError('')

    if (!capacityAvailable) {
      setCapacityError('Cannot approve: equipment has no remaining capacity for this time slot.')
      return
    }

    if (requiresOverrideReason(recommendation, 'approve')) {
      setActiveAction('approve')
      setOverrideText('')
    } else {
      onDecide({ action: 'approve', overrideReason: null })
    }
  }

  function handleRejectClick() {
    setCapacityError('')
    setValidationError('')

    if (requiresOverrideReason(recommendation, 'reject')) {
      setActiveAction('reject')
      setOverrideText('')
    } else {
      onDecide({ action: 'reject', overrideReason: null })
    }
  }

  function handleConfirmOverride(e) {
    e.preventDefault()
    const trimmed = overrideText.trim()
    if (trimmed.length < 5) {
      setValidationError('Override reason must be at least 5 characters long.')
      return
    }
    if (trimmed.length > 200) {
      setValidationError('Override reason must be at most 200 characters long.')
      return
    }

    onDecide({ action: activeAction, overrideReason: trimmed })
    setActiveAction(null)
    setOverrideText('')
    setValidationError('')
  }

  function handleCancelOverride() {
    setActiveAction(null)
    setOverrideText('')
    setValidationError('')
  }

  return (
    <div className="decision-controls">
      {capacityError && (
        <div id={capErrorId} className="control-error" role="alert">
          {capacityError}
        </div>
      )}

      {activeAction ? (
        <form className="override-form" onSubmit={handleConfirmOverride} noValidate>
          <div className={`field${validationError ? ' field-error' : ''}`}>
            <label htmlFor={reasonInputId}>
              Override reason for {activeAction} (5–200 characters):
            </label>
            <textarea
              id={reasonInputId}
              rows={2}
              value={overrideText}
              onChange={e => {
                setOverrideText(e.target.value)
                setValidationError('')
              }}
              aria-required="true"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? errorId : hintId}
              placeholder={`State why this request is being ${activeAction === 'approve' ? 'approved' : 'rejected'} contrary to engine recommendations...`}
            />
            <div id={hintId} className="field-hint">
              {overrideText.trim().length} / 200 characters (minimum 5)
            </div>
            {validationError && (
              <span id={errorId} className="field-error-msg" role="alert">
                {validationError}
              </span>
            )}
          </div>
          <div className="btn-group">
            <button
              type="submit"
              className={`btn btn-sm ${activeAction === 'approve' ? 'btn-primary' : 'btn-danger'}`}
              aria-label={`Confirm ${activeAction} override for ${studentName}'s request`}
            >
              Confirm {activeAction}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleCancelOverride}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleApproveClick}
            aria-label={approveLabel}
            disabled={!capacityAvailable}
            title={!capacityAvailable ? 'No capacity available for this slot' : approveLabel}
          >
            Approve
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleRejectClick}
            aria-label={rejectLabel}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
