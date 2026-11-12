import { getSolarSlaFilterState } from './solarSla.js'

function normalizeStatus(status) {
    const token = String(status || '').trim().toLowerCase()
    if (token.includes('reject') || token.includes('cancel')) return 'Rejected'
    if (token.includes('approv') || token.includes('complete')) return 'Approved'
    if (token.includes('pending') || token.includes('progress') || token.includes('inprogress')) return 'Pending'
    return String(status || 'Pending').trim() || 'Pending'
}

export const APPROVAL_STEPS = [
    {
        key: 'ho',
        label: 'HO Approvals',
        slaMode: 'live',
        tokens: ['ho approval', 'ho approvals', 'head office', 'head office approval'],
        word: /\bho\b/,
    },
    {
        key: 'bu',
        label: 'BU Approvals',
        slaMode: 'live',
        tokens: ['bu approval', 'bu approvals', 'business unit', 'business unit approval'],
        word: /\bbu\b/,
    },
    {
        key: 'vp',
        label: 'VP Approvals',
        slaMode: 'live',
        tokens: ['vp approval', 'vp approvals', 'vice president', 'vice president approval'],
        word: /\bvp\b/,
    },
    {
        key: 'finance',
        label: 'Finance Processing',
        slaMode: 'live',
        tokens: ['finance processing', 'finance process', 'finance review', 'finance approval', 'finance'],
        word: /\bfinance\b/,
    },
]

export const CLOSED_STEPS = [
    { key: 'completed', label: 'Completed', slaMode: 'closed' },
    { key: 'rejected', label: 'Rejected', slaMode: 'closed' },
]

export const ALL_STEP_CARDS = [...APPROVAL_STEPS, ...CLOSED_STEPS]

export const CURRENT_STEP_BADGE = {
    ho: { badge: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200', dot: 'bg-teal-500' },
    bu: { badge: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200', dot: 'bg-sky-500' },
    vp: { badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200', dot: 'bg-indigo-500' },
    finance: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200', dot: 'bg-emerald-500' },
    rejected: { badge: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200', dot: 'bg-red-500' },
    completed: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200', dot: 'bg-emerald-500' },
    other: { badge: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', dot: 'bg-slate-500' },
}

function normalizeStepText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

export function matchApprovalStep(stepText, stepKey) {
    const step = APPROVAL_STEPS.find((item) => item.key === stepKey)
    if (!step) return false
    const text = normalizeStepText(stepText)
    if (!text || text === '—') return false
    if (step.tokens.some((token) => text.includes(token))) return true
    return step.word.test(text) && (text.includes('approv') || text.includes('process') || text.includes('review'))
}

export function resolveCurrentStepKey(row) {
    const status = normalizeStatus(row?.status)
    if (status === 'Rejected') return 'rejected'
    if (status === 'Approved') return 'completed'
    for (const step of APPROVAL_STEPS) {
        if (matchApprovalStep(row?.currentStep, step.key)) return step.key
    }
    return ''
}

export function formatCurrentStepLabel(row) {
    const key = resolveCurrentStepKey(row)
    const card = ALL_STEP_CARDS.find((item) => item.key === key)
    if (card) return card.label
    const raw = String(row?.currentStep || '').trim()
    return raw && raw !== '—' ? raw : '—'
}

export function getCurrentStepBadgeStyle(row) {
    const key = resolveCurrentStepKey(row)
    return CURRENT_STEP_BADGE[key] || CURRENT_STEP_BADGE.other
}

export const OPERATIONS_STEP_KEYS = ['ho', 'bu', 'vp']

export function rowMatchesStepCard(row, stepKey) {
    if (!stepKey) return true
    if (stepKey === 'rejected') return normalizeStatus(row?.status) === 'Rejected'
    if (stepKey === 'completed') return normalizeStatus(row?.status) === 'Approved'
    if (stepKey === 'operations') {
        if (normalizeStatus(row?.status) !== 'Pending') return false
        return OPERATIONS_STEP_KEYS.some((key) => matchApprovalStep(row?.currentStep, key))
    }
    if (stepKey === 'finance') {
        return normalizeStatus(row?.status) === 'Pending' && matchApprovalStep(row?.currentStep, 'finance')
    }
    if (stepKey === 'onTime') {
        const state = getSolarSlaFilterState(row)
        return state === 'ok' || state === 'within'
    }
    if (stepKey === 'atRisk') return getSolarSlaFilterState(row) === 'warning'
    if (stepKey === 'breached') return getSolarSlaFilterState(row) === 'breached'
    return normalizeStatus(row?.status) === 'Pending' && matchApprovalStep(row?.currentStep, stepKey)
}

function slaBucket(row) {
    const state = getSolarSlaFilterState(row)
    if (state === 'breached') return 'breached'
    if (state === 'warning') return 'atRisk'
    return 'onTime'
}

function summarizeRows(rows) {
    let onTime = 0
    let atRisk = 0
    let breached = 0
    for (const row of rows) {
        const bucket = slaBucket(row)
        if (bucket === 'onTime') onTime += 1
        if (bucket === 'atRisk') atRisk += 1
        if (bucket === 'breached') breached += 1
    }
    return { count: rows.length, onTime, atRisk, breached }
}

function rowsForStepCard(rows, step) {
    return (rows || []).filter((row) => rowMatchesStepCard(row, step.key))
}

/** Counts for HO / BU / VP / Finance / Rejected / Completed in the selected queue. */
export function computeApprovalStepCards(rows = []) {
    return ALL_STEP_CARDS.map((step) => {
        const summary = summarizeRows(rowsForStepCard(rows, step))
        return {
            key: step.key,
            label: step.label,
            slaMode: step.slaMode,
            total: summary.count,
            onTime: summary.onTime,
            atRisk: summary.atRisk,
            breached: summary.breached,
        }
    })
}

function rowMatchesWorkflowClosed(row, section) {
    const status = normalizeStatus(row?.status)
    if (status !== 'Approved' && status !== 'Rejected') return false
    if (section === 'operations') {
        if (status === 'Approved') return true
        return !matchApprovalStep(row?.currentStep, 'finance')
    }
    if (section === 'finance') {
        if (status === 'Approved') return true
        return matchApprovalStep(row?.currentStep, 'finance')
    }
    return false
}

export function rowMatchesWorkflowCard(row, filterKey) {
    if (!filterKey) return true
    const parts = String(filterKey).split('-')
    if (parts.length < 2) return rowMatchesStepCard(row, filterKey)

    const [section, metric] = parts
    const pendingInSection = () => rowMatchesStepCard(row, section)
    const closedInSection = () => rowMatchesWorkflowClosed(row, section)
    const inSectionScope = () => pendingInSection() || closedInSection()

    switch (metric) {
        case 'total':
            return inSectionScope()
        case 'pending':
            return pendingInSection()
        case 'closed':
            return closedInSection()
        case 'onTime': {
            const state = getSolarSlaFilterState(row)
            return pendingInSection() && (state === 'ok' || state === 'within')
        }
        case 'atRisk':
            return pendingInSection() && getSolarSlaFilterState(row) === 'warning'
        case 'breached':
            return pendingInSection() && getSolarSlaFilterState(row) === 'breached'
        default:
            return rowMatchesStepCard(row, filterKey)
    }
}

function buildSectionMetrics(rows, sectionKey) {
    const list = rows || []
    const pendingRows = list.filter((row) => rowMatchesStepCard(row, sectionKey))
    const closedRows = list.filter((row) => rowMatchesWorkflowClosed(row, sectionKey))
    const sla = summarizeRows(pendingRows)

    return {
        key: sectionKey,
        total: pendingRows.length + closedRows.length,
        pending: pendingRows.length,
        closed: closedRows.length,
        onTime: sla.onTime,
        atRisk: sla.atRisk,
        breached: sla.breached,
    }
}

/** Two workflow rows: Operations and Finance, each with Total/Pending/Closed/On Time/At Risk/Breached. */
export function computeWorkflowSectionCards(rows = []) {
    return {
        operations: buildSectionMetrics(rows, 'operations'),
        finance: buildSectionMetrics(rows, 'finance'),
    }
}

/** @deprecated Use computeWorkflowSectionCards */
export function computeQueueInsightCards(rows = []) {
    const sections = computeWorkflowSectionCards(rows)
    return {
        operations: { key: 'operations', label: 'Operations', total: sections.operations.pending },
        finance: { key: 'finance', label: 'Finance', total: sections.finance.pending },
        onTime: { key: 'onTime', label: 'On Time', sub: 'Within SLA', total: sections.operations.onTime + sections.finance.onTime },
        atRisk: { key: 'atRisk', label: 'At Risk', sub: 'Deadline approaching', total: sections.operations.atRisk + sections.finance.atRisk },
        breached: { key: 'breached', label: 'Breached', sub: 'Past deadline', total: sections.operations.breached + sections.finance.breached },
    }
}
