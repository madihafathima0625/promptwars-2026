/**
 * @fileoverview Vitest tests for src/data/decisions.js
 */

import { describe, it, expect } from 'vitest'
import {
  hasCapacity,
  requiresOverrideReason,
  buildDecisionRecord,
} from './decisions.js'

describe('hasCapacity', () => {
  const equip1 = {
    id: 'eq-osc-1',
    name: 'Oscilloscope 1',
    quantity: 1,
    category: 'oscilloscope',
  }

  const equip2 = {
    id: 'eq-osc-2',
    name: 'Oscilloscope 2',
    quantity: 2,
    category: 'oscilloscope',
  }

  it('returns true when there are no approved requests', () => {
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z',
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equip1, [])).toBe(true)
  })

  it('capacity at boundary: approved ends exactly when new request starts', () => {
    const approved = [
      {
        id: 'app-1',
        equipmentId: 'eq-osc-1',
        status: 'approved',
        startAt: '2026-01-10T08:00:00.000Z',
        endAt: '2026-01-10T10:00:00.000Z', // ends exactly at 10:00
      },
    ]
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z', // starts at 10:00
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equip1, approved)).toBe(true)
  })

  it('capacity at boundary: approved starts exactly when new request ends', () => {
    const approved = [
      {
        id: 'app-1',
        equipmentId: 'eq-osc-1',
        status: 'approved',
        startAt: '2026-01-10T12:00:00.000Z', // starts at 12:00
        endAt: '2026-01-10T14:00:00.000Z',
      },
    ]
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z',
      endAt: '2026-01-10T12:00:00.000Z', // ends at 12:00
    }
    expect(hasCapacity(req, equip1, approved)).toBe(true)
  })

  it('partial overlap when quantity is 1: blocks approval', () => {
    const approved = [
      {
        id: 'app-1',
        equipmentId: 'eq-osc-1',
        status: 'approved',
        startAt: '2026-01-10T09:00:00.000Z',
        endAt: '2026-01-10T11:00:00.000Z',
      },
    ]
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z', // overlaps 10:00 - 11:00
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equip1, approved)).toBe(false)
  })

  it('partial overlap when quantity is 2: allows single overlap', () => {
    const approved = [
      {
        id: 'app-1',
        equipmentId: 'eq-osc-2',
        status: 'approved',
        startAt: '2026-01-10T09:00:00.000Z',
        endAt: '2026-01-10T11:00:00.000Z',
      },
    ]
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-2',
      startAt: '2026-01-10T10:00:00.000Z',
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equip2, approved)).toBe(true)
  })

  it('quantity is 2: blocks when 2 existing approved requests overlap the slot', () => {
    const approved = [
      {
        id: 'app-1',
        equipmentId: 'eq-osc-2',
        status: 'approved',
        startAt: '2026-01-10T09:00:00.000Z',
        endAt: '2026-01-10T11:30:00.000Z',
      },
      {
        id: 'app-2',
        equipmentId: 'eq-osc-2',
        status: 'approved',
        startAt: '2026-01-10T10:30:00.000Z',
        endAt: '2026-01-10T13:00:00.000Z',
      },
    ]
    // Between 10:30 and 11:30, both app-1 and app-2 are active (count = 2)
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-2',
      startAt: '2026-01-10T11:00:00.000Z', // 11:00 falls in [10:30, 11:30)
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equip2, approved)).toBe(false)
  })

  it('works when equipment is passed as an array', () => {
    const equipmentList = [equip1, equip2]
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z',
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equipmentList, [])).toBe(true)
  })

  it('ignores approved requests for other equipment', () => {
    const approved = [
      {
        id: 'app-other',
        equipmentId: 'eq-other',
        status: 'approved',
        startAt: '2026-01-10T10:00:00.000Z',
        endAt: '2026-01-10T12:00:00.000Z',
      },
    ]
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z',
      endAt: '2026-01-10T12:00:00.000Z',
    }
    expect(hasCapacity(req, equip1, approved)).toBe(true)
  })

  it('ignores the request itself if already in approved list', () => {
    const req = {
      id: 'req-1',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T10:00:00.000Z',
      endAt: '2026-01-10T12:00:00.000Z',
    }
    const approved = [{ ...req, status: 'approved' }]
    expect(hasCapacity(req, equip1, approved)).toBe(true)
  })

  it('returns false for invalid intervals', () => {
    const req = {
      id: 'req-invalid',
      equipmentId: 'eq-osc-1',
      startAt: '2026-01-10T12:00:00.000Z',
      endAt: '2026-01-10T10:00:00.000Z', // end < start
    }
    expect(hasCapacity(req, equip1, [])).toBe(false)
  })
})

describe('requiresOverrideReason', () => {
  it('approve with recommend_approve does not require override reason', () => {
    const rec = { outcome: 'recommend_approve' }
    expect(requiresOverrideReason(rec, 'approve')).toBe(false)
  })

  it('approve with recommend_reject requires override reason', () => {
    const rec = { outcome: 'recommend_reject' }
    expect(requiresOverrideReason(rec, 'approve')).toBe(true)
  })

  it('approve with waitlist requires override reason', () => {
    const rec = { outcome: 'waitlist' }
    expect(requiresOverrideReason(rec, 'approve')).toBe(true)
  })

  it('approve with invalid requires override reason', () => {
    const rec = { outcome: 'invalid' }
    expect(requiresOverrideReason(rec, 'approve')).toBe(true)
  })

  it('reject with recommend_approve requires override reason', () => {
    const rec = { outcome: 'recommend_approve' }
    expect(requiresOverrideReason(rec, 'reject')).toBe(true)
  })

  it('reject with recommend_reject does not require override reason', () => {
    const rec = { outcome: 'recommend_reject' }
    expect(requiresOverrideReason(rec, 'reject')).toBe(false)
  })

  it('reject with waitlist does not require override reason', () => {
    const rec = { outcome: 'waitlist' }
    expect(requiresOverrideReason(rec, 'reject')).toBe(false)
  })

  it('handles null/undefined recommendation', () => {
    expect(requiresOverrideReason(null, 'approve')).toBe(true)
    expect(requiresOverrideReason(undefined, 'reject')).toBe(false)
  })
})

describe('buildDecisionRecord', () => {
  const sampleRec = {
    score: 85,
    breakdown: { urgency: 35, stage: 20, fairness: 16, reliability: 14 },
    rank: 1,
    outcome: 'recommend_approve',
    explanation: 'Approved with a score of 85/100.',
  }

  it('builds a complete record with all required fields', () => {
    const record = buildDecisionRecord({
      recommendation: sampleRec,
      action: 'approve',
      adminName: 'Dr. Priya Rao',
      now: '2026-01-15T12:00:00.000Z',
      overrideReason: null,
    })

    expect(record).toEqual({
      score: 85,
      breakdown: { urgency: 35, stage: 20, fairness: 16, reliability: 14 },
      rank: 1,
      explanation: 'Approved with a score of 85/100.',
      recommendedOutcome: 'recommend_approve',
      action: 'approve',
      decidedBy: 'Dr. Priya Rao',
      decidedAt: '2026-01-15T12:00:00.000Z',
      overrideReason: null,
    })
  })

  it('trims overrideReason if provided', () => {
    const record = buildDecisionRecord({
      recommendation: sampleRec,
      action: 'reject',
      adminName: 'Dr. Priya Rao',
      now: '2026-01-15T12:00:00.000Z',
      overrideReason: '  Equipment undergoing mandatory calibration.  ',
    })

    expect(record.overrideReason).toBe('Equipment undergoing mandatory calibration.')
  })

  it('does not mutate input recommendation or its breakdown', () => {
    const originalBreakdown = { urgency: 35, stage: 20, fairness: 16, reliability: 14 }
    const rec = {
      score: 85,
      breakdown: originalBreakdown,
      rank: 1,
      outcome: 'recommend_approve',
      explanation: 'Approved.',
    }

    const record = buildDecisionRecord({
      recommendation: rec,
      action: 'approve',
      adminName: 'Dr. Rao',
      now: '2026-01-15T12:00:00.000Z',
      overrideReason: null,
    })

    // Modify the record breakdown
    record.breakdown.urgency = 0
    expect(originalBreakdown.urgency).toBe(35)
  })

  it('handles missing recommendation gracefully with safe defaults', () => {
    const record = buildDecisionRecord({
      recommendation: null,
      action: 'reject',
      adminName: 'Dr. Rao',
      now: '2026-01-15T12:00:00.000Z',
      overrideReason: 'Manual rejection without engine scoring.',
    })

    expect(record.score).toBe(0)
    expect(record.breakdown).toEqual({ urgency: 0, stage: 0, fairness: 0, reliability: 0 })
    expect(record.rank).toBe(0)
    expect(record.explanation).toBe('')
    expect(record.recommendedOutcome).toBe(null)
    expect(record.action).toBe('reject')
  })
})
