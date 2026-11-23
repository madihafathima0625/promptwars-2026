/**
 * @fileoverview LabLink allocation engine — request scoring.
 *
 * @typedef {Object} Request
 * @property {string} id
 * @property {string} studentId
 * @property {string} equipmentId
 * @property {string} projectTitle
 * @property {'capstone'|'mini-project'|'coursework'|'practice'} projectStage
 * @property {string} deadline  - ISO 8601
 * @property {string} startAt   - ISO 8601
 * @property {string} endAt     - ISO 8601
 * @property {string} createdAt - ISO 8601
 * @property {string} status
 *
 * @typedef {Object} History
 * @property {{ [studentId: string]: number }} approvedHoursLast30d
 * @property {{ [studentId: string]: number }} noShowsLast60d
 *
 * @typedef {Object} ScoringContext
 * @property {string|number|Date} now - current time (ISO string, ms, or Date)
 * @property {History} history
 *
 * @typedef {Object} ScoreBreakdown
 * @property {number} urgency
 * @property {number} stage
 * @property {number} fairness
 * @property {number} reliability
 *
 * @typedef {Object} ScoreInputs
 * @property {number} daysToDeadline
 * @property {number} approvedHours
 * @property {number} noShows
 *
 * @typedef {Object} ScoreResult
 * @property {number} total
 * @property {ScoreBreakdown} breakdown
 * @property {ScoreInputs} inputs
 */

import {
  URGENCY_BANDS,
  FAIRNESS_BANDS,
  STAGE_SCORES,
  RELIABILITY_BASE,
  RELIABILITY_DEDUCT_PER_NOSHOW,
  RELIABILITY_FLOOR,
} from './constants.js'

/**
 * Pick the score from an array of `{ maxDays|maxHours, score }` bands.
 * Bands must be sorted ascending by their limit; last band must be Infinity.
 *
 * @param {number} value
 * @param {Array<{maxDays?: number, maxHours?: number, score: number}>} bands
 * @param {'maxDays'|'maxHours'} key
 * @returns {number}
 */
function pickBand(value, bands, key) {
  for (const band of bands) {
    if (value <= band[key]) return band.score
  }
  return bands[bands.length - 1].score
}

/**
 * Score a single booking request.
 *
 * @param {Request} request
 * @param {ScoringContext} ctx
 * @returns {ScoreResult}
 */
export function scoreRequest(request, ctx) {
  const nowMs       = new Date(ctx.now).getTime()
  const deadlineMs  = new Date(request.deadline).getTime()
  const msPerDay    = 24 * 60 * 60 * 1000
  const daysToDeadline = Math.max(0, (deadlineMs - nowMs) / msPerDay)

  const urgency = pickBand(daysToDeadline, URGENCY_BANDS, 'maxDays')
  const stage   = STAGE_SCORES[request.projectStage] ?? 0

  const approvedHours = (ctx.history.approvedHoursLast30d ?? {})[request.studentId] ?? 0
  const fairness = pickBand(approvedHours, FAIRNESS_BANDS, 'maxHours')

  const noShows     = (ctx.history.noShowsLast60d ?? {})[request.studentId] ?? 0
  const reliability = Math.max(
    RELIABILITY_FLOOR,
    RELIABILITY_BASE - noShows * RELIABILITY_DEDUCT_PER_NOSHOW
  )

  return {
    total: urgency + stage + fairness + reliability,
    breakdown: { urgency, stage, fairness, reliability },
    inputs: { daysToDeadline, approvedHours, noShows },
  }
}
