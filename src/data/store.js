/**
 * @fileoverview localStorage-backed state store for LabLink demo.
 *
 * Shape stored: { requests: Request[], persona: string }
 * Falls back to seed data on any parse / validation failure.
 * Never stores sensitive information.
 *
 * @typedef {import('./seed.js').Request} Request
 * @typedef {import('./seed.js').Equipment} Equipment
 */

import {
  SEED_EQUIPMENT,
  PERSONAS,
  createSeedRequests,
  createDemoConflict,
} from './seed.js'

const STORAGE_KEY  = 'lablink_demo_v1'
const PERSONA_KEY  = 'lablink_persona_v1'

// ── Shape validation ──────────────────────────────────────────────────────────

/**
 * @param {unknown} value
 * @returns {value is Request[]}
 */
function isValidRequests(value) {
  if (!Array.isArray(value)) return false
  return value.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      typeof r.id === 'string' &&
      typeof r.studentId === 'string' &&
      typeof r.equipmentId === 'string' &&
      typeof r.status === 'string'
  )
}

// ── Seed factory ──────────────────────────────────────────────────────────────

/**
 * Build the initial state using the current time so all seeds are relative.
 *
 * @returns {{ requests: Request[] }}
 */
function buildSeedState() {
  const now = new Date().toISOString()
  return {
    requests: [
      ...createSeedRequests(now),
      ...createDemoConflict(now),
    ],
  }
}

// ── Read / write ──────────────────────────────────────────────────────────────

/**
 * Read and validate state from localStorage. Falls back to seed on error.
 *
 * @returns {{ requests: Request[], equipment: Equipment[] }}
 */
export function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && isValidRequests(parsed.requests)) {
        return { requests: parsed.requests, equipment: SEED_EQUIPMENT }
      }
    }
  } catch {
    // corrupted — fall through to seed
  }
  const seed = buildSeedState()
  _persist(seed)
  return { ...seed, equipment: SEED_EQUIPMENT }
}

/**
 * Persist the requests array to localStorage.
 *
 * @param {{ requests: Request[] }} state
 */
function _persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ requests: state.requests }))
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Append a new request to the store. Returns the updated full state.
 *
 * @param {Request} request
 * @returns {{ requests: Request[], equipment: Equipment[] }}
 */
export function saveRequest(request) {
  const state = getState()
  const updated = { requests: [...state.requests, request] }
  _persist(updated)
  return { ...updated, equipment: SEED_EQUIPMENT }
}

/**
 * Update an existing request by id (shallow merge). Returns updated state.
 *
 * @param {string} id
 * @param {Partial<Request>} patch
 * @returns {{ requests: Request[], equipment: Equipment[] }}
 */
export function updateRequest(id, patch) {
  const state = getState()
  const updated = {
    requests: state.requests.map(r => (r.id === id ? { ...r, ...patch } : r)),
  }
  _persist(updated)
  return { ...updated, equipment: SEED_EQUIPMENT }
}

/**
 * Reset to seed data (clears localStorage key).
 *
 * @returns {{ requests: Request[], equipment: Equipment[] }}
 */
export function resetDemo() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  const seed = buildSeedState()
  _persist(seed)
  return { ...seed, equipment: SEED_EQUIPMENT }
}

// ── Persona ───────────────────────────────────────────────────────────────────

/**
 * Persist the active persona id.
 *
 * @param {string} personaId - 'asha' | 'ravi' | 'drrao'
 */
export function setPersona(personaId) {
  try {
    if (!personaId) {
      localStorage.removeItem(PERSONA_KEY)
    } else {
      localStorage.setItem(PERSONA_KEY, personaId)
    }
  } catch { /* ignore */ }
}

/**
 * Read the active persona from localStorage. Returns null if not set.
 *
 * @returns {import('./seed.js').Persona|null}
 */
export function getPersona() {
  try {
    const id = localStorage.getItem(PERSONA_KEY)
    return PERSONAS.find(p => p.id === id) ?? null
  } catch {
    return null
  }
}

/** Re-export equipment as a convenience. @type {Equipment[]} */
export { SEED_EQUIPMENT as equipment }

/** Re-export personas. @type {import('./seed.js').Persona[]} */
export { PERSONAS as personas }
