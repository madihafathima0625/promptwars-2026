/**
 * @fileoverview LabLink allocation engine — core allocate() function.
 *
 * @typedef {import('./scoring.js').Request}  Request
 * @typedef {import('./scoring.js').History}  History
 *
 * @typedef {Object} Equipment
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} lab
 * @property {number} quantity
 * @property {number} maxSessionHours
 *
 * @typedef {Object} AlternativeNextSlot
 * @property {'next_slot'} type
 * @property {string} startAt
 * @property {string} endAt
 *
 * @typedef {Object} AlternativeEquivalent
 * @property {'equivalent'} type
 * @property {string} equipmentId
 * @property {string} name
 * @property {string} category
 *
 * @typedef {AlternativeNextSlot|AlternativeEquivalent} Alternative
 *
 * @typedef {Object} Decision
 * @property {string}  requestId
 * @property {'recommend_approve'|'recommend_reject'|'waitlist'|'invalid'} outcome
 * @property {number}  score
 * @property {import('./scoring.js').ScoreBreakdown} breakdown
 * @property {number}  rank
 * @property {Alternative[]} alternatives
 * @property {string}  explanation
 * @property {string[]} reasons
 *
 * @typedef {Object} AllocateInput
 * @property {Request[]}   requests
 * @property {Equipment[]} equipment
 * @property {History}     history
 * @property {string}      now  - ISO 8601
 */

import { scoreRequest } from './scoring.js'
import { explainDecision } from './explain.js'
import { NEXT_SLOT_STEP_MS } from './constants.js'

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate a request against hard constraints.
 * Returns an empty array if valid; otherwise an array of plain-language reasons.
 *
 * @param {Request}   request
 * @param {Equipment|undefined} equip
 * @param {string}    now - ISO 8601
 * @returns {string[]}
 */
function validateRequest(request, equip, now) {
  const reasons = []
  if (!equip) {
    reasons.push(`Equipment "${request.equipmentId}" does not exist.`)
    return reasons // further checks need equip; bail early
  }

  const startMs    = new Date(request.startAt).getTime()
  const endMs      = new Date(request.endAt).getTime()
  const deadlineMs = new Date(request.deadline).getTime()
  const nowMs      = new Date(now).getTime()
  const sessionHours = (endMs - startMs) / (3600 * 1000)

  if (endMs <= startMs)
    reasons.push(`Session end (${request.endAt}) must be after start (${request.startAt}).`)
  if (startMs < nowMs)
    reasons.push(`Session start (${request.startAt}) must not be in the past.`)
  if (endMs > deadlineMs)
    reasons.push(`Session end (${request.endAt}) exceeds the project deadline (${request.deadline}).`)
  if (sessionHours > equip.maxSessionHours)
    reasons.push(
      `Session length (${sessionHours.toFixed(2)} h) exceeds the equipment maximum of ${equip.maxSessionHours} h.`
    )
  return reasons
}

// ── Overlap helpers ──────────────────────────────────────────────────────────

/**
 * True when two intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 *
 * @param {number} aStart @param {number} aEnd
 * @param {number} bStart @param {number} bEnd
 * @returns {boolean}
 */
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

/**
 * Count how many already-approved bookings for a given equipment overlap the
 * proposed slot [startMs, endMs).
 *
 * @param {string}     equipmentId
 * @param {number}     startMs
 * @param {number}     endMs
 * @param {Decision[]} approved  - decisions already committed as recommend_approve
 * @param {Request[]}  requests  - original request list (for id→slot lookup)
 * @returns {number}
 */
function countOverlap(equipmentId, startMs, endMs, approved, requests) {
  const reqById = new Map(requests.map(r => [r.id, r]))
  let count = 0
  for (const dec of approved) {
    const req = reqById.get(dec.requestId)
    if (!req || req.equipmentId !== equipmentId) continue
    const s = new Date(req.startAt).getTime()
    const e = new Date(req.endAt).getTime()
    if (overlaps(startMs, endMs, s, e)) count++
  }
  return count
}

// ── Alternative finders ──────────────────────────────────────────────────────

/**
 * Find the earliest free next_slot alternative for a losing request.
 * Steps forward in 1-hour increments from the original startAt, keeping
 * the same session duration, up to deadline.
 *
 * @param {Request}    request
 * @param {Equipment}  equip
 * @param {Decision[]} approved
 * @param {Request[]}  requests
 * @returns {AlternativeNextSlot|null}
 */
function findNextSlot(request, equip, approved, requests) {
  const duration   = new Date(request.endAt).getTime() - new Date(request.startAt).getTime()
  const deadlineMs = new Date(request.deadline).getTime()
  let candidateStart = new Date(request.startAt).getTime()

  while (candidateStart + duration <= deadlineMs) {
    const candidateEnd = candidateStart + duration
    const used = countOverlap(equip.id, candidateStart, candidateEnd, approved, requests)
    if (used < equip.quantity) {
      return {
        type: 'next_slot',
        startAt: new Date(candidateStart).toISOString(),
        endAt:   new Date(candidateEnd).toISOString(),
      }
    }
    candidateStart += NEXT_SLOT_STEP_MS
  }
  return null
}

/**
 * Find an equivalent piece of equipment (same category, different id) with
 * free capacity in the original slot.
 *
 * @param {Request}    request
 * @param {Equipment}  equip
 * @param {Equipment[]} allEquipment
 * @param {Decision[]} approved
 * @param {Request[]}  requests
 * @returns {AlternativeEquivalent|null}
 */
function findEquivalent(request, equip, allEquipment, approved, requests) {
  const startMs = new Date(request.startAt).getTime()
  const endMs   = new Date(request.endAt).getTime()

  for (const candidate of allEquipment) {
    if (candidate.id === equip.id) continue
    if (candidate.category !== equip.category) continue
    const used = countOverlap(candidate.id, startMs, endMs, approved, requests)
    if (used < candidate.quantity) {
      return {
        type:        'equivalent',
        equipmentId: candidate.id,
        name:        candidate.name,
        category:    candidate.category,
      }
    }
  }
  return null
}

// ── Main allocate ─────────────────────────────────────────────────────────────

/**
 * Run the fair allocation algorithm over a set of requests.
 *
 * Rules:
 * 1. Only 'pending' requests are considered; others pass through as-is with
 *    outcome 'invalid' and a note.
 * 2. Hard constraints are checked; failures → outcome 'invalid'.
 * 3. Valid requests are grouped by equipmentId and sorted by:
 *    total DESC, createdAt ASC, id ASC (deterministic tie-break).
 * 4. Walking in that order: approve if overlapping already-approved count
 *    < equipment.quantity; otherwise the request loses.
 * 5. Losers get alternatives searched in priority order:
 *    (a) next_slot → outcome 'recommend_reject'
 *    (b) equivalent equipment → outcome 'recommend_reject'
 *    (c) waitlist (position within the loser pool for that equipment)
 *
 * @param {AllocateInput} input
 * @returns {Decision[]}
 */
export function allocate({ requests, equipment, history, now }) {
  // Build equipment lookup
  const equipById = new Map(equipment.map(e => [e.id, e]))

  // We'll accumulate approved decisions as we go
  const approved = []

  // Waitlist position counter per equipment
  const waitlistPos = {}

  // ── 1. Separate non-pending ──────────────────────────────────────────────
  const pending    = []
  const nonPending = []
  for (const req of requests) {
    if (req.status === 'pending') pending.push(req)
    else nonPending.push(req)
  }

  // ── 2. Validate pending requests ─────────────────────────────────────────
  const valid   = []
  const invalid = []
  for (const req of pending) {
    const equip   = equipById.get(req.equipmentId)
    const reasons = validateRequest(req, equip, now)
    if (reasons.length > 0) {
      invalid.push({ req, reasons })
    } else {
      const scored = scoreRequest(req, { now, history })
      valid.push({ req, scored })
    }
  }

  // ── 3. Group valid by equipmentId, sort deterministically ────────────────
  const groups = new Map()
  for (const item of valid) {
    const eid = item.req.equipmentId
    if (!groups.has(eid)) groups.set(eid, [])
    groups.get(eid).push(item)
  }
  for (const group of groups.values()) {
    group.sort((a, b) => {
      if (b.scored.total !== a.scored.total) return b.scored.total - a.scored.total
      const tA = new Date(a.req.createdAt).getTime()
      const tB = new Date(b.req.createdAt).getTime()
      if (tA !== tB) return tA - tB
      return a.req.id < b.req.id ? -1 : a.req.id > b.req.id ? 1 : 0
    })
  }

  // ── 4. Walk groups and assign winners / losers ────────────────────────────
  const winnerDecisions = []  // approved decisions
  const loserItems      = []  // { req, scored, rank }

  // Track per-equipment rank (position in sorted group)
  for (const [, group] of groups) {
    let rank = 0
    for (const item of group) {
      rank++
      const { req, scored } = item
      const equip   = equipById.get(req.equipmentId)
      const startMs = new Date(req.startAt).getTime()
      const endMs   = new Date(req.endAt).getTime()
      const used    = countOverlap(equip.id, startMs, endMs, approved, requests)

      if (used < equip.quantity) {
        const dec = {
          requestId:   req.id,
          outcome:     'recommend_approve',
          score:       scored.total,
          breakdown:   scored.breakdown,
          rank,
          alternatives: [],
          explanation: '',
          reasons:     [],
        }
        approved.push(dec)
        winnerDecisions.push({ dec, req, scored })
      } else {
        loserItems.push({ req, scored, rank })
      }
    }
  }

  // ── 5. Build winner decisions with explanations ───────────────────────────
  const finalDecisions = []

  for (const { dec, req, scored } of winnerDecisions) {
    dec.explanation = explainDecision('winner', { scored })
    finalDecisions.push(dec)
  }

  // ── 6. Build loser decisions ──────────────────────────────────────────────
  // Find the top winner for each equipment group (for loser explanation)
  const topWinnerByEquip = new Map()
  for (const { dec, req } of winnerDecisions) {
    if (!topWinnerByEquip.has(req.equipmentId)) {
      topWinnerByEquip.set(req.equipmentId, dec)
    }
  }

  for (const { req, scored, rank } of loserItems) {
    const equip       = equipById.get(req.equipmentId)
    const topWinner   = topWinnerByEquip.get(req.equipmentId)

    const nextSlot  = findNextSlot(req, equip, approved, requests)
    const equivalent = !nextSlot ? findEquivalent(req, equip, equipment, approved, requests) : null

    let outcome
    const alternatives = []

    if (nextSlot) {
      outcome = 'recommend_reject'
      alternatives.push(nextSlot)
    } else if (equivalent) {
      outcome = 'recommend_reject'
      alternatives.push(equivalent)
    } else {
      outcome = 'waitlist'
      waitlistPos[equip.id] = (waitlistPos[equip.id] ?? 0) + 1
      alternatives.push({ type: 'waitlist_position', position: waitlistPos[equip.id] })
    }

    const explanation = explainDecision('loser', {
      scored,
      topWinnerScore: topWinner ? topWinner.score : null,
      topWinnerBreakdown: topWinner ? topWinner.breakdown : null,
    })

    finalDecisions.push({
      requestId:   req.id,
      outcome,
      score:       scored.total,
      breakdown:   scored.breakdown,
      rank,
      alternatives,
      explanation,
      reasons: [],
    })
  }

  // ── 7. Invalid decisions ──────────────────────────────────────────────────
  for (const { req, reasons } of invalid) {
    finalDecisions.push({
      requestId:   req.id,
      outcome:     'invalid',
      score:       0,
      breakdown:   { urgency: 0, stage: 0, fairness: 0, reliability: 0 },
      rank:        0,
      alternatives: [],
      explanation: explainDecision('invalid', { reasons }),
      reasons,
    })
  }

  // Non-pending pass-through (not counted as allocation decisions)
  for (const req of nonPending) {
    finalDecisions.push({
      requestId:   req.id,
      outcome:     'invalid',
      score:       0,
      breakdown:   { urgency: 0, stage: 0, fairness: 0, reliability: 0 },
      rank:        0,
      alternatives: [],
      explanation: `Request is not pending (status: "${req.status}").`,
      reasons:     [`Request is not pending (status: "${req.status}").`],
    })
  }

  return finalDecisions
}
