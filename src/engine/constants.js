/**
 * @fileoverview LabLink allocation engine — scoring weights and thresholds.
 * All values exported as named constants so callsites are self-documenting.
 */

// ── Urgency /35 ─────────────────────────────────────────────────────────────
export const URGENCY_MAX = 35

/** days-to-deadline → urgency score */
export const URGENCY_BANDS = [
  { maxDays: 2,  score: 35 },
  { maxDays: 5,  score: 28 },
  { maxDays: 10, score: 20 },
  { maxDays: 20, score: 10 },
  { maxDays: Infinity, score: 5 },
]

// ── Stage /20 ────────────────────────────────────────────────────────────────
export const STAGE_MAX = 20

/** projectStage → stage score */
export const STAGE_SCORES = {
  capstone:    20,
  'mini-project': 14,
  coursework:   8,
  practice:     3,
}

// ── Fairness /30 (by approved hours in last 30 d) ───────────────────────────
export const FAIRNESS_MAX = 30

/** approved-hours-in-last-30d upper bound → fairness score */
export const FAIRNESS_BANDS = [
  { maxHours: 0,          score: 30 },
  { maxHours: 4,          score: 24 },
  { maxHours: 10,         score: 16 },
  { maxHours: 20,         score:  8 },
  { maxHours: Infinity,   score:  0 },
]

// ── Reliability /15 (by no-shows in last 60 d) ───────────────────────────────
export const RELIABILITY_MAX   = 15
export const RELIABILITY_BASE  = 15
export const RELIABILITY_DEDUCT_PER_NOSHOW = 5
export const RELIABILITY_FLOOR = 0

// ── Scoring total ────────────────────────────────────────────────────────────
export const SCORE_MAX = URGENCY_MAX + STAGE_MAX + FAIRNESS_MAX + RELIABILITY_MAX // 100

// ── Slot search ──────────────────────────────────────────────────────────────
/** Step size (ms) used when searching for the next free slot. */
export const NEXT_SLOT_STEP_MS = 60 * 60 * 1000 // 1 hour in milliseconds
