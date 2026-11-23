/**
 * @fileoverview Pure helper functions for admin equipment allocation decisions.
 *
 * @typedef {import('./seed.js').Request} Request
 * @typedef {import('./seed.js').Equipment} Equipment
 * @typedef {import('../engine/allocate.js').Decision} Decision
 *
 * @typedef {Object} DecisionRecord
 * @property {number} score
 * @property {import('../engine/scoring.js').ScoreBreakdown} breakdown
 * @property {number} rank
 * @property {string} explanation
 * @property {string|null} recommendedOutcome
 * @property {'approve'|'reject'} action
 * @property {string} decidedBy
 * @property {string} decidedAt
 * @property {string|null} overrideReason
 */

/**
 * Check if approving this request keeps overlapping approved requests
 * below equipment.quantity at every moment of its requested slot.
 *
 * Intervals are treated as half-open: [startAt, endAt).
 *
 * @param {Request} request - The request to test for capacity
 * @param {Equipment|Equipment[]} equipment - Target equipment or full equipment list
 * @param {Request[]} approvedRequests - Currently approved requests
 * @returns {boolean} True if capacity exists at all moments in the slot
 */
export function hasCapacity(request, equipment, approvedRequests = []) {
  if (!request || !equipment) return false

  const equip = Array.isArray(equipment)
    ? equipment.find(e => e.id === request.equipmentId)
    : equipment

  if (!equip || typeof equip.quantity !== 'number' || equip.quantity <= 0) {
    return false
  }

  const reqStart = new Date(request.startAt).getTime()
  const reqEnd   = new Date(request.endAt).getTime()

  if (Number.isNaN(reqStart) || Number.isNaN(reqEnd) || reqEnd <= reqStart) {
    return false
  }

  // Find all approved requests for this equipment that overlap [reqStart, reqEnd)
  const overlapping = (approvedRequests || []).filter(r => {
    if (!r || r.id === request.id) return false
    if (r.equipmentId !== equip.id) return false
    if (r.status !== undefined && r.status !== 'approved') return false

    const s = new Date(r.startAt).getTime()
    const e = new Date(r.endAt).getTime()
    if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return false

    // Overlap: reqStart < e && s < reqEnd
    return reqStart < e && s < reqEnd
  })

  if (overlapping.length === 0) {
    return true
  }

  // Active concurrency can only increase at reqStart or when an overlapping request starts.
  // Evaluate active concurrent count at each critical point t in [reqStart, reqEnd).
  const checkPoints = new Set([reqStart])
  for (const r of overlapping) {
    const s = new Date(r.startAt).getTime()
    if (s >= reqStart && s < reqEnd) {
      checkPoints.add(s)
    }
  }

  for (const t of checkPoints) {
    let count = 0
    for (const r of overlapping) {
      const s = new Date(r.startAt).getTime()
      const e = new Date(r.endAt).getTime()
      if (s <= t && t < e) {
        count++
      }
    }
    // If concurrent approved count is already >= quantity, capacity would be exceeded
    if (count >= equip.quantity) {
      return false
    }
  }

  return true
}

/**
 * Determine if an admin action overrides the engine recommendation,
 * thereby requiring an explicit override reason.
 *
 * Rules:
 * - action === 'approve' but recommendation outcome is not 'recommend_approve'
 * - action === 'reject' but recommendation outcome is 'recommend_approve'
 *
 * @param {Decision|null|undefined} recommendation
 * @param {'approve'|'reject'} action
 * @returns {boolean}
 */
export function requiresOverrideReason(recommendation, action) {
  const outcome = recommendation?.outcome

  if (action === 'approve') {
    return outcome !== 'recommend_approve'
  }

  if (action === 'reject') {
    return outcome === 'recommend_approve'
  }

  return false
}

/**
 * Build a frozen decision snapshot record for storage on a decided request.
 *
 * @param {Object} params
 * @param {Decision|null|undefined} [params.recommendation] - Engine recommendation
 * @param {'approve'|'reject'} params.action - Admin action taken
 * @param {string} params.adminName - Name of the administrator
 * @param {string|Date} params.now - Current time
 * @param {string|null|undefined} [params.overrideReason] - Required if overriding recommendation
 * @returns {DecisionRecord}
 */
export function buildDecisionRecord({
  recommendation,
  action,
  adminName,
  now,
  overrideReason,
}) {
  const decidedAt = typeof now === 'string' ? now : new Date(now).toISOString()

  const defaultBreakdown = { urgency: 0, stage: 0, fairness: 0, reliability: 0 }
  const breakdown = recommendation?.breakdown
    ? { ...recommendation.breakdown }
    : defaultBreakdown

  return {
    score: recommendation?.score ?? 0,
    breakdown,
    rank: recommendation?.rank ?? 0,
    explanation: recommendation?.explanation ?? '',
    recommendedOutcome: recommendation?.outcome ?? null,
    action,
    decidedBy: adminName ?? 'Admin',
    decidedAt,
    overrideReason: overrideReason ? overrideReason.trim() : null,
  }
}
