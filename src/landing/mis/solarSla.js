/** Expense approval TAT — 3 calendar days from request/created time. */
export const SOLAR_SLA_MINUTES = 3 * 24 * 60
/** Last 24 hours counts as At Risk, matching expense dashboard nearing window. */
export const SOLAR_SLA_WARNING_MINUTES = 24 * 60

export const SOLAR_SLA_FILTER_OPTIONS = [
    { value: 'ok', label: 'On Track' },
    { value: 'warning', label: 'At Risk' },
    { value: 'breached', label: 'Breached' },
    { value: 'within', label: 'On time' },
    { value: 'none', label: 'No SLA' },
]

export const SOLAR_SLA_BADGE = {
    ok: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200', dot: 'bg-emerald-500' },
    warning: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', dot: 'bg-amber-500' },
    breached: { badge: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200', dot: 'bg-red-500' },
    within: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200', dot: 'bg-emerald-500' },
    none: { badge: 'bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200', dot: 'bg-slate-300' },
}

function parseTime(raw) {
    if (!raw || raw === '—') return null
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d.getTime()
}

/** Compact duration like ITSM: 5d 20h 10m */
export function formatSlaDuration(totalMinutes) {
    const mins = Math.abs(Math.round(totalMinutes))
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const remainder = mins % 60
    if (hours < 24) {
        return remainder ? `${hours}h ${remainder}m` : `${hours}h`
    }
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    const parts = [`${days}d`]
    if (remHours) parts.push(`${remHours}h`)
    if (remainder) parts.push(`${remainder}m`)
    return parts.join(' ')
}

function isClosedStatus(status) {
    const token = String(status || '').trim().toLowerCase()
    return token.includes('approv') || token.includes('complete') || token.includes('reject')
}

const EMPTY = {
    hasSla: false,
    state: 'none',
    filterState: 'none',
    label: 'No SLA',
    shortLabel: 'No SLA',
    slaMinutes: 0,
    elapsedMinutes: 0,
    remainingMinutes: 0,
}

/**
 * ITSM-style SLA timing from request/created date.
 * Pending → countdown. Approved/Rejected → On time / Breached.
 */
export function getSolarSlaTiming(row, nowMs = Date.now()) {
    if (!row) return EMPTY
    const startMs = parseTime(row.createdAt || row.date || row.requestDate)
    if (!startMs) return EMPTY

    const slaMinutes = SOLAR_SLA_MINUTES
    const closed = isClosedStatus(row.status)
    const endMs = closed ? parseTime(row.closedOn || row.modifiedAt) || nowMs : nowMs
    const elapsedMinutes = Math.max(0, Math.round((endMs - startMs) / 60000))
    const remainingMinutes = slaMinutes - elapsedMinutes

    if (closed) {
        const breached = remainingMinutes < 0
        return {
            hasSla: true,
            state: breached ? 'breached' : 'within',
            filterState: breached ? 'breached' : 'within',
            slaMinutes,
            elapsedMinutes,
            remainingMinutes,
            label: breached ? 'SLA breached' : 'Resolved within SLA',
            shortLabel: breached ? 'Breached' : 'On time',
        }
    }

    if (remainingMinutes <= 0) {
        return {
            hasSla: true,
            state: 'breached',
            filterState: 'breached',
            slaMinutes,
            elapsedMinutes,
            remainingMinutes: 0,
            label: `${formatSlaDuration(elapsedMinutes - slaMinutes)} over`,
            shortLabel: 'Breached',
        }
    }

    const atRisk = remainingMinutes <= SOLAR_SLA_WARNING_MINUTES
    const left = `${formatSlaDuration(remainingMinutes)} left`
    return {
        hasSla: true,
        state: atRisk ? 'warning' : 'ok',
        filterState: atRisk ? 'warning' : 'ok',
        slaMinutes,
        elapsedMinutes,
        remainingMinutes,
        label: atRisk ? `${left} · at risk` : left,
        shortLabel: left,
    }
}

/** ITSM MIS SLA cell model — primary pill + gray subtitle. */
export function getSolarSlaMisDisplay(row, nowMs = Date.now()) {
    const empty = { primary: 'No SLA', sub: null, state: 'none' }
    const timing = getSolarSlaTiming(row, nowMs)
    if (!timing.hasSla) return empty

    const closed = isClosedStatus(row?.status)
    const exceeded = Math.max(0, timing.elapsedMinutes - timing.slaMinutes)

    if (closed) {
        if (timing.state === 'breached') {
            return {
                primary: 'Breached',
                sub: exceeded > 0 ? `Exceeded by ${formatSlaDuration(exceeded)}` : null,
                state: 'breached',
            }
        }
        return {
            primary: 'On Time',
            sub: timing.elapsedMinutes > 0 ? `Resolved in ${formatSlaDuration(timing.elapsedMinutes)}` : null,
            state: 'ok',
        }
    }

    if (timing.state === 'breached') {
        return {
            primary: 'Breached',
            sub: exceeded > 0 ? `Exceeded by ${formatSlaDuration(exceeded)}` : null,
            state: 'breached',
        }
    }

    if (timing.state === 'warning') {
        return {
            primary: 'At risk',
            sub: timing.remainingMinutes > 0 ? `${formatSlaDuration(timing.remainingMinutes)} left` : null,
            state: 'warning',
        }
    }

    let sub = null
    if (Number.isFinite(timing.remainingMinutes) && timing.remainingMinutes > 0) {
        sub = `${formatSlaDuration(timing.remainingMinutes)} left`
    } else if (Number.isFinite(timing.elapsedMinutes) && timing.elapsedMinutes > 0) {
        sub = `${formatSlaDuration(timing.elapsedMinutes)} elapsed`
    }

    return { primary: 'On track', sub, state: 'ok' }
}

export function getSolarSlaFilterState(row) {
    return getSolarSlaTiming(row).filterState || 'none'
}
