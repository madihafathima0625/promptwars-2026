/**
 * @fileoverview Vitest tests for src/data/history.js and src/data/validate.js
 */

import { describe, it, expect } from 'vitest'
import { buildHistory } from './history.js'
import { validateRequestInput } from './validate.js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = '2026-01-15T12:00:00.000Z'

/** Equipment list used by validate tests */
const EQUIPMENT = [
  {
    id: 'eq-1',
    name: 'Oscilloscope',
    category: 'oscilloscope',
    department: 'EE',
    lab: 'Lab A',
    description: 'Test equipment',
    quantity: 2,
    maxSessionHours: 4,
  },
]

/** Future times relative to NOW */
const TOMORROW_10 = '2026-01-16T10:00:00.000Z'
const TOMORROW_12 = '2026-01-16T12:00:00.000Z'
const IN_7_DAYS   = '2026-01-22T12:00:00.000Z'

/** Default valid input */
function validInput(overrides = {}) {
  return {
    projectTitle: 'BLE Sensor Network Study',
    projectStage: 'capstone',
    deadline: IN_7_DAYS,
    startAt: TOMORROW_10,
    endAt: TOMORROW_12,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// buildHistory
// ─────────────────────────────────────────────────────────────────────────────

describe('buildHistory – approved hours in last 30 days', () => {
  it('counts approved session hours correctly', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt:   '2026-01-10T14:00:00.000Z', // 4 h
        status: 'approved',
      },
    ]
    const { approvedHoursLast30d } = buildHistory(requests, NOW)
    expect(approvedHoursLast30d['stu-a']).toBe(4)
  })

  it('sums multiple approved sessions for same student', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt:   '2026-01-10T12:00:00.000Z', // 2 h
        status: 'approved',
      },
      {
        id: 'r2', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-12T10:00:00.000Z',
        endAt:   '2026-01-12T14:00:00.000Z', // 4 h
        status: 'approved',
      },
    ]
    const { approvedHoursLast30d } = buildHistory(requests, NOW)
    expect(approvedHoursLast30d['stu-a']).toBe(6)
  })

  it('excludes approved sessions older than 30 days', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2025-12-01T10:00:00.000Z', // > 30 days ago
        endAt:   '2025-12-01T14:00:00.000Z',
        status: 'approved',
      },
    ]
    const { approvedHoursLast30d } = buildHistory(requests, NOW)
    expect(approvedHoursLast30d['stu-a']).toBeUndefined()
  })

  it('excludes pending and rejected requests', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt:   '2026-01-10T12:00:00.000Z',
        status: 'pending',
      },
      {
        id: 'r2', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt:   '2026-01-10T12:00:00.000Z',
        status: 'rejected',
      },
    ]
    const { approvedHoursLast30d } = buildHistory(requests, NOW)
    expect(approvedHoursLast30d['stu-a']).toBeUndefined()
  })

  it('handles multiple students independently', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt:   '2026-01-10T12:00:00.000Z', // 2 h
        status: 'approved',
      },
      {
        id: 'r2', studentId: 'stu-b', equipmentId: 'eq-1',
        startAt: '2026-01-11T10:00:00.000Z',
        endAt:   '2026-01-11T16:00:00.000Z', // 6 h
        status: 'approved',
      },
    ]
    const { approvedHoursLast30d } = buildHistory(requests, NOW)
    expect(approvedHoursLast30d['stu-a']).toBe(2)
    expect(approvedHoursLast30d['stu-b']).toBe(6)
  })

  it('returns empty objects for empty request list', () => {
    const { approvedHoursLast30d, noShowsLast60d } = buildHistory([], NOW)
    expect(approvedHoursLast30d).toEqual({})
    expect(noShowsLast60d).toEqual({})
  })
})

describe('buildHistory – no-shows in last 60 days', () => {
  it('counts no-shows within 60 days', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2025-11-30T10:00:00.000Z', // ~46 days ago — within 60
        endAt:   '2025-11-30T12:00:00.000Z',
        status: 'no_show',
      },
    ]
    const { noShowsLast60d } = buildHistory(requests, NOW)
    expect(noShowsLast60d['stu-a']).toBe(1)
  })

  it('excludes no-shows older than 60 days', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2025-11-01T10:00:00.000Z', // ~75 days ago
        endAt:   '2025-11-01T12:00:00.000Z',
        status: 'no_show',
      },
    ]
    const { noShowsLast60d } = buildHistory(requests, NOW)
    expect(noShowsLast60d['stu-a']).toBeUndefined()
  })

  it('counts multiple no-shows per student', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-05T10:00:00.000Z',
        endAt:   '2026-01-05T12:00:00.000Z',
        status: 'no_show',
      },
      {
        id: 'r2', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-08T10:00:00.000Z',
        endAt:   '2026-01-08T12:00:00.000Z',
        status: 'no_show',
      },
    ]
    const { noShowsLast60d } = buildHistory(requests, NOW)
    expect(noShowsLast60d['stu-a']).toBe(2)
  })

  it('does not count approved sessions as no-shows', () => {
    const requests = [
      {
        id: 'r1', studentId: 'stu-a', equipmentId: 'eq-1',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt:   '2026-01-10T12:00:00.000Z',
        status: 'approved',
      },
    ]
    const { noShowsLast60d } = buildHistory(requests, NOW)
    expect(noShowsLast60d['stu-a']).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// validateRequestInput
// ─────────────────────────────────────────────────────────────────────────────

describe('validateRequestInput – valid input', () => {
  it('accepts a fully valid input', () => {
    const result = validateRequestInput(validInput(), EQUIPMENT, 'eq-1', NOW)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })
})

describe('validateRequestInput – projectTitle', () => {
  it('rejects title shorter than 3 chars', () => {
    const result = validateRequestInput(validInput({ projectTitle: 'AB' }), EQUIPMENT, 'eq-1', NOW)
    expect(result.valid).toBe(false)
    expect(result.errors.projectTitle).toMatch(/at least 3/)
  })

  it('accepts title of exactly 3 chars', () => {
    const result = validateRequestInput(validInput({ projectTitle: 'ABC' }), EQUIPMENT, 'eq-1', NOW)
    expect(result.errors.projectTitle).toBeUndefined()
  })

  it('rejects title longer than 80 chars', () => {
    const result = validateRequestInput(
      validInput({ projectTitle: 'A'.repeat(81) }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.projectTitle).toMatch(/at most 80/)
  })

  it('accepts title of exactly 80 chars', () => {
    const result = validateRequestInput(
      validInput({ projectTitle: 'A'.repeat(80) }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.errors.projectTitle).toBeUndefined()
  })

  it('trims whitespace before checking length', () => {
    // 2 real chars + padding spaces → still too short
    const result = validateRequestInput(
      validInput({ projectTitle: '  AB  ' }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.projectTitle).toMatch(/at least 3/)
  })
})

describe('validateRequestInput – projectStage', () => {
  it('accepts all valid stages', () => {
    for (const stage of ['capstone', 'mini-project', 'coursework', 'practice']) {
      const result = validateRequestInput(validInput({ projectStage: stage }), EQUIPMENT, 'eq-1', NOW)
      expect(result.errors.projectStage).toBeUndefined()
    }
  })

  it('rejects an unknown stage', () => {
    const result = validateRequestInput(validInput({ projectStage: 'hackathon' }), EQUIPMENT, 'eq-1', NOW)
    expect(result.valid).toBe(false)
    expect(result.errors.projectStage).toBeTruthy()
  })

  it('rejects empty stage', () => {
    const result = validateRequestInput(validInput({ projectStage: '' }), EQUIPMENT, 'eq-1', NOW)
    expect(result.valid).toBe(false)
    expect(result.errors.projectStage).toBeTruthy()
  })
})

describe('validateRequestInput – date constraints', () => {
  it('rejects startAt in the past', () => {
    const result = validateRequestInput(
      validInput({ startAt: '2026-01-01T10:00:00.000Z', endAt: '2026-01-01T12:00:00.000Z' }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.startAt).toMatch(/past/)
  })

  it('rejects endAt before startAt', () => {
    const result = validateRequestInput(
      validInput({ startAt: TOMORROW_12, endAt: TOMORROW_10 }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.endAt).toMatch(/after start/)
  })

  it('rejects endAt equal to startAt', () => {
    const result = validateRequestInput(
      validInput({ startAt: TOMORROW_10, endAt: TOMORROW_10 }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.endAt).toMatch(/after start/)
  })

  it('rejects session that exceeds the deadline', () => {
    const result = validateRequestInput(
      validInput({
        deadline: TOMORROW_12,
        startAt: TOMORROW_10,
        endAt: '2026-01-16T14:00:00.000Z', // 2 h past deadline
      }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.endAt).toMatch(/deadline/)
  })

  it('rejects session longer than maxSessionHours', () => {
    // EQUIPMENT[0].maxSessionHours = 4; request 5 h
    const result = validateRequestInput(
      validInput({
        startAt: TOMORROW_10,
        endAt: '2026-01-16T15:00:00.000Z', // 5 h
      }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.endAt).toMatch(/maximum/)
  })

  it('rejects invalid date strings', () => {
    const result = validateRequestInput(
      validInput({ startAt: 'not-a-date' }),
      EQUIPMENT, 'eq-1', NOW
    )
    expect(result.valid).toBe(false)
    expect(result.errors.startAt).toBeTruthy()
  })
})

describe('validateRequestInput – equipment', () => {
  it('rejects unknown equipment id', () => {
    const result = validateRequestInput(validInput(), EQUIPMENT, 'eq-does-not-exist', NOW)
    expect(result.valid).toBe(false)
    expect(result.errors.equipment).toBeTruthy()
  })
})
