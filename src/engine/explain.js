/**
 * @fileoverview LabLink allocation engine — human-readable explanations.
 *
 * Template strings only; no invented numbers.
 * Three modes:
 *   'winner'  – successful approval
 *   'loser'   – rejected or waitlisted
 *   'invalid' – hard-constraint failure
 */

import { URGENCY_MAX, STAGE_MAX, FAIRNESS_MAX, RELIABILITY_MAX } from './constants.js'

/**
 * @typedef {import('./scoring.js').ScoreBreakdown} ScoreBreakdown
 * @typedef {import('./scoring.js').ScoreResult}    ScoreResult
 */

/**
 * Return the name of the breakdown factor that contributes the largest
 * absolute gap between winner and loser.
 *
 * @param {ScoreBreakdown} loserBreakdown
 * @param {ScoreBreakdown} winnerBreakdown
 * @returns {{ factor: string, loserVal: number, winnerVal: number, gap: number }}
 */
function biggestGapFactor(loserBreakdown, winnerBreakdown) {
  const factors = [
    { factor: 'urgency',     max: URGENCY_MAX },
    { factor: 'stage',       max: STAGE_MAX },
    { factor: 'fairness',    max: FAIRNESS_MAX },
    { factor: 'reliability', max: RELIABILITY_MAX },
  ]
  let best = { factor: 'urgency', loserVal: 0, winnerVal: 0, gap: -Infinity }
  for (const { factor } of factors) {
    const gap = (winnerBreakdown[factor] ?? 0) - (loserBreakdown[factor] ?? 0)
    if (gap > best.gap) {
      best = {
        factor,
        loserVal:  loserBreakdown[factor] ?? 0,
        winnerVal: winnerBreakdown[factor] ?? 0,
        gap,
      }
    }
  }
  return best
}

/**
 * Concrete improvement hint for a given factor.
 *
 * @param {string} factor
 * @returns {string}
 */
function improvementHint(factor) {
  switch (factor) {
    case 'urgency':
      return 'Submit requests earlier relative to your project deadline to earn higher urgency points.'
    case 'stage':
      return 'Requests linked to capstone projects receive the highest stage priority.'
    case 'fairness':
      return 'Students who have used less equipment time in the last 30 days receive a fairness bonus.'
    case 'reliability':
      return 'Attending every booked session improves your reliability score (5 points per no-show deducted).'
    default:
      return 'Improving your overall score will increase your chances in future rounds.'
  }
}

/**
 * Generate a plain-language explanation for a single decision.
 *
 * @param {'winner'|'loser'|'invalid'} mode
 * @param {Object} ctx
 * @param {ScoreResult} [ctx.scored]              – for winner/loser
 * @param {number}      [ctx.topWinnerScore]       – for loser
 * @param {ScoreBreakdown} [ctx.topWinnerBreakdown] – for loser
 * @param {string[]}    [ctx.reasons]              – for invalid
 * @returns {string}
 */
export function explainDecision(mode, ctx) {
  if (mode === 'winner') {
    const { scored } = ctx
    const { breakdown } = scored

    // Find the top contributing factor
    const factors = [
      { name: 'urgency',     value: breakdown.urgency },
      { name: 'stage',       value: breakdown.stage },
      { name: 'fairness',    value: breakdown.fairness },
      { name: 'reliability', value: breakdown.reliability },
    ]
    const top = factors.reduce((a, b) => (b.value > a.value ? b : a))

    return (
      `Approved with a score of ${scored.total}/100. ` +
      `Strongest factor: ${top.name} (${top.value} pts). ` +
      `Breakdown — urgency: ${breakdown.urgency}, stage: ${breakdown.stage}, ` +
      `fairness: ${breakdown.fairness}, reliability: ${breakdown.reliability}.`
    )
  }

  if (mode === 'loser') {
    const { scored, topWinnerScore, topWinnerBreakdown } = ctx
    const { breakdown } = scored

    let gapLine = ''
    if (topWinnerBreakdown != null) {
      const { factor, loserVal, winnerVal } = biggestGapFactor(breakdown, topWinnerBreakdown)
      const hint = improvementHint(factor)
      gapLine =
        ` Largest gap in factor "${factor}": winner scored ${winnerVal} vs your ${loserVal}. ` +
        hint
    }

    const winnerRef =
      topWinnerScore != null
        ? `The highest-scoring competing request scored ${topWinnerScore}/100; your score is ${scored.total}/100.`
        : `Your score is ${scored.total}/100.`

    return (
      `Not approved this round. ${winnerRef}` +
      ` Breakdown — urgency: ${breakdown.urgency}, stage: ${breakdown.stage}, ` +
      `fairness: ${breakdown.fairness}, reliability: ${breakdown.reliability}.` +
      gapLine
    )
  }

  if (mode === 'invalid') {
    const { reasons } = ctx
    return `Request is invalid and cannot be processed. Issues: ${reasons.join(' | ')}`
  }

  return 'Unknown decision mode.'
}
