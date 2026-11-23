/**
 * @fileoverview Vitest suite for the LabLink Fair Allocation Engine.
 *
 * Coverage:
 *  - scoreRequest: each urgency band boundary, each stage, each fairness band,
 *    reliability deductions, reliability floor
 *  - allocate: each hard-constraint failure, 1-unit contention (higher score
 *    wins), tie broken by createdAt then id, quantity-2 gives two winners,
 *    non-overlapping slots both approved, next_slot alternative,
 *    equivalent alternative, waitlist fallback, determinism with shuffled
 *    input, explanation contains actual scores, inputs not mutated
 */

import { describe, it, expect } from 'vitest'
import { scoreRequest } from './scoring.js'
import { allocate }     from './allocate.js'

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/** NOW is a fixed UTC reference so all tests are deterministic. */
const NOW = '2026-01-10T08:00:00.000Z'

/** Equipment that will be reused across tests. */
const EQ1 = {
  id: 'eq-1', name: 'Oscilloscope A', category: 'oscilloscope',
  department: 'EE', lab: 'lab-1', quantity: 1, maxSessionHours: 4,
}
const EQ2 = {
  id: 'eq-2', name: 'Oscilloscope B', category: 'oscilloscope',
  department: 'EE', lab: 'lab-2', quantity: 1, maxSessionHours: 4,
}
const EQ_MULTI = {
  id: 'eq-m', name: 'Multimeter', category: 'multimeter',
  department: 'EE', lab: 'lab-1', quantity: 2, maxSessionHours: 8,
}

/** A deadline 3 days from NOW → urgency band <=5 → score 28. */
const DEADLINE_3D  = '2026-01-13T08:00:00.000Z'
/** A deadline 7 days from NOW → urgency band <=10 → score 20. */
const DEADLINE_7D  = '2026-01-17T08:00:00.000Z'
/** A deadline 25 days from NOW → urgency band >20 → score 5. */
const DEADLINE_25D = '2026-02-04T08:00:00.000Z'

/** A session slot from NOW+1h to NOW+3h (2 h, within maxSessionHours=4). */
const SLOT_A_START = '2026-01-10T09:00:00.000Z'
const SLOT_A_END   = '2026-01-10T11:00:00.000Z'

/** A non-overlapping slot later the same day. */
const SLOT_B_START = '2026-01-10T13:00:00.000Z'
const SLOT_B_END   = '2026-01-10T15:00:00.000Z'

function makeRequest(overrides) {
  return {
    id:           'req-default',
    studentId:    'stu-1',
    equipmentId:  'eq-1',
    projectTitle: 'Default Project',
    projectStage: 'capstone',
    deadline:     DEADLINE_7D,
    startAt:      SLOT_A_START,
    endAt:        SLOT_A_END,
    createdAt:    '2026-01-09T08:00:00.000Z',
    status:       'pending',
    ...overrides,
  }
}

const EMPTY_HISTORY = { approvedHoursLast30d: {}, noShowsLast60d: {} }

// ─────────────────────────────────────────────────────────────────────────────
// scoreRequest – urgency bands
// ─────────────────────────────────────────────────────────────────────────────
describe('scoreRequest – urgency bands', () => {
  const baseHistory = EMPTY_HISTORY
  const baseCtx = (deadline) => ({ now: NOW, history: baseHistory })

  it('deadline in exactly 2 days → urgency 35', () => {
    const req = makeRequest({ deadline: '2026-01-12T08:00:00.000Z' })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(35)
  })

  it('deadline in exactly 1 day → urgency 35 (≤2)', () => {
    const req = makeRequest({ deadline: '2026-01-11T08:00:00.000Z' })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(35)
  })

  it('deadline in exactly 5 days → urgency 28 (≤5)', () => {
    const req = makeRequest({ deadline: '2026-01-15T08:00:00.000Z' })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(28)
  })

  it('deadline in 3 days → urgency 28 (≤5)', () => {
    const req = makeRequest({ deadline: DEADLINE_3D })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(28)
  })

  it('deadline in exactly 10 days → urgency 20 (≤10)', () => {
    const req = makeRequest({ deadline: '2026-01-20T08:00:00.000Z' })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(20)
  })

  it('deadline in 7 days → urgency 20 (≤10)', () => {
    const req = makeRequest({ deadline: DEADLINE_7D })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(20)
  })

  it('deadline in exactly 20 days → urgency 10 (≤20)', () => {
    const req = makeRequest({ deadline: '2026-01-30T08:00:00.000Z' })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(10)
  })

  it('deadline in 25 days → urgency 5 (>20)', () => {
    const req = makeRequest({ deadline: DEADLINE_25D })
    const { breakdown } = scoreRequest(req, { now: NOW, history: baseHistory })
    expect(breakdown.urgency).toBe(5)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// scoreRequest – stage scores
// ─────────────────────────────────────────────────────────────────────────────
describe('scoreRequest – stage scores', () => {
  it('capstone → stage 20', () => {
    const { breakdown } = scoreRequest(makeRequest({ projectStage: 'capstone' }), { now: NOW, history: EMPTY_HISTORY })
    expect(breakdown.stage).toBe(20)
  })
  it('mini-project → stage 14', () => {
    const { breakdown } = scoreRequest(makeRequest({ projectStage: 'mini-project' }), { now: NOW, history: EMPTY_HISTORY })
    expect(breakdown.stage).toBe(14)
  })
  it('coursework → stage 8', () => {
    const { breakdown } = scoreRequest(makeRequest({ projectStage: 'coursework' }), { now: NOW, history: EMPTY_HISTORY })
    expect(breakdown.stage).toBe(8)
  })
  it('practice → stage 3', () => {
    const { breakdown } = scoreRequest(makeRequest({ projectStage: 'practice' }), { now: NOW, history: EMPTY_HISTORY })
    expect(breakdown.stage).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// scoreRequest – fairness bands
// ─────────────────────────────────────────────────────────────────────────────
describe('scoreRequest – fairness bands', () => {
  function fairCtx(approvedHours) {
    return {
      now: NOW,
      history: { approvedHoursLast30d: { 'stu-1': approvedHours }, noShowsLast60d: {} },
    }
  }

  it('0 hours → fairness 30', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(0))
    expect(breakdown.fairness).toBe(30)
  })
  it('student absent from history → fairness 30 (treated as 0 hours)', () => {
    const { breakdown } = scoreRequest(makeRequest(), { now: NOW, history: EMPTY_HISTORY })
    expect(breakdown.fairness).toBe(30)
  })
  it('4 hours → fairness 24 (≤4)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(4))
    expect(breakdown.fairness).toBe(24)
  })
  it('3 hours → fairness 24 (≤4)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(3))
    expect(breakdown.fairness).toBe(24)
  })
  it('10 hours → fairness 16 (≤10)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(10))
    expect(breakdown.fairness).toBe(16)
  })
  it('7 hours → fairness 16 (≤10)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(7))
    expect(breakdown.fairness).toBe(16)
  })
  it('20 hours → fairness 8 (≤20)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(20))
    expect(breakdown.fairness).toBe(8)
  })
  it('15 hours → fairness 8 (≤20)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(15))
    expect(breakdown.fairness).toBe(8)
  })
  it('21 hours → fairness 0 (>20)', () => {
    const { breakdown } = scoreRequest(makeRequest(), fairCtx(21))
    expect(breakdown.fairness).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// scoreRequest – reliability
// ─────────────────────────────────────────────────────────────────────────────
describe('scoreRequest – reliability', () => {
  function relCtx(noShows) {
    return {
      now: NOW,
      history: { approvedHoursLast30d: {}, noShowsLast60d: { 'stu-1': noShows } },
    }
  }

  it('0 no-shows → reliability 15', () => {
    const { breakdown } = scoreRequest(makeRequest(), relCtx(0))
    expect(breakdown.reliability).toBe(15)
  })
  it('1 no-show → reliability 10', () => {
    const { breakdown } = scoreRequest(makeRequest(), relCtx(1))
    expect(breakdown.reliability).toBe(10)
  })
  it('2 no-shows → reliability 5', () => {
    const { breakdown } = scoreRequest(makeRequest(), relCtx(2))
    expect(breakdown.reliability).toBe(5)
  })
  it('3 no-shows → reliability 0 (floor)', () => {
    const { breakdown } = scoreRequest(makeRequest(), relCtx(3))
    expect(breakdown.reliability).toBe(0)
  })
  it('10 no-shows → reliability 0 (floor, never negative)', () => {
    const { breakdown } = scoreRequest(makeRequest(), relCtx(10))
    expect(breakdown.reliability).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// scoreRequest – total and inputs
// ─────────────────────────────────────────────────────────────────────────────
describe('scoreRequest – total and inputs', () => {
  it('total equals sum of breakdown parts', () => {
    const result = scoreRequest(makeRequest(), { now: NOW, history: EMPTY_HISTORY })
    const { urgency, stage, fairness, reliability } = result.breakdown
    expect(result.total).toBe(urgency + stage + fairness + reliability)
  })

  it('exposes daysToDeadline, approvedHours, noShows in inputs', () => {
    const history = {
      approvedHoursLast30d: { 'stu-1': 5 },
      noShowsLast60d:       { 'stu-1': 1 },
    }
    const result = scoreRequest(makeRequest(), { now: NOW, history })
    expect(result.inputs.approvedHours).toBe(5)
    expect(result.inputs.noShows).toBe(1)
    expect(result.inputs.daysToDeadline).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – hard constraint failures
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – hard constraint failures', () => {
  const equipment = [EQ1]
  const history   = EMPTY_HISTORY

  it('equipment does not exist → invalid', () => {
    const req = makeRequest({ equipmentId: 'does-not-exist' })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.outcome).toBe('invalid')
    expect(dec.reasons.some(r => /does not exist/i.test(r))).toBe(true)
  })

  it('endAt <= startAt → invalid', () => {
    const req = makeRequest({ startAt: SLOT_A_START, endAt: SLOT_A_START })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.outcome).toBe('invalid')
    expect(dec.reasons.some(r => /after start/i.test(r))).toBe(true)
  })

  it('endAt before startAt → invalid', () => {
    const req = makeRequest({ startAt: SLOT_A_END, endAt: SLOT_A_START })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.outcome).toBe('invalid')
  })

  it('startAt in the past → invalid', () => {
    const req = makeRequest({
      startAt: '2026-01-01T00:00:00.000Z',
      endAt:   '2026-01-01T02:00:00.000Z',
      deadline: '2026-01-20T00:00:00.000Z',
    })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.outcome).toBe('invalid')
    expect(dec.reasons.some(r => /past/i.test(r))).toBe(true)
  })

  it('endAt exceeds deadline → invalid', () => {
    const req = makeRequest({
      deadline: DEADLINE_3D,
      startAt:  SLOT_A_START,
      endAt:    '2026-01-14T00:00:00.000Z', // past deadline
    })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.outcome).toBe('invalid')
    expect(dec.reasons.some(r => /deadline/i.test(r))).toBe(true)
  })

  it('session hours > maxSessionHours → invalid', () => {
    // EQ1.maxSessionHours = 4; request 5 h
    const req = makeRequest({
      startAt: SLOT_A_START,
      endAt:   '2026-01-10T14:00:00.000Z', // 5 h from 09:00
      deadline: DEADLINE_7D,
    })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.outcome).toBe('invalid')
    expect(dec.reasons.some(r => /maximum/i.test(r))).toBe(true)
  })

  it('invalid explanation lists all constraint messages', () => {
    const req = makeRequest({ equipmentId: 'does-not-exist' })
    const [dec] = allocate({ requests: [req], equipment, history, now: NOW })
    expect(dec.explanation).toContain('invalid')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – single-unit contention: higher score wins
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – contention, 1 unit', () => {
  const equipment = [EQ1]

  it('higher-score request wins the slot', () => {
    // stu-1: capstone, 3-day deadline  → high score
    // stu-2: practice, 7-day deadline, used 15 h → low score
    const history = {
      approvedHoursLast30d: { 'stu-2': 15 },
      noShowsLast60d: {},
    }
    const winner = makeRequest({
      id: 'req-win', studentId: 'stu-1',
      projectStage: 'capstone', deadline: DEADLINE_3D,
      createdAt: '2026-01-09T07:00:00.000Z',
    })
    const loser = makeRequest({
      id: 'req-lose', studentId: 'stu-2',
      projectStage: 'practice', deadline: DEADLINE_7D,
      createdAt: '2026-01-09T06:00:00.000Z', // earlier createdAt, still loses
    })
    const decisions = allocate({ requests: [winner, loser], equipment, history, now: NOW })
    const winDec  = decisions.find(d => d.requestId === 'req-win')
    const loseDec = decisions.find(d => d.requestId === 'req-lose')

    expect(winDec.outcome).toBe('recommend_approve')
    expect(loseDec.outcome).not.toBe('recommend_approve')
    expect(winDec.score).toBeGreaterThan(loseDec.score)
  })

  it('loser explanation contains both scores as actual numbers', () => {
    const history = { approvedHoursLast30d: { 'stu-2': 15 }, noShowsLast60d: {} }
    const winner = makeRequest({ id: 'req-win', studentId: 'stu-1', projectStage: 'capstone', deadline: DEADLINE_3D })
    const loser  = makeRequest({ id: 'req-lose', studentId: 'stu-2', projectStage: 'practice', deadline: DEADLINE_7D })
    const decisions = allocate({ requests: [winner, loser], equipment, history, now: NOW })
    const loseDec = decisions.find(d => d.requestId === 'req-lose')

    // Both scores should appear as digits in the explanation
    expect(loseDec.explanation).toMatch(/\d+\/100/)
    expect(loseDec.explanation).toContain(String(loseDec.score))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – tie-breaking
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – tie-breaking', () => {
  const equipment = [EQ1]
  const history   = EMPTY_HISTORY

  it('equal scores: earlier createdAt wins', () => {
    const earlier = makeRequest({
      id: 'req-earlier', studentId: 'stu-1',
      createdAt: '2026-01-09T06:00:00.000Z',
    })
    const later = makeRequest({
      id: 'req-later', studentId: 'stu-2',
      createdAt: '2026-01-09T10:00:00.000Z',
    })
    const decisions = allocate({ requests: [earlier, later], equipment, history, now: NOW })
    const earlyDec = decisions.find(d => d.requestId === 'req-earlier')
    const lateDec  = decisions.find(d => d.requestId === 'req-later')

    expect(earlyDec.outcome).toBe('recommend_approve')
    expect(lateDec.outcome).not.toBe('recommend_approve')
  })

  it('equal scores AND equal createdAt: lexically smaller id wins', () => {
    const aReq = makeRequest({
      id: 'req-aaa', studentId: 'stu-1',
      createdAt: '2026-01-09T08:00:00.000Z',
    })
    const bReq = makeRequest({
      id: 'req-bbb', studentId: 'stu-2',
      createdAt: '2026-01-09T08:00:00.000Z',
    })
    const decisions = allocate({ requests: [bReq, aReq], equipment, history, now: NOW })
    const aDec = decisions.find(d => d.requestId === 'req-aaa')
    const bDec = decisions.find(d => d.requestId === 'req-bbb')

    expect(aDec.outcome).toBe('recommend_approve')
    expect(bDec.outcome).not.toBe('recommend_approve')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – quantity ≥ 2 gives two winners
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – quantity 2', () => {
  it('two overlapping requests both approved when quantity=2', () => {
    const r1 = makeRequest({ id: 'req-1', studentId: 'stu-1', equipmentId: 'eq-m', deadline: DEADLINE_7D })
    const r2 = makeRequest({ id: 'req-2', studentId: 'stu-2', equipmentId: 'eq-m', deadline: DEADLINE_7D,
      createdAt: '2026-01-09T09:00:00.000Z' })
    const decisions = allocate({
      requests: [r1, r2],
      equipment: [EQ_MULTI],
      history: EMPTY_HISTORY,
      now: NOW,
    })
    expect(decisions.every(d => d.outcome === 'recommend_approve')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – non-overlapping slots both approved
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – non-overlapping slots, 1 unit', () => {
  it('two non-overlapping requests on 1 unit both get approved', () => {
    const r1 = makeRequest({ id: 'req-1', studentId: 'stu-1', startAt: SLOT_A_START, endAt: SLOT_A_END })
    const r2 = makeRequest({ id: 'req-2', studentId: 'stu-2', startAt: SLOT_B_START, endAt: SLOT_B_END,
      createdAt: '2026-01-09T09:00:00.000Z' })
    const decisions = allocate({
      requests: [r1, r2],
      equipment: [EQ1],
      history: EMPTY_HISTORY,
      now: NOW,
    })
    expect(decisions.every(d => d.outcome === 'recommend_approve')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – next_slot alternative
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – next_slot alternative', () => {
  it('loser gets a next_slot alternative when a later free slot exists', () => {
    // Both want SLOT_A, deadline far enough to allow alternatives
    const winner = makeRequest({
      id: 'req-win', studentId: 'stu-1',
      projectStage: 'capstone',
      startAt: SLOT_A_START, endAt: SLOT_A_END,
      deadline: DEADLINE_7D,
    })
    const loser = makeRequest({
      id: 'req-lose', studentId: 'stu-2',
      projectStage: 'practice',
      startAt: SLOT_A_START, endAt: SLOT_A_END,
      deadline: DEADLINE_7D,
    })
    const decisions = allocate({
      requests: [winner, loser],
      equipment: [EQ1],
      history: EMPTY_HISTORY,
      now: NOW,
    })
    const loseDec = decisions.find(d => d.requestId === 'req-lose')
    expect(loseDec.outcome).toBe('recommend_reject')
    const alt = loseDec.alternatives.find(a => a.type === 'next_slot')
    expect(alt).toBeDefined()
    // The alternative slot must be after the original startAt
    expect(new Date(alt.startAt).getTime()).toBeGreaterThanOrEqual(new Date(SLOT_A_START).getTime())
    // Duration must be preserved (2 h)
    const durMs = new Date(alt.endAt).getTime() - new Date(alt.startAt).getTime()
    expect(durMs).toBe(2 * 3600 * 1000)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – equivalent alternative
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – equivalent alternative', () => {
  it('loser gets an equivalent alternative when no next_slot but same-category equipment is free', () => {
    // Both request EQ1, slot A; EQ2 (same category) is free in that slot.
    // Fill EQ1's entire schedule by making a very tight deadline so no next_slot fits.
    // We achieve this by setting deadline = endAt exactly.
    const winner = makeRequest({
      id: 'req-win', studentId: 'stu-1',
      projectStage: 'capstone',
      startAt: SLOT_A_START, endAt: SLOT_A_END,
      deadline: SLOT_A_END, // deadline == endAt, so no next_slot can fit
    })
    const loser = makeRequest({
      id: 'req-lose', studentId: 'stu-2',
      projectStage: 'practice',
      startAt: SLOT_A_START, endAt: SLOT_A_END,
      deadline: SLOT_A_END,
    })
    const decisions = allocate({
      requests: [winner, loser],
      equipment: [EQ1, EQ2], // EQ2 same category, free
      history: EMPTY_HISTORY,
      now: NOW,
    })
    const loseDec = decisions.find(d => d.requestId === 'req-lose')
    const alt = loseDec.alternatives.find(a => a.type === 'equivalent')
    expect(alt).toBeDefined()
    expect(alt.equipmentId).toBe('eq-2')
    expect(loseDec.outcome).toBe('recommend_reject')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – waitlist when no alternative exists
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – waitlist fallback', () => {
  it('loser gets waitlist outcome when no next_slot and no equivalent', () => {
    // EQ1 only, slot A is taken, deadline = endAt so no next slot can fit
    const winner = makeRequest({
      id: 'req-win', studentId: 'stu-1', projectStage: 'capstone',
      startAt: SLOT_A_START, endAt: SLOT_A_END, deadline: SLOT_A_END,
    })
    const loser = makeRequest({
      id: 'req-lose', studentId: 'stu-2', projectStage: 'practice',
      startAt: SLOT_A_START, endAt: SLOT_A_END, deadline: SLOT_A_END,
    })
    const decisions = allocate({
      requests: [winner, loser],
      equipment: [EQ1], // only one, no equivalent
      history: EMPTY_HISTORY,
      now: NOW,
    })
    const loseDec = decisions.find(d => d.requestId === 'req-lose')
    expect(loseDec.outcome).toBe('waitlist')
    const wp = loseDec.alternatives.find(a => a.type === 'waitlist_position')
    expect(wp).toBeDefined()
    expect(wp.position).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – determinism with shuffled input
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – determinism', () => {
  it('shuffling request order produces identical decisions', () => {
    const history = { approvedHoursLast30d: { 'stu-2': 15 }, noShowsLast60d: {} }
    const r1 = makeRequest({ id: 'req-1', studentId: 'stu-1', projectStage: 'capstone', deadline: DEADLINE_3D })
    const r2 = makeRequest({ id: 'req-2', studentId: 'stu-2', projectStage: 'practice', deadline: DEADLINE_7D })
    const r3 = makeRequest({
      id: 'req-3', studentId: 'stu-3', equipmentId: 'eq-m',
      deadline: DEADLINE_7D,
      startAt: SLOT_A_START, endAt: SLOT_A_END,
    })

    const equipment = [EQ1, EQ_MULTI]

    const run = (reqs) =>
      allocate({ requests: reqs, equipment, history, now: NOW })
        .sort((a, b) => a.requestId < b.requestId ? -1 : 1)

    const result1 = run([r1, r2, r3])
    const result2 = run([r3, r1, r2])
    const result3 = run([r2, r3, r1])

    expect(result1).toEqual(result2)
    expect(result1).toEqual(result3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – winner explanation contains actual scores
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – explanation content', () => {
  it('winner explanation contains its numeric score', () => {
    const req = makeRequest({ id: 'req-1' })
    const [dec] = allocate({ requests: [req], equipment: [EQ1], history: EMPTY_HISTORY, now: NOW })
    expect(dec.outcome).toBe('recommend_approve')
    expect(dec.explanation).toContain(String(dec.score))
  })

  it('winner explanation contains /100', () => {
    const req = makeRequest({ id: 'req-1' })
    const [dec] = allocate({ requests: [req], equipment: [EQ1], history: EMPTY_HISTORY, now: NOW })
    expect(dec.explanation).toContain('/100')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// allocate – inputs not mutated
// ─────────────────────────────────────────────────────────────────────────────
describe('allocate – immutability', () => {
  it('original request objects are not mutated', () => {
    const req = makeRequest({ id: 'req-1' })
    const originalReq = JSON.parse(JSON.stringify(req))
    allocate({ requests: [req], equipment: [EQ1], history: EMPTY_HISTORY, now: NOW })
    expect(req).toEqual(originalReq)
  })

  it('original equipment objects are not mutated', () => {
    const equip = { ...EQ1 }
    const originalEquip = JSON.parse(JSON.stringify(equip))
    const req = makeRequest()
    allocate({ requests: [req], equipment: [equip], history: EMPTY_HISTORY, now: NOW })
    expect(equip).toEqual(originalEquip)
  })

  it('original history object is not mutated', () => {
    const history = {
      approvedHoursLast30d: { 'stu-1': 5 },
      noShowsLast60d: { 'stu-1': 1 },
    }
    const originalHistory = JSON.parse(JSON.stringify(history))
    const req = makeRequest()
    allocate({ requests: [req], equipment: [EQ1], history, now: NOW })
    expect(history).toEqual(originalHistory)
  })
})
