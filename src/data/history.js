/**
 * @fileoverview Pure function to compute history context from stored requests.
 *
 * @typedef {Object} HistoryContext
 * @property {{ [studentId: string]: number }} approvedHoursLast30d
 * @property {{ [studentId: string]: number }} noShowsLast60d
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Compute history context from an array of requests.
 * - `approvedHoursLast30d`: total hours of requests with status 'approved'
 *   whose session started within the last 30 days.
 * - `noShowsLast60d`: count of requests with status 'no_show' whose session
 *   started within the last 60 days.
 *
 * Both are keyed by studentId. Students absent from the result have 0 hours / 0 no-shows.
 *
 * @param {import('./seed.js').Request[]} requests
 * @param {string} now - ISO 8601 current time
 * @returns {HistoryContext}
 */
export function buildHistory(requests, now) {
  const nowMs = new Date(now).getTime()
  const cutoff30 = nowMs - 30 * MS_PER_DAY
  const cutoff60 = nowMs - 60 * MS_PER_DAY

  /** @type {{ [studentId: string]: number }} */
  const approvedHoursLast30d = {}
  /** @type {{ [studentId: string]: number }} */
  const noShowsLast60d = {}

  for (const req of requests) {
    const startMs = new Date(req.startAt).getTime()
    const endMs   = new Date(req.endAt).getTime()

    if (req.status === 'approved' && startMs >= cutoff30) {
      const hours = Math.max(0, (endMs - startMs) / (3600 * 1000))
      approvedHoursLast30d[req.studentId] =
        (approvedHoursLast30d[req.studentId] ?? 0) + hours
    }

    if (req.status === 'no_show' && startMs >= cutoff60) {
      noShowsLast60d[req.studentId] =
        (noShowsLast60d[req.studentId] ?? 0) + 1
    }
  }

  return { approvedHoursLast30d, noShowsLast60d }
}
