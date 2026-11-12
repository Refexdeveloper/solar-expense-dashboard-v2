import {
    APP_ID,
    extractListPayload,
    resolveAdvanceProcessId,
    resolveAdvanceReportId,
    resolveAppId,
    resolveReimbursementAppId,
    resolveReimbursementProcessId,
    resolveReimbursementReportId,
    unwrapKfApiResponse,
} from './kfEnv.js'

/** @deprecated Use resolveAppId() — kept for reference / local tooling. */
export { APP_ID }

export const PROCESS_IDS = {
    advance: 'Solar_Advance_Request_YTLA',
    reimbursement: 'Technician_Reimbursement__YTLM',
}

export const REQUEST_TYPE_OPTIONS = [
    { id: 'advance', label: 'Advance', icon: 'ri-sun-line' },
    { id: 'reimbursement', label: 'Reimbursement', icon: 'ri-file-list-3-line' },
]

/** All Items report + column ids for Advance (Solar Advance Request). */
export const ADVANCE_REPORT = {
    reportId: 'All_Items_A11',
    fields: {
        requestNo: 'Column_JNgPoZGZis',
        requestAmount: 'Column_XFU4vgscWp',
        site: 'Column_iJWnwoiamJ',
        category: 'Column_Xjls1FEtUh',
        requestDate: 'Column_Mm4IX6IoV7',
        status: 'Column_iO9N16ppIo',
        createdBy: 'Column_3hkVma1Tpv',
        requestorEmail: 'Column_e_6rPkprzZ',
        createdAt: 'Column_IUYBvxeIca',
        currentStep: 'Column_vvX95q_obP',
    },
    rawFieldIds: {
        requestNo: 'Request_No',
        requestAmount: 'requested_amount_YTLF',
        site: 'Side_ID',
        category: 'Budget_Category',
        requestDate: 'request_date_YTLI',
        status: '_status',
        createdBy: '_created_by',
        createdAt: '_created_at',
        currentStep: '_current_step',
        requestorEmail: 'Requested_Email',
        assignedTo: '_current_assigned_to',
        source: '_created_from',
        modifiedBy: '_modified_by',
    },
}

export const ADVANCE_TABLE_COLUMNS = [
    { key: 'id', label: 'Request No', sortable: true },
    { key: 'employee', label: 'Requestor', sortable: true },
    { key: 'project', label: 'Site', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'currentStep', label: 'Current Step' },
    { key: 'source', label: 'Source' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'date', label: 'Request Date', sortable: true },
    { key: 'closedOn', label: 'Closed Date' },
    { key: 'closedBy', label: 'Closed By' },
    { key: 'sla', label: 'SLA' },
]

/** All Items report + column ids for Reimbursement (All_Items_A12). */
export const REIMBURSEMENT_REPORT = {
    reportId: 'All_Items_A12',
    fields: {
        claimNo: 'Column_kwAjGf7kER',
        requestAmount: 'Column_Y6BPVVxBJD',
        site: 'Column_EhiVPHSazx',
        expenseType: 'Column_Aws67JJR8Q',
        serviceCategory: 'Column_rrn9ndDObK',
        claimMonth: 'Column_UgI9rS3ORp',
        claimMonthFallback: 'Column_9X5YHAO70s',
        status: 'Column_lstKxONrIt',
        createdBy: 'Column_-MImniM8u0',
        requestorEmail: 'Column_eoqqjEe612',
        createdAt: 'Column_cCeKrTSpJL',
        currentStep: 'Column_BM-zCc0rWo',
    },
    rawFieldIds: {
        claimNo: 'Claim_No',
        requestAmount: 'Request_Amount',
        site: 'Side_ID',
        expenseType: 'Expense_Type',
        serviceCategory: 'Service_Category',
        claimMonth: 'claim_month_YTLN',
        status: '_status',
        createdBy: '_created_by',
        createdAt: '_created_at',
        currentStep: '_current_step',
        requestorEmail: 'Requested_Email',
        assignedTo: '_current_assigned_to',
        source: '_created_from',
        modifiedBy: '_modified_by',
    },
}

export const REIMBURSEMENT_TABLE_COLUMNS = [
    { key: 'id', label: 'Claim No', sortable: true },
    { key: 'claimMonth', label: 'Claim Month' },
    { key: 'employee', label: 'Requestor', sortable: true },
    { key: 'project', label: 'Site', sortable: true },
    { key: 'category', label: 'Expense Type', sortable: true },
    { key: 'serviceCategory', label: 'Service Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'currentStep', label: 'Current Step' },
    { key: 'source', label: 'Source' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'date', label: 'Request Date', sortable: true },
    { key: 'closedOn', label: 'Closed Date' },
    { key: 'closedBy', label: 'Closed By' },
    { key: 'sla', label: 'SLA' },
]

const TABLE_COLUMNS_BY_TYPE = {
    advance: ADVANCE_TABLE_COLUMNS,
    reimbursement: REIMBURSEMENT_TABLE_COLUMNS,
}

/** Same parent views as mis-table. */
export const WORKFLOW_SCOPES = [
    { id: 'myItems', label: 'My Items' },
    { id: 'myTasks', label: 'My Tasks' },
    { id: 'participated', label: 'Participated' },
]

/** My Items statuses — Drafts first, same set as mis-table. */
export const MY_ITEM_STATUSES = [
    { id: 'Draft', label: 'Drafts' },
    { id: 'InProgress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Withdrawn', label: 'Withdrawn' },
    { id: 'Rejected', label: 'Rejected' },
]

const PAGE_SIZE = 100
const MAX_PAGES = 20

function firstIdValue(val) {
    if (val == null || val === '') return ''
    if (Array.isArray(val)) {
        for (const item of val) {
            const id = firstIdValue(item)
            if (id) return id
        }
        return ''
    }
    if (typeof val === 'object') {
        return String(val._id ?? val.Id ?? val.id ?? val.Value ?? val.value ?? '').trim()
    }
    return String(val).trim()
}

/**
 * Activity *instance* id for opening an existing item.
 * Step definition ids (`_activity_id`, `ActivityID`) are not used — passing those
 * opens the popup with a blank form.
 */
function extractActivityInstanceId(row) {
    if (!row || typeof row !== 'object') return ''
    const ctx = row._current_context
    const firstCtx = Array.isArray(ctx) ? ctx[0] : ctx && typeof ctx === 'object' ? ctx : null
    return (
        firstIdValue(row._activity_instance_id) ||
        firstIdValue(row._context_activity_instance_id) ||
        firstIdValue(row._current_activity_instance_id) ||
        firstIdValue(row.Activity_Instance_ID) ||
        firstIdValue(row.activity_instance_id) ||
        firstIdValue(row.ActivityInstanceId) ||
        firstIdValue(row._activityInstanceId) ||
        firstIdValue(firstCtx?._context_activity_instance_id) ||
        firstIdValue(firstCtx?._activity_instance_id) ||
        ''
    )
}

function extractActivityIdFromProgress(progress) {
    if (!progress || typeof progress !== 'object') return ''
    const direct = extractActivityInstanceId(progress)
    if (direct) return direct

    const walk = (node, depth = 0) => {
        if (!node || depth > 6) return ''
        if (Array.isArray(node)) {
            const current = node.find((step) =>
                /inprogress|pending|current/i.test(
                    String(step?._status ?? step?.Status ?? step?.status ?? step?.NodeType ?? '')
                )
            )
            const ordered = current ? [current, ...node] : [...node].reverse()
            for (const item of ordered) {
                const id = walk(item, depth + 1)
                if (id) return id
            }
            return ''
        }
        if (typeof node === 'object') {
            return (
                extractActivityInstanceId(node) ||
                walk(node.Steps || node.steps, depth + 1) ||
                walk(node.Activities || node.activities, depth + 1) ||
                walk(node.Process || node.process, depth + 1) ||
                walk(node.Data || node.data, depth + 1) ||
                ''
            )
        }
        return ''
    }

    return (
        walk(progress.Steps) ||
        walk(progress.steps) ||
        walk(progress.Activities) ||
        walk(progress.activities) ||
        walk(progress.Data) ||
        walk(progress.data) ||
        walk(progress.Process) ||
        walk(progress.process) ||
        ''
    )
}

/** Build instance → activity map from PWA / report / participated rows (popup open). */
function buildInstanceActivityMapFromRows(rows) {
    const map = {}
    if (!Array.isArray(rows)) return map
    for (const item of rows) {
        const instanceId = item?._id ? String(item._id).trim() : ''
        const activityId = extractActivityInstanceId(item)
        if (instanceId && activityId && !map[instanceId]) {
            map[instanceId] = activityId
        }
    }
    return map
}

/** Site Incharge — PWA myitems (Advance + Reimbursement). Same URL as v1. */
async function fetchPwaMyItemsRaw(accountId, processId, apiGet) {
    if (!accountId || !processId || typeof apiGet !== 'function') return []
    const allRows = []
    for (let page = 1; page <= MAX_PAGES; page++) {
        const url = `/process/2/${accountId}/pwa/${processId}/myitems?page_number=${page}&page_size=${PAGE_SIZE}`
        const pageRows = extractListPayload(await apiGet(url))
        if (!pageRows.length) break
        allRows.push(...pageRows)
        if (pageRows.length < PAGE_SIZE) break
    }
    return allRows
}

/** My Tasks — PWA pending API (Advance + Reimbursement). Same URL as v1. */
async function fetchPwaPendingRaw(accountId, processId, apiGet) {
    if (!accountId || !processId || typeof apiGet !== 'function') return []
    const allRows = []
    for (let page = 1; page <= MAX_PAGES; page++) {
        const url = `/process/2/${accountId}/pwa/${processId}/pending?page_number=${page}&page_size=${PAGE_SIZE}`
        const pageRows = extractListPayload(await apiGet(url))
        if (!pageRows.length) break
        allRows.push(...pageRows)
        if (pageRows.length < PAGE_SIZE) break
    }
    return allRows
}

const KF_LIST_PAGE_SIZE = 50

function activityIdFromStep(activity) {
    return String(activity?._id ?? activity?.Id ?? activity?.ActivityId ?? '').trim()
}

function extractActivityCountList(resp) {
    if (Array.isArray(resp)) return resp
    return extractListPayload(resp)
}

/** Participated step counts — same endpoint as mis-table. */
async function fetchParticipatedActivities(accountId, processId, appId, apiGet) {
    if (!accountId || !processId || typeof apiGet !== 'function') return []
    const baseUrl = `/process/2/${accountId}/${processId}/participated/activity/count`
    let listed = extractActivityCountList(await apiGet(baseUrl))
    if (!listed.length && appId) {
        listed = extractActivityCountList(
            await apiGet(`${baseUrl}?_application_id=${encodeURIComponent(appId)}`)
        )
    }
    return Array.isArray(listed) ? listed : []
}

/** Participated rows for one activity — same URL shape as mis-table. */
async function fetchParticipatedForActivity(accountId, processId, appId, activityId, apiGet) {
    const allRows = []
    const appQuery = appId ? `&_application_id=${encodeURIComponent(appId)}` : ''
    for (let page = 1; page <= MAX_PAGES; page++) {
        const url =
            `/process/2/${accountId}/${processId}/participated/activity/${encodeURIComponent(String(activityId))}` +
            `?apply_preference=true&page_number=${page}&page_size=${KF_LIST_PAGE_SIZE}&skip_aggregation=true${appQuery}`
        const pageRows = extractListPayload(await apiGet(url))
        if (!pageRows.length) break
        allRows.push(...pageRows)
        if (pageRows.length < KF_LIST_PAGE_SIZE) break
    }
    return allRows
}

async function fetchAllParticipatedItems(accountId, processId, appId, apiGet) {
    const activities = await fetchParticipatedActivities(accountId, processId, appId, apiGet)
    const batches = await Promise.all(
        activities.map(async (activity) => {
            const activityId = activityIdFromStep(activity)
            if (!activityId) return []
            try {
                return await fetchParticipatedForActivity(accountId, processId, appId, activityId, apiGet)
            } catch (e) {
                console.error('[solar-expense-dashboard] participated activity failed', activityId, e)
                return []
            }
        })
    )
    return batches.flat()
}

/** Prefer pending (openable task), then my items, then participated. */
function mergeInstanceRows(...lists) {
    const map = new Map()
    for (const list of lists) {
        for (const item of list || []) {
            const id = String(item?._id ?? '').trim()
            if (!id) continue
            const existing = map.get(id)
            map.set(id, existing ? { ...item, ...existing } : item)
        }
    }
    return Array.from(map.values())
}

function extractReportColumns(resp) {
    if (!resp || typeof resp !== 'object') return []
    if (Array.isArray(resp.Columns)) return resp.Columns
    if (Array.isArray(resp.columns)) return resp.columns
    const nested = resp.data ?? resp.Data
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        if (Array.isArray(nested.Columns)) return nested.Columns
        if (Array.isArray(nested.columns)) return nested.columns
    }
    return []
}

/** Column Ids whose FieldId/Name look like claim/service/request amounts. */
function collectAmountColumnIds(columns, reportConfig) {
    const ids = new Set()
    const configured = reportConfig?.fields?.requestAmount
    if (configured) ids.add(String(configured))

    for (const col of columns || []) {
        const id = String(col?.Id ?? '').trim()
        if (!id) continue
        const fieldId = String(col?.FieldId ?? '').trim()
        const name = String(col?.Name ?? '').trim()
        const blob = `${fieldId} ${name}`
        if (/date|time|count|month|type|category|status|step|email|site|requestor/i.test(blob)) continue
        if (
            /^(Request_Amount|Total_Amount|Total_Claimable_Amount|Claim_Amount|Service_Amount|Site_Service_Amount|Total_Service_Amount|Amount|Grand_Total|Final_Total_Amount)$/i.test(
                fieldId
            ) ||
            /\b(request\s*)?amount\b|\btotal\b.*\b(amount|claim|service|reimburs)/i.test(name) ||
            /\b(service|site)\b.*\b(amount|total|cost)\b/i.test(name)
        ) {
            ids.add(id)
        }
    }
    return Array.from(ids)
}

async function fetchRawReportRows(accountId, processId, reportId, appId, apiGet) {
    const allRows = []
    let columns = []
    for (let page = 1; page <= MAX_PAGES; page++) {
        const url = `/process-report/2/${accountId}/${processId}/${reportId}?_application_id=${encodeURIComponent(appId)}&page_number=${page}&page_size=${PAGE_SIZE}`
        const resp = await apiGet(url)
        if (!columns.length) columns = extractReportColumns(resp)
        const pageRows = extractListPayload(resp)
        if (!pageRows.length) break
        allRows.push(...pageRows)
        if (pageRows.length < PAGE_SIZE) break
    }
    return { rows: allRows, columns }
}

function buildReportRowMap(reportRows) {
    const map = {}
    for (const row of reportRows) {
        const id = String(row?._id ?? '').trim()
        if (id) map[id] = row
    }
    return map
}

function isBlankFieldValue(value) {
    if (value === undefined || value === null || value === '') return true
    if (Array.isArray(value) && value.length === 0) return true
    return false
}

function readRowField(row, reportConfig, key) {
    const columnId = reportConfig?.fields?.[key]
    if (columnId && !isBlankFieldValue(row?.[columnId])) {
        return row[columnId]
    }
    const rawFieldId = reportConfig?.rawFieldIds?.[key]
    if (rawFieldId && !isBlankFieldValue(row?.[rawFieldId])) {
        return row[rawFieldId]
    }
    return undefined
}

function cellToText(cell) {
    if (cell == null || cell === '') return ''
    if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') return String(cell)
    if (typeof cell === 'object') {
        return String(cell.Name ?? cell.name ?? cell.Value ?? cell.value ?? cell.Email ?? cell.email ?? '').trim()
    }
    return String(cell).trim()
}

function peopleToNameList(value) {
    if (value == null || value === '' || value === '—') return []
    if (Array.isArray(value)) {
        const names = []
        const seen = new Set()
        for (const entry of value) {
            for (const name of peopleToNameList(entry)) {
                const token = name.toLowerCase()
                if (!name || seen.has(token)) continue
                seen.add(token)
                names.push(name)
            }
        }
        return names
    }
    if (typeof value === 'object') {
        const name = String(value.Name ?? value.name ?? '').trim()
        return name ? [name] : []
    }
    return String(value)
        .split(/[,;\n]/)
        .map((part) => part.trim())
        .filter(Boolean)
}

function mapSourceLabel(raw) {
    const text = cellToText(raw)
    if (!text) return ''
    const lower = text.toLowerCase()
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) {
        return 'Mobile'
    }
    if (lower.includes('email') || lower.includes('mail')) return 'Email'
    if (lower.includes('web') || lower.includes('pwa') || lower.includes('desktop') || lower.includes('browser')) {
        return 'Web'
    }
    return text
}

function toTimestampText(raw) {
    if (raw == null || raw === '') return ''
    if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString()
    return cellToText(raw)
}

/** Display claim month as Jan-26 / Mar-26. */
function formatClaimMonth(raw) {
    if (raw == null || raw === '') return ''
    if (typeof raw === 'object' && !(raw instanceof Date)) {
        const nested = raw.Value ?? raw.value ?? raw.Name ?? raw.name ?? raw.Label ?? raw.label
        if (nested != null && nested !== raw) return formatClaimMonth(nested)
    }

    if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
        const mon = raw.toLocaleString('en-US', { month: 'short' })
        return `${mon}-${String(raw.getFullYear()).slice(-2)}`
    }

    const text = cellToText(raw).trim()
    if (!text) return ''

    // Already like Jan-26 / JAN-26
    const shortMatch = text.match(/^([A-Za-z]{3})[-\s/]?(\d{2}|\d{4})$/)
    if (shortMatch) {
        const mon = shortMatch[1].slice(0, 1).toUpperCase() + shortMatch[1].slice(1, 3).toLowerCase()
        const yy = shortMatch[2].length === 4 ? shortMatch[2].slice(-2) : shortMatch[2]
        return `${mon}-${yy}`
    }

    // 2026-01 / 2026-01-15 / 01/2026
    const iso = text.match(/^(\d{4})[-/](\d{1,2})/)
    if (iso) {
        const d = new Date(Number(iso[1]), Number(iso[2]) - 1, 1)
        if (!Number.isNaN(d.getTime())) {
            const mon = d.toLocaleString('en-US', { month: 'short' })
            return `${mon}-${String(d.getFullYear()).slice(-2)}`
        }
    }

    const dmy = text.match(/^(\d{1,2})[-/](\d{4})$/)
    if (dmy) {
        const d = new Date(Number(dmy[2]), Number(dmy[1]) - 1, 1)
        if (!Number.isNaN(d.getTime())) {
            const mon = d.toLocaleString('en-US', { month: 'short' })
            return `${mon}-${String(d.getFullYear()).slice(-2)}`
        }
    }

    const parsed = new Date(text)
    if (!Number.isNaN(parsed.getTime())) {
        const mon = parsed.toLocaleString('en-US', { month: 'short' })
        return `${mon}-${String(parsed.getFullYear()).slice(-2)}`
    }

    return text
}

function isClosedStatus(status) {
    const token = String(status || '').trim().toLowerCase()
    return token.includes('approv') || token.includes('complete') || token.includes('reject')
}

/** Parse Kissflow number/currency cells (plain number, string, or { Value } objects). */
function toNumber(val) {
    if (val == null || val === '') return 0
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0
    if (typeof val === 'boolean') return val ? 1 : 0
    if (Array.isArray(val)) {
        let sum = 0
        for (const item of val) sum += toNumber(item)
        return sum
    }
    if (typeof val === 'object') {
        const nested =
            val.Value ??
            val.value ??
            val.Amount ??
            val.amount ??
            val.Total ??
            val.total ??
            val.Number ??
            val.number
        if (nested != null && nested !== val) return toNumber(nested)
        return 0
    }
    const n = Number(String(val).replace(/[^\d.-]/g, ''))
    return Number.isFinite(n) ? n : 0
}

/** Sum Amount/Total on Kissflow child tables (Site Services line items often live here). */
function sumChildTableAmounts(row) {
    if (!row || typeof row !== 'object') return 0
    let sum = 0
    for (const [key, value] of Object.entries(row)) {
        const isTable =
            /^Table::/i.test(key) ||
            /line_?items?|site_?services?|service_?details?|expense_?details?/i.test(key)
        if (!isTable || !Array.isArray(value) || !value.length) continue
        for (const line of value) {
            if (!line || typeof line !== 'object') continue
            sum += toNumber(
                line.Amount ??
                    line.amount ??
                    line.Total ??
                    line.total ??
                    line.Line_Amount ??
                    line.Item_Amount ??
                    line.Service_Amount ??
                    line.Request_Amount ??
                    line.Cost ??
                    line.cost ??
                    line.Value ??
                    line.value
            )
        }
    }
    return sum
}

/**
 * Resolve display amount for Advance / Reimbursement rows.
 * Site Services often leaves Request_Amount empty/0 and stores totals in
 * Total_Amount / Service_* fields, other report Amount columns, or Table::* line items
 * (currency cells may also arrive as `{ Value }` objects).
 */
function resolveRowAmount(row, reportConfig) {
    const r = row && typeof row === 'object' ? row : {}
    const candidates = [
        readRowField(r, reportConfig, 'requestAmount'),
        ...(reportConfig?.amountColumnIds || []).map((colId) => r[colId]),
        r.Request_Amount,
        r.requested_amount_YTLF,
        r.Total_Amount,
        r.Total_Claimable_Amount,
        r.Total_Reimbursable_Amount,
        r.Final_Total_Amount,
        r.Claim_Amount,
        r.Grand_Total,
        r.Amount,
        r.Service_Amount,
        r.Site_Service_Amount,
        r.Total_Service_Amount,
        r.Service_Total,
        r.Total_Service_Cost,
    ]

    for (const candidate of candidates) {
        const n = toNumber(candidate)
        if (n > 0) return n
    }

    for (const [key, value] of Object.entries(r)) {
        if (!/(^|_)(amount|total|claimable|reimbursable)(_|$)/i.test(key) && !/Amount|Total/.test(key)) {
            continue
        }
        if (/date|time|count|step|status|month|type|category|email|_id$|Id$/i.test(key)) continue
        if (/^Table::/i.test(key)) continue
        const n = toNumber(value)
        if (n > 0) return n
    }

    const fromTable = sumChildTableAmounts(r)
    if (fromTable > 0) return fromTable

    return toNumber(candidates[0])
}

function siteNameFromRef(val) {
    if (val == null || val === '') return ''
    if (typeof val === 'object') {
        return String(val.site_name_fqiW ?? val.Name ?? val.name ?? '').trim()
    }
    return String(val).trim()
}

function normalizeStatus(raw) {
    const s = String(raw ?? '').trim()
    if (!s) return 'Pending'
    if (s === 'InProgress') return 'Pending'
    if (s === 'Completed') return 'Approved'
    if (s === 'Rejected') return 'Rejected'
    if (/pending/i.test(s)) return 'Pending'
    if (/approv|complete/i.test(s)) return 'Approved'
    if (/reject/i.test(s)) return 'Rejected'
    return s
}

function rawStatusText(row) {
    const status = row?._status ?? row?.Status ?? row?.status ?? row?._flow_status ?? ''
    if (status && typeof status === 'object') {
        return String(status.Name ?? status.name ?? status.Value ?? status.value ?? '').trim()
    }
    return String(status ?? '').trim()
}

function rawStepText(row) {
    const step = row?._current_step ?? row?.Current_Step ?? ''
    if (step && typeof step === 'object') {
        return String(step.Name ?? step.name ?? '').trim()
    }
    return String(step ?? '').trim()
}

function isDraftItem(row) {
    if (!row || typeof row !== 'object') return false
    const status = rawStatusText(row).toLowerCase()
    if (status === 'draft' || status === 'notsubmitted' || status === 'not_submitted' || status.includes('draft')) {
        return true
    }
    const step = rawStepText(row).toLowerCase()
    return step === 'draft'
}

function excludeDraftItems(rows) {
    return (rows || []).filter((row) => !isDraftItem(row))
}

function formatDateValue(raw) {
    const text = cellToText(raw)
    if (!text) return ''
    const d = new Date(text)
    if (Number.isNaN(d.getTime())) return text
    return d.toISOString().slice(0, 10)
}

function rowBelongsToUser(row, reportConfig, userEmail, userId) {
    const emailNeedle = String(userEmail || '').trim().toLowerCase()
    const userNeedle = String(userId || '').trim()
    const fields = reportConfig?.fields || {}
    const rawFieldIds = reportConfig?.rawFieldIds || {}

    const requestorEmail = cellToText(
        readRowField(row, reportConfig, 'requestorEmail') ??
            row?.Requestor_Email ??
            row?.requestor_email ??
            row?.Email_Id ??
            row?.Email
    )
        .trim()
        .toLowerCase()
    if (emailNeedle && requestorEmail && requestorEmail === emailNeedle) return true

    const createdBy =
        row?.[fields.createdBy] ??
        row?.[rawFieldIds.createdBy] ??
        row?._created_by
    const createdById = typeof createdBy === 'object' ? String(createdBy?._id ?? '').trim() : ''
    const createdByEmail = typeof createdBy === 'object'
        ? String(createdBy?.Email ?? createdBy?.email ?? '').trim().toLowerCase()
        : ''

    if (userNeedle && createdById && createdById === userNeedle) return true
    if (emailNeedle && createdByEmail && createdByEmail === emailNeedle) return true

    return !emailNeedle && !userNeedle
}

function categoryToText(expenseType, serviceCategory) {
    const expense = cellToText(expenseType)
    if (expense) return expense
    const fromService = normalizeServiceCategories(serviceCategory).join(', ')
    return fromService || ''
}

/** Multiselect Service Category → unique display labels. */
function normalizeServiceCategories(raw) {
    if (raw == null || raw === '' || raw === '—') return []
    const seen = new Set()
    const out = []
    const push = (label) => {
        const text = String(label || '').trim()
        if (!text || text === '—') return
        const key = text.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        out.push(text)
    }
    const walk = (value) => {
        if (value == null || value === '' || value === '—') return
        if (Array.isArray(value)) {
            value.forEach(walk)
            return
        }
        if (typeof value === 'object') {
            if (Array.isArray(value.Values)) {
                walk(value.Values)
                return
            }
            if (Array.isArray(value.values)) {
                walk(value.values)
                return
            }
            if (Array.isArray(value.Selected)) {
                walk(value.Selected)
                return
            }
            if (Array.isArray(value.selected)) {
                walk(value.selected)
                return
            }
            if (Array.isArray(value.Options)) {
                walk(value.Options)
                return
            }
            push(value.Name ?? value.name ?? value.Value ?? value.value ?? value.Label ?? value.label)
            return
        }
        const text = String(value).trim()
        if (!text) return
        if (
            (text.startsWith('[') && text.endsWith(']')) ||
            (text.startsWith('{') && text.endsWith('}'))
        ) {
            try {
                walk(JSON.parse(text))
                return
            } catch {
                // fall through
            }
        }
        if (/[,;|\n]/.test(text)) {
            text.split(/[,;|\n]/).forEach((part) => push(part))
            return
        }
        push(text)
    }
    walk(raw)
    return out
}

function serviceCategoryKeyMatch(key) {
    const k = String(key || '')
    if (!k) return false
    if (k === 'Column_rrn9ndDObK' || k === 'Service_Category') return true
    return /service[_\s-]*categor/i.test(k)
}

/** Pull Multiselect Service Category from list/report/detail/table payloads. */
function resolveServiceCategoriesFromRow(dataRow, reportConfig) {
    const direct = normalizeServiceCategories(
        readRowField(dataRow, reportConfig, 'serviceCategory') ??
            dataRow?.Service_Category ??
            dataRow?.service_category ??
            dataRow?.Column_rrn9ndDObK
    )
    if (direct.length) return direct

    const collected = []
    for (const [key, value] of Object.entries(dataRow || {})) {
        if (serviceCategoryKeyMatch(key)) {
            collected.push(...normalizeServiceCategories(value))
            continue
        }
        if (!/^Table::/i.test(key) || !Array.isArray(value)) continue
        for (const line of value) {
            if (!line || typeof line !== 'object') continue
            for (const [lineKey, lineVal] of Object.entries(line)) {
                if (serviceCategoryKeyMatch(lineKey)) {
                    collected.push(...normalizeServiceCategories(lineVal))
                }
            }
            collected.push(
                ...normalizeServiceCategories(
                    line.Service_Category ?? line.service_category ?? line.Column_rrn9ndDObK
                )
            )
        }
    }
    return normalizeServiceCategories(collected)
}

/** Merge list + report without wiping populated Multiselect/amount fields with empties. */
function mergeListAndReportRow(pwaRow, reportRow) {
    if (!pwaRow || typeof pwaRow !== 'object') return reportRow || null
    if (!reportRow || typeof reportRow !== 'object') return pwaRow
    const next = { ...pwaRow }
    for (const [key, value] of Object.entries(reportRow)) {
        if (isBlankFieldValue(value)) continue
        const cur = next[key]
        if (isBlankFieldValue(cur) || serviceCategoryKeyMatch(key) || /^Column_/i.test(key)) {
            next[key] = value
        }
    }
    return next
}

function resolveActivityId(pwaRow, reportRow, instanceActivityMap) {
    const instanceId = String(pwaRow?._id ?? reportRow?._id ?? '').trim()
    const fromRow = extractActivityInstanceId(pwaRow) || extractActivityInstanceId(reportRow)
    const mapActivityId = instanceId && instanceActivityMap ? String(instanceActivityMap[instanceId] ?? '').trim() : ''
    return fromRow || mapActivityId || ''
}

function mapDisplayRow(dataRow, reportConfig, idFieldKey, categoryResolver, instanceId, activityId) {
    const displayId = cellToText(readRowField(dataRow, reportConfig, idFieldKey))
    const createdAtRaw =
        readRowField(dataRow, reportConfig, 'createdAt') ??
        readRowField(dataRow, reportConfig, 'requestDate') ??
        dataRow?._created_at
    const modifiedAtRaw =
        dataRow?._modified_at ??
        dataRow?._last_modified_at ??
        dataRow?.ModifiedAt ??
        readRowField(dataRow, reportConfig, 'modifiedAt')
    const status = normalizeStatus(readRowField(dataRow, reportConfig, 'status'))
    const closed = isClosedStatus(status)
    const createdAt = toTimestampText(createdAtRaw) || formatDateValue(createdAtRaw) || ''
    const modifiedAt = toTimestampText(modifiedAtRaw)
    const assignedToNames = peopleToNameList(
        readRowField(dataRow, reportConfig, 'assignedTo') ??
            dataRow?._current_assigned_to ??
            dataRow?._assigned_to
    )
    const closedByNames = closed
        ? peopleToNameList(
            readRowField(dataRow, reportConfig, 'modifiedBy') ??
                dataRow?._modified_by
        )
        : []
    const source =
        mapSourceLabel(
            readRowField(dataRow, reportConfig, 'source') ??
                dataRow?._created_from ??
                dataRow?.Source ??
                dataRow?.Channel ??
                dataRow?._channel
        ) || '—'
    const currentStep =
        cellToText(readRowField(dataRow, reportConfig, 'currentStep')) ||
        cellToText(dataRow?._current_step) ||
        '—'
    const claimMonth =
        formatClaimMonth(
            readRowField(dataRow, reportConfig, 'claimMonth') ??
                readRowField(dataRow, reportConfig, 'claimMonthFallback') ??
                dataRow?.claim_month_YTLN ??
                dataRow?.Claim_Month
        ) || '—'
    const serviceCategories = resolveServiceCategoriesFromRow(dataRow, reportConfig)
    const serviceCategory = serviceCategories.length ? serviceCategories.join(', ') : '—'

    return {
        id: displayId || instanceId || '—',
        claimMonth,
        employee: cellToText(readRowField(dataRow, reportConfig, 'createdBy')) || '—',
        project: siteNameFromRef(readRowField(dataRow, reportConfig, 'site')) || cellToText(readRowField(dataRow, reportConfig, 'site')) || '—',
        category: categoryResolver(dataRow, reportConfig) || '—',
        serviceCategories,
        serviceCategory,
        amount: resolveRowAmount(dataRow, reportConfig),
        status,
        date: createdAt || '—',
        createdAt,
        modifiedAt,
        closedOn: closed ? modifiedAt || createdAt : '',
        instanceId,
        activityId,
        currentStep,
        source,
        assignedTo: assignedToNames.length ? assignedToNames.join(', ') : '—',
        assignedToNames,
        closedBy: closedByNames.length ? closedByNames.join(', ') : '—',
        closedByNames,
    }
}

function mapReportRow(row, reportConfig, userEmail, userId, idFieldKey, categoryResolver, instanceActivityMap, { requireUserMatch = true } = {}) {
    if (!row || typeof row !== 'object') return null
    if (requireUserMatch && !rowBelongsToUser(row, reportConfig, userEmail, userId)) return null
    if (isDraftItem(row)) return null

    const instanceId = String(row._id ?? '').trim()
    if (!instanceId) return null
    const activityId = resolveActivityId(null, row, instanceActivityMap)

    return mapDisplayRow(row, reportConfig, idFieldKey, categoryResolver, instanceId, activityId)
}

function mapEnrichedPwaRow(pwaRow, reportRow, reportConfig, idFieldKey, categoryResolver, instanceActivityMap) {
    if (!pwaRow || typeof pwaRow !== 'object') return null
    const dataRow = mergeListAndReportRow(pwaRow, reportRow)
    const instanceId = String(pwaRow._id ?? reportRow?._id ?? '').trim()
    if (!instanceId) return null
    const activityId = resolveActivityId(pwaRow, reportRow, instanceActivityMap)

    return mapDisplayRow(dataRow, reportConfig, idFieldKey, categoryResolver, instanceId, activityId)
}

function mapAdvanceRow(row, reportConfig, userEmail, userId, instanceActivityMap, options) {
    return mapReportRow(
        row,
        reportConfig,
        userEmail,
        userId,
        'requestNo',
        (r, cfg) => cellToText(readRowField(r, cfg, 'category')),
        instanceActivityMap,
        options
    )
}

function mapReimbursementRow(row, reportConfig, userEmail, userId, instanceActivityMap, options) {
    return mapReportRow(
        row,
        reportConfig,
        userEmail,
        userId,
        'claimNo',
        (r, cfg) => cellToText(readRowField(r, cfg, 'expenseType')),
        instanceActivityMap,
        options
    )
}

function mapAdvancePwaRow(pwaRow, reportRow, reportConfig, instanceActivityMap) {
    return mapEnrichedPwaRow(
        pwaRow,
        reportRow,
        reportConfig,
        'requestNo',
        (r, cfg) => cellToText(readRowField(r, cfg, 'category')),
        instanceActivityMap
    )
}

function mapReimbursementPwaRow(pwaRow, reportRow, reportConfig, instanceActivityMap) {
    return mapEnrichedPwaRow(
        pwaRow,
        reportRow,
        reportConfig,
        'claimNo',
        (r, cfg) => cellToText(readRowField(r, cfg, 'expenseType')),
        instanceActivityMap
    )
}

export function buildStatsFromRows(rows, requestType) {
    const total = rows.length
    const pending = rows.filter((r) => r.status === 'Pending').length
    const approved = rows.filter((r) => r.status === 'Approved').length
    const rejected = rows.filter((r) => r.status === 'Rejected').length
    const label = requestType === 'advance' ? 'Advance' : 'Reimbursement'

    return [
        {
            id: 'total-requests',
            icon: 'ri-file-list-3-line',
            title: 'Total Requests',
            value: total,
            trend: 0,
            trendUp: true,
            gradientFrom: 'primary',
            subtitle: `My ${label} requests`,
        },
        {
            id: 'pending',
            icon: 'ri-sun-line',
            title: 'Pending',
            value: pending,
            trend: 0,
            trendUp: true,
            gradientFrom: 'warning',
            subtitle: 'In progress',
        },
        {
            id: 'approved',
            icon: 'ri-checkbox-circle-line',
            title: 'Approved',
            value: approved,
            trend: 0,
            trendUp: true,
            gradientFrom: 'success',
            subtitle: 'Completed',
        },
        {
            id: 'rejected',
            icon: 'ri-close-circle-line',
            title: 'Rejected',
            value: rejected,
            trend: 0,
            trendUp: false,
            gradientFrom: 'danger',
            subtitle: 'Declined',
        },
    ]
}

function resolveProcessAppId(requestType, appId) {
    if (requestType === 'reimbursement') return resolveReimbursementAppId()
    return appId || resolveAppId() || APP_ID
}

/** Count participated API rows for overview (approved); prefer report-enriched match when available. */
function countParticipatedForOverview(participatedRawRows, reportById, reportConfig, mapPwaRow) {
    const seen = new Set()
    let count = 0
    for (const item of participatedRawRows) {
        const instanceId = String(item?._id ?? '').trim()
        if (!instanceId || seen.has(instanceId)) continue
        seen.add(instanceId)

        const reportRow = reportById[instanceId] || null
        if (reportRow && mapPwaRow(item, reportRow, reportConfig, {})) {
            count += 1
            continue
        }
        count += 1
    }
    return count
}

/** Non–Site Incharge overview: pending from table (My Tasks), approved from participated. */
function buildNonInchargeStatsWithParticipated(
    pendingRows,
    participatedRawRows,
    reportConfig,
    mapPwaRow,
    reportById,
    requestType
) {
    const pendingCount = pendingRows.length
    const rejectedCount = pendingRows.filter((row) => row.status === 'Rejected').length
    const participatedCount = countParticipatedForOverview(
        participatedRawRows,
        reportById,
        reportConfig,
        mapPwaRow
    )

    const stats = buildStatsFromRows([], requestType)
    return stats.map((card) => {
        if (card.id === 'total-requests') return { ...card, value: pendingCount + participatedCount }
        if (card.id === 'pending') return { ...card, value: pendingCount }
        if (card.id === 'approved') return { ...card, value: participatedCount, subtitle: 'Participated' }
        if (card.id === 'rejected') return { ...card, value: rejectedCount }
        return card
    })
}

function mapPwaRowsEnriched(pwaRows, reportById, reportConfig, mapPwaRow, instanceActivityMap, requireReportMatch = false) {
    const rows = []
    for (const pwaItem of pwaRows) {
        const instanceId = String(pwaItem?._id ?? '').trim()
        const reportRow = instanceId ? reportById[instanceId] : null
        if (requireReportMatch && !reportRow) continue
        const mapped = mapPwaRow(pwaItem, reportRow, reportConfig, instanceActivityMap)
        if (mapped) rows.push(mapped)
    }
    return rows
}

/** Map every All Items report row (HO Head / full visibility). */
function mapAllReportRows(reportRows, reportConfig, mapReport, instanceActivityMap) {
    const rows = []
    for (const reportRow of reportRows || []) {
        const mapped = mapReport(reportRow, reportConfig, '', '', instanceActivityMap, {
            requireUserMatch: false,
        })
        if (mapped) rows.push(mapped)
    }
    return rows
}

function getRequestConfig(client, requestType) {
    if (requestType === 'advance') {
        return {
            processId: resolveAdvanceProcessId(),
            report: {
                ...ADVANCE_REPORT,
                reportId: resolveAdvanceReportId(),
            },
            mapReport: mapAdvanceRow,
            mapPwa: mapAdvancePwaRow,
        }
    }
    if (requestType === 'reimbursement') {
        return {
            processId: resolveReimbursementProcessId(),
            report: {
                ...REIMBURSEMENT_REPORT,
                reportId: resolveReimbursementReportId(),
            },
            mapReport: mapReimbursementRow,
            mapPwa: mapReimbursementPwaRow,
        }
    }
    return null
}

/**
 * Fetch dashboard rows by role scope:
 * - HO Head → All Items report (full process data)
 * - Site Incharge → participated items only
 * - Others → pending + participated
 */
export async function fetchDashboardData(
    accountId,
    requestType,
    apiGet,
    userEmail,
    userId,
    isSiteIncharge = false,
    client = null,
    appId = '',
    isHoHead = false
) {
    const columns = TABLE_COLUMNS_BY_TYPE[requestType] ?? ADVANCE_TABLE_COLUMNS

    if (!accountId || typeof apiGet !== 'function') {
        return { rows: [], stats: buildStatsFromRows([], requestType), columns }
    }

    const cfg = getRequestConfig(client, requestType)
    if (!cfg) {
        return { rows: [], stats: buildStatsFromRows([], requestType), columns }
    }

    const { processId, report: reportConfig, mapReport, mapPwa } = cfg
    const resolvedAppId = resolveProcessAppId(requestType, appId)
    // HO Head takes precedence when both flags are somehow true.
    const scope = isHoHead ? 'all' : isSiteIncharge ? 'participated' : 'pending+participated'

    const settleList = async (label, fn) => {
        try {
            return await fn()
        } catch (e) {
            console.error(`[solar-expense-dashboard] ${label} failed`, e)
            return []
        }
    }

    const needPending = scope === 'all' || scope === 'pending+participated'
    const needParticipated = true
    const needMyItems = true

    const [reportBundle, pendingRows, participatedRows, myItemsRows] = await Promise.all([
        settleList('report', () =>
            fetchRawReportRows(accountId, processId, reportConfig.reportId, resolvedAppId, apiGet)
        ),
        needPending
            ? settleList('pending', () => fetchPwaPendingRaw(accountId, processId, apiGet))
            : Promise.resolve([]),
        needParticipated
            ? settleList('participated', () =>
                  fetchAllParticipatedItems(accountId, processId, resolvedAppId, apiGet)
              )
            : Promise.resolve([]),
        needMyItems
            ? settleList('myitems', () => fetchPwaMyItemsRaw(accountId, processId, apiGet))
            : Promise.resolve([]),
    ])

    const rawReportRows = Array.isArray(reportBundle)
        ? reportBundle
        : Array.isArray(reportBundle?.rows)
          ? reportBundle.rows
          : []
    const reportColumns = Array.isArray(reportBundle?.columns) ? reportBundle.columns : []
    reportConfig.amountColumnIds = collectAmountColumnIds(reportColumns, reportConfig)

    const reportById = buildReportRowMap(rawReportRows)
    const instanceActivityMap = buildInstanceActivityMapFromRows(
        mergeInstanceRows(
            excludeDraftItems(rawReportRows),
            excludeDraftItems(pendingRows),
            excludeDraftItems(participatedRows),
            excludeDraftItems(myItemsRows)
        )
    )

    let tableRows = []
    let dataSource = scope

    if (scope === 'all') {
        // HO Head: full All Items report (e.g. 148 reimbursement items).
        tableRows = mapAllReportRows(excludeDraftItems(rawReportRows), reportConfig, mapReport, instanceActivityMap)
        dataSource = 'all-items-report'
    } else if (scope === 'participated') {
        // Site Incharge: participated queue only.
        const pwaRows = excludeDraftItems(participatedRows)
        tableRows = mapPwaRowsEnriched(pwaRows, reportById, reportConfig, mapPwa, instanceActivityMap, false).filter(
            (row) => String(row?.status || '').trim().toLowerCase() !== 'draft'
        )
        dataSource = 'participated'
    } else {
        const pwaRows = mergeInstanceRows(excludeDraftItems(pendingRows), excludeDraftItems(participatedRows))
        tableRows = mapPwaRowsEnriched(pwaRows, reportById, reportConfig, mapPwa, instanceActivityMap, false).filter(
            (row) => String(row?.status || '').trim().toLowerCase() !== 'draft'
        )
        dataSource = 'pending+participated'
    }

    const stats = buildStatsFromRows(tableRows, requestType)

    if (import.meta.env?.DEV) {
        console.info('[solar-expense-dashboard] fetch summary', {
            requestType,
            accountId,
            appId: resolvedAppId,
            processId,
            reportId: reportConfig.reportId,
            isSiteIncharge,
            isHoHead,
            scope,
            dataSource,
            rawReportCount: rawReportRows.length,
            pendingCount: pendingRows.length,
            participatedCount: participatedRows.length,
            myItemsCount: myItemsRows.length,
            activityMapCount: Object.keys(instanceActivityMap).length,
            tableRowCount: tableRows.length,
            amountColumnIds: reportConfig.amountColumnIds,
            userEmail,
        })
    }

    return { rows: tableRows, stats, columns, instanceActivityMap, processId, appId: resolvedAppId }
}

function preferenceColumns(processId, reportConfig) {
    const ids = [
        ...Object.values(reportConfig?.rawFieldIds || {}),
        ...Object.values(reportConfig?.fields || {}),
        'Service_Category',
        'Column_rrn9ndDObK',
        '_activity_instance_id',
        '_status',
        '_current_step',
        '_created_by',
        '_created_at',
        '_modified_at',
        '_current_assigned_to',
    ]
    const seen = new Set()
    return ids
        .map((id) => String(id || '').trim())
        .filter((id) => {
            if (!id || seen.has(id)) return false
            seen.add(id)
            return true
        })
        .map((Id) => ({ Id, Model: processId }))
}

async function postListPreference(apiCall, accountId, processId, appId, viewType, viewId, reportConfig) {
    if (typeof apiCall !== 'function' || !viewId) return
    const url =
        `/common/2/${accountId}/preference/${processId}/${viewType}/${encodeURIComponent(String(viewId))}/` +
        `?_application_id=${encodeURIComponent(appId)}`
    try {
        await apiCall(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                AppId: processId,
                ConfigJson: { Columns: preferenceColumns(processId, reportConfig), Filter: {}, Sort: [] },
                ViewId: viewId,
                ViewType: viewType,
            }),
        })
    } catch (e) {
        console.warn('[solar-expense-dashboard] list preference failed', viewType, viewId, e)
    }
}

async function fetchPagedRows(apiGet, buildUrl) {
    const allRows = []
    for (let page = 1; page <= MAX_PAGES; page++) {
        const pageRows = extractListPayload(await apiGet(buildUrl(page)))
        if (!pageRows.length) break
        allRows.push(...pageRows)
        if (pageRows.length < PAGE_SIZE) break
    }
    return allRows
}

function normalizeActivitySteps(list) {
    return (Array.isArray(list) ? list : [])
        .map((step) => ({
            id: activityIdFromStep(step),
            label: String(step?.StepName ?? step?.Name ?? step?.name ?? 'Step').trim() || 'Step',
            count: Number(step?.Count ?? step?.count ?? 0) || 0,
        }))
        .filter((step) => step.id)
}

async function fetchActivitySteps(accountId, processId, appId, apiGet, kind) {
    const path = kind === 'participated' ? 'participated/activity/count' : 'pending/activity/count'
    const baseUrl = `/process/2/${accountId}/${processId}/${path}`
    let listed = extractActivityCountList(await apiGet(baseUrl))
    if (!listed.length && appId) {
        listed = extractActivityCountList(await apiGet(`${baseUrl}?_application_id=${encodeURIComponent(appId)}`))
    }
    return normalizeActivitySteps(listed)
}

async function fetchMyItemStatusCounts(accountId, processId, appId, apiGet) {
    const empty = { Draft: 0, InProgress: 0, Completed: 0, Withdrawn: 0, Rejected: 0 }
    const url = `/process/2/${accountId}/${processId}/myitems/status/count?_application_id=${encodeURIComponent(appId)}`
    try {
        const payload = unwrapKfApiResponse(await apiGet(url)) ?? {}
        const src =
            payload?.Draft != null || payload?.InProgress != null ? payload : payload?.Data || payload?.data || payload
        return {
            Draft: Number(src?.Draft) || 0,
            InProgress: Number(src?.InProgress) || 0,
            Completed: Number(src?.Completed) || 0,
            Withdrawn: Number(src?.Withdrawn) || 0,
            Rejected: Number(src?.Rejected) || 0,
        }
    } catch (e) {
        console.warn('[solar-expense-dashboard] my items counts failed', e)
        return empty
    }
}

function mapWorkflowRows(rawRows, reportConfig, mapPwa, reportById = {}) {
    const instanceActivityMap = buildInstanceActivityMapFromRows(rawRows)
    const rows = mapPwaRowsEnriched(rawRows, reportById, reportConfig, mapPwa, instanceActivityMap, false)
    return { rows, instanceActivityMap }
}

async function fetchProcessItemDetail(accountId, processId, appId, instanceId, activityId, apiGet) {
    if (!accountId || !processId || !instanceId || typeof apiGet !== 'function') return null
    const appQuery = appId ? `?_application_id=${encodeURIComponent(appId)}` : ''
    const urls = []
    if (activityId) {
        urls.push(
            `/process/2/${accountId}/${processId}/${encodeURIComponent(instanceId)}/${encodeURIComponent(activityId)}${appQuery}`
        )
    }
    urls.push(
        `/process/2/${accountId}/${processId}/${encodeURIComponent(instanceId)}${appQuery}`,
        `/process/2/${accountId}/admin/${processId}/${encodeURIComponent(instanceId)}${appQuery}`
    )
    for (const url of urls) {
        try {
            const item = await apiGetJson(apiGet, url)
            if (item && typeof item === 'object') return item
        } catch {
            // try next
        }
    }
    return null
}

/** Draft/My Items list often omits Multiselect — hydrate a small batch from item GET. */
async function hydrateRawRowsMissingServiceCategory(
    rawRows,
    reportConfig,
    accountId,
    processId,
    appId,
    apiGet,
    limit = 24
) {
    const targets = (rawRows || [])
        .filter((row) => row && typeof row === 'object')
        .filter((row) => !resolveServiceCategoriesFromRow(row, reportConfig).length)
        .slice(0, limit)

    if (!targets.length) return

    await Promise.all(
        targets.map(async (row) => {
            const instanceId = String(row._id ?? '').trim()
            if (!instanceId) return
            const activityId = extractActivityInstanceId(row)
            const detail = await fetchProcessItemDetail(
                accountId,
                processId,
                appId,
                instanceId,
                activityId,
                apiGet
            )
            if (!detail || typeof detail !== 'object') return
            const merged = mergeListAndReportRow(row, detail)
            Object.keys(merged).forEach((key) => {
                row[key] = merged[key]
            })
        })
    )
}

/**
 * mis-table queues for the active Advance / Reimbursement process:
 * My Items (Drafts + each status), My Tasks (each pending step), Participated (each step).
 */
export async function fetchWorkflowQueue({
    accountId,
    requestType,
    scope = 'myItems',
    itemStatus = 'Draft',
    activityId = '',
    apiGet,
    apiCall,
    appId = '',
    client = null,
}) {
    const columns = TABLE_COLUMNS_BY_TYPE[requestType] ?? ADVANCE_TABLE_COLUMNS
    const empty = {
        rows: [],
        columns,
        steps: [],
        counts: { Draft: 0, InProgress: 0, Completed: 0, Withdrawn: 0, Rejected: 0 },
        resolvedActivityId: '',
        instanceActivityMap: {},
        processId: '',
        appId: '',
    }
    if (!accountId || typeof apiGet !== 'function') return empty

    const cfg = getRequestConfig(client, requestType)
    if (!cfg) return empty

    const { processId, report: reportConfig, mapPwa } = cfg
    const resolvedAppId = resolveProcessAppId(requestType, appId)
    const call = apiCall || apiGet

    const loadReportById = async () => {
        try {
            const reportBundle = await fetchRawReportRows(
                accountId,
                processId,
                reportConfig.reportId,
                resolvedAppId,
                apiGet
            )
            const reportRows = Array.isArray(reportBundle?.rows) ? reportBundle.rows : []
            reportConfig.amountColumnIds = collectAmountColumnIds(
                Array.isArray(reportBundle?.columns) ? reportBundle.columns : [],
                reportConfig
            )
            return buildReportRowMap(reportRows)
        } catch (e) {
            console.warn('[solar-expense-dashboard] workflow report enrich failed', e)
            return {}
        }
    }

    if (scope === 'myTasks' || scope === 'participated') {
        const steps = await fetchActivitySteps(accountId, processId, resolvedAppId, apiGet, scope)
        const resolvedActivityId =
            (activityId && steps.some((step) => step.id === activityId) ? activityId : steps[0]?.id) || ''
        if (!resolvedActivityId) {
            return { ...empty, steps, processId, appId: resolvedAppId, columns }
        }

        const viewType = scope === 'participated' ? 'Participated' : 'WorkflowStep'
        const [, reportById] = await Promise.all([
            postListPreference(
                call,
                accountId,
                processId,
                resolvedAppId,
                viewType,
                resolvedActivityId,
                reportConfig
            ),
            loadReportById(),
        ])

        const rawRows =
            scope === 'participated'
                ? await fetchParticipatedForActivity(
                      accountId,
                      processId,
                      resolvedAppId,
                      resolvedActivityId,
                      apiGet
                  )
                : await fetchPagedRows(
                      apiGet,
                      (page) =>
                          `/process/2/${accountId}/${processId}/pending/${encodeURIComponent(resolvedActivityId)}` +
                          `?apply_preference=true&page_number=${page}&page_size=${PAGE_SIZE}&skip_aggregation=true&_application_id=${encodeURIComponent(resolvedAppId)}`
                  )

        for (const row of rawRows) {
            const id = String(row?._id ?? '').trim()
            const reportRow = id ? reportById[id] : null
            if (!reportRow) continue
            const merged = mergeListAndReportRow(row, reportRow)
            Object.keys(merged).forEach((key) => {
                row[key] = merged[key]
            })
        }

        if (requestType === 'reimbursement') {
            await hydrateRawRowsMissingServiceCategory(
                rawRows,
                reportConfig,
                accountId,
                processId,
                resolvedAppId,
                apiGet
            )
        }

        const mapped = mapWorkflowRows(rawRows, reportConfig, mapPwa, reportById)
        return {
            ...empty,
            ...mapped,
            steps,
            resolvedActivityId,
            processId,
            appId: resolvedAppId,
            columns,
        }
    }

    const status = MY_ITEM_STATUSES.some((item) => item.id === itemStatus) ? itemStatus : 'Draft'
    const [counts, reportById] = await Promise.all([
        fetchMyItemStatusCounts(accountId, processId, resolvedAppId, apiGet),
        loadReportById(),
        postListPreference(call, accountId, processId, resolvedAppId, 'WorkflowStep', status, reportConfig),
    ])
    const rawRows = await fetchPagedRows(
        apiGet,
        (page) =>
            `/process/2/${accountId}/${processId}/myitems/${encodeURIComponent(status)}` +
            `?page_number=${page}&page_size=${PAGE_SIZE}&apply_preference=true&_application_id=${encodeURIComponent(resolvedAppId)}`
    )

    // Merge report onto list rows first so hydrate only hits still-empty drafts.
    for (const row of rawRows) {
        const id = String(row?._id ?? '').trim()
        const reportRow = id ? reportById[id] : null
        if (!reportRow) continue
        const merged = mergeListAndReportRow(row, reportRow)
        Object.keys(merged).forEach((key) => {
            row[key] = merged[key]
        })
    }

    if (requestType === 'reimbursement') {
        await hydrateRawRowsMissingServiceCategory(
            rawRows,
            reportConfig,
            accountId,
            processId,
            resolvedAppId,
            apiGet
        )
    }

    const mapped = mapWorkflowRows(rawRows, reportConfig, mapPwa, reportById)
    return {
        ...empty,
        ...mapped,
        counts,
        processId,
        appId: resolvedAppId,
        columns,
    }
}

async function apiGetJson(apiGet, url) {
    const resp = await apiGet(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    })
    return unwrapKfApiResponse(resp) ?? resp
}

async function resolveActivityFromItemApis(accountId, processId, appId, instanceId, apiGet, client) {
    const appQuery = appId ? `?_application_id=${encodeURIComponent(appId)}` : ''
    const processApi = client?.app?.getProcess?.(processId)

    if (processApi?.getItem) {
        try {
            const item = unwrapKfApiResponse(await processApi.getItem({ instanceId })) || {}
            const aid = extractActivityInstanceId(item)
            if (aid) return aid
        } catch (e) {
            console.warn('[solar-expense-dashboard] getItem failed', instanceId, e)
        }
    }

    const itemUrls = [
        `/process/2/${accountId}/${processId}/${instanceId}${appQuery}`,
        `/process/2/${accountId}/admin/${processId}/${instanceId}${appQuery}`,
    ]
    for (const url of itemUrls) {
        try {
            const item = await apiGetJson(apiGet, url)
            const aid = extractActivityInstanceId(item)
            if (aid) return aid
        } catch {
            // next source
        }
    }
    return ''
}

async function resolveActivityFromProgress(accountId, processId, appId, instanceId, apiGet, client) {
    const processApi = client?.app?.getProcess?.(processId)
    if (processApi?.getProgress) {
        try {
            const progress = unwrapKfApiResponse(await processApi.getProgress({ instanceId })) || {}
            const aid = extractActivityIdFromProgress(progress)
            if (aid) return aid
        } catch (e) {
            console.warn('[solar-expense-dashboard] getProgress failed', instanceId, e)
        }
    }

    const appQuery = appId ? `?_application_id=${encodeURIComponent(appId)}` : ''
    try {
        const progress = await apiGetJson(
            apiGet,
            `/process/2/${accountId}/${processId}/${encodeURIComponent(instanceId)}/progress${appQuery}`
        )
        return extractActivityIdFromProgress(progress)
    } catch (e) {
        console.warn('[solar-expense-dashboard] progress GET failed', instanceId, e)
        return ''
    }
}

async function resolveActivityFromMyItems(accountId, processId, appId, instanceId, apiGet, statusHint) {
    const appQuery = appId ? `&_application_id=${encodeURIComponent(appId)}` : ''
    const statusPath = {
        Pending: 'InProgress',
        Approved: 'Completed',
        Rejected: 'Rejected',
        Withdrawn: 'Withdrawn',
        Draft: 'Draft',
    }[statusHint] || ''
    const paths = statusPath ? [statusPath, ''] : ['']

    for (const segment of paths) {
        const base = `/process/2/${accountId}/${processId}/myitems${segment ? `/${segment}` : ''}`
        for (let page = 1; page <= 4; page++) {
            const url =
                `${base}?apply_preference=true&skip_aggregation=true&page_number=${page}&page_size=${PAGE_SIZE}${appQuery}`
            let rows = []
            try {
                const payload = await apiGetJson(apiGet, url)
                rows = extractListPayload(payload)
            } catch {
                break
            }
            if (!rows.length) break
            const hit = rows.find((item) => String(item?._id || '').trim() === instanceId)
            if (hit) {
                const aid = extractActivityInstanceId(hit)
                if (aid) return aid
            }
            if (rows.length < PAGE_SIZE) break
        }
    }
    return ''
}

/** Resolve activity instance id for popup — row, map, item, progress, then my items. */
export async function resolveActivityForPopup({
    row,
    instanceActivityMap = {},
    accountId,
    processId,
    appId,
    apiGet,
    client,
}) {
    const instanceId = String(row?.instanceId || '').trim()
    const fromRow = String(row?.activityId || '').trim() || extractActivityInstanceId(row)
    if (fromRow) return fromRow
    if (instanceId && instanceActivityMap?.[instanceId]) {
        return String(instanceActivityMap[instanceId]).trim()
    }
    if (!instanceId || !accountId || !processId || typeof apiGet !== 'function') return ''

    const fromItem = await resolveActivityFromItemApis(accountId, processId, appId, instanceId, apiGet, client)
    if (fromItem) return fromItem

    const fromProgress = await resolveActivityFromProgress(
        accountId,
        processId,
        appId,
        instanceId,
        apiGet,
        client
    )
    if (fromProgress) return fromProgress

    return resolveActivityFromMyItems(
        accountId,
        processId,
        appId,
        instanceId,
        apiGet,
        row?.status
    )
}

/** Popup params Kissflow process forms bind to (instance + activity instance). */
export function buildRecordPopupParams(instanceId, activityId) {
    const instId = String(instanceId || '').trim()
    const actId = String(activityId || '').trim()
    return {
        _id: instId,
        instanceId: instId,
        instance_id: instId,
        InstanceId: instId,
        InstanceID: instId,
        Instance_ID: instId,
        _activity_instance_id: actId,
        activityInstanceId: actId,
        activity_instance_id: actId,
        activity_id: actId,
        activityId: actId,
        ActivityId: actId,
        ActivityID: actId,
        Activity_ID: actId,
        ActivityInstanceId: actId,
        Activity_Instance_ID: actId,
    }
}
