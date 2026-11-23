/**
 * @fileoverview Client-side request input validation.
 * Mirrors the engine's hard constraints plus UI-specific field rules.
 *
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {{ [field: string]: string }} errors - field name → error message
 */

const ALLOWED_STAGES = ['capstone', 'mini-project', 'coursework', 'practice']
const MIN_TITLE_LEN  = 3
const MAX_TITLE_LEN  = 80

/**
 * Validate a request form input before submission.
 *
 * Hard constraints (matching the engine):
 * - equipment must exist
 * - endAt > startAt
 * - startAt >= now
 * - endAt <= deadline
 * - session length <= equipment.maxSessionHours
 *
 * UI-only constraints:
 * - projectTitle: 3–80 chars (trimmed)
 * - projectStage: one of the four allowed values
 * - all date fields must be valid dates
 *
 * Supports both signatures:
 *   validateRequestInput(input, equipment, now)
 *   validateRequestInput(input, equipment, equipmentId, now)
 *
 * @param {Object} input
 * @param {string} input.projectTitle
 * @param {string} input.projectStage
 * @param {string} input.deadline    - ISO string or YYYY-MM-DD date string
 * @param {string} input.startAt     - ISO string or datetime-local
 * @param {string} input.endAt       - ISO string or datetime-local
 * @param {string} [input.equipmentId]
 * @param {import('./seed.js').Equipment[]} equipment
 * @param {string} [equipmentIdOrNow]
 * @param {string} [maybeNow]
 * @returns {ValidationResult}
 */
export function validateRequestInput(input, equipment, equipmentIdOrNow, maybeNow) {
  /** @type {{ [field: string]: string }} */
  const errors = {}

  let targetEquipId = input?.equipmentId
  let now = equipmentIdOrNow
  if (typeof equipmentIdOrNow === 'string' && maybeNow !== undefined) {
    targetEquipId = equipmentIdOrNow
    now = maybeNow
  }

  // ── projectTitle ──────────────────────────────────────────────────────────
  const title = (input?.projectTitle ?? '').trim()
  if (title.length < MIN_TITLE_LEN) {
    errors.projectTitle = `Project title must be at least ${MIN_TITLE_LEN} characters.`
  } else if (title.length > MAX_TITLE_LEN) {
    errors.projectTitle = `Project title must be at most ${MAX_TITLE_LEN} characters.`
  }

  // ── projectStage ──────────────────────────────────────────────────────────
  if (!ALLOWED_STAGES.includes(input?.projectStage)) {
    errors.projectStage = 'Please select a valid project stage.'
  }

  // ── date parse helpers ────────────────────────────────────────────────────
  const nowMs      = new Date(now).getTime()
  const deadlineMs = safeDeadlineDate(input?.deadline)
  const startMs    = safeDate(input?.startAt)
  const endMs      = safeDate(input?.endAt)

  if (deadlineMs === null) errors.deadline = 'Please enter a valid deadline date.'
  if (startMs    === null) errors.startAt  = 'Please enter a valid start date and time.'
  if (endMs      === null) errors.endAt    = 'Please enter a valid end date and time.'

  // ── equipment lookup ──────────────────────────────────────────────────────
  const equip = (equipment ?? []).find(e => e.id === targetEquipId)
  if (!equip) {
    errors.equipment = 'Selected equipment does not exist.'
  }

  // ── cross-field constraints (only when dates parsed OK) ───────────────────
  if (startMs !== null && endMs !== null) {
    if (endMs <= startMs) {
      errors.endAt = 'End time must be after start time.'
    }

    if (startMs < nowMs) {
      errors.startAt = 'Start time must not be in the past.'
    }

    if (deadlineMs !== null && endMs > deadlineMs) {
      errors.endAt = 'Session must end before or at the project deadline.'
    }

    if (equip && endMs > startMs) {
      const sessionHours = (endMs - startMs) / (3600 * 1000)
      if (sessionHours > equip.maxSessionHours) {
        errors.endAt = `Session length exceeds the maximum of ${equip.maxSessionHours} h for this equipment.`
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Parse a deadline date string. If YYYY-MM-DD date only, treat as end of day.
 *
 * @param {string|undefined} value
 * @returns {number|null}
 */
function safeDeadlineDate(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const ms = Date.parse(`${value}T23:59:59.999`)
    return Number.isFinite(ms) ? ms : null
  }
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

/**
 * Parse a date string; return its ms timestamp or null if invalid.
 *
 * @param {string|undefined} value
 * @returns {number|null}
 */
function safeDate(value) {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}
