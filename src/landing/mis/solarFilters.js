import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSolarSlaFilterState, SOLAR_SLA_FILTER_OPTIONS } from './solarSla.js'
import SolarPeriodPicker, { getDefaultApproverPeriodState } from './SolarPeriodPicker.jsx'
import { formatCurrentStepLabel } from './solarApprovalSteps.js'

function padDateInput(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function rowDateKey(row) {
    const raw = row?.date || row?.createdAt || row?.requestDate || ''
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return ''
    return padDateInput(d)
}

export function applyDateRangeFilter(rows, range) {
    const from = String(range?.from || '').trim()
    const to = String(range?.to || '').trim()
    if (!from && !to) return rows || []
    return (rows || []).filter((row) => {
        const key = rowDateKey(row)
        if (!key) return true
        if (from && key < from) return false
        if (to && key > to) return false
        return true
    })
}

export function useSolarPeriodFilter() {
    const [periodState, setPeriodState] = useState(() => getDefaultApproverPeriodState())
    const periodRange = periodState.range || { from: '', to: '' }

    const applyPeriod = useCallback(
        (rows) => applyDateRangeFilter(rows || [], periodRange),
        [periodRange.from, periodRange.to]
    )

    const resetKey = `${periodState.mode}:${periodRange.from}:${periodRange.to}`

    return {
        periodState,
        setPeriodState,
        periodRange,
        applyPeriod,
        resetKey,
        PeriodPicker: SolarPeriodPicker,
    }
}

function collectOptions(rows, field) {
    const set = new Set()
    for (const row of rows || []) {
        const val = String(row?.[field] ?? '').trim()
        if (val && val !== '—') set.add(val)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
}

function serviceCategoryValues(row) {
    if (Array.isArray(row?.serviceCategories) && row.serviceCategories.length) {
        return row.serviceCategories.map((v) => String(v ?? '').trim()).filter((v) => v && v !== '—')
    }
    const raw = row?.serviceCategory
    if (Array.isArray(raw)) {
        return raw.map((v) => String(v ?? '').trim()).filter((v) => v && v !== '—')
    }
    const text = String(raw ?? '').trim()
    if (!text || text === '—') return []
    return text
        .split(/[,;\n]/)
        .map((v) => v.trim())
        .filter(Boolean)
}

function collectServiceCategoryOptions(rows) {
    const set = new Set()
    for (const row of rows || []) {
        for (const val of serviceCategoryValues(row)) set.add(val)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
}

function rowHasServiceCategory(row, wanted) {
    if (!wanted) return true
    return serviceCategoryValues(row).some((val) => val === wanted)
}

function collectNameOptions(rows, namesField, textField) {
    const set = new Set()
    for (const row of rows || []) {
        const names = Array.isArray(row?.[namesField]) && row[namesField].length
            ? row[namesField]
            : String(row?.[textField] ?? '').split(/[,;\n]/)
        for (const name of names) {
            const val = String(name ?? '').trim()
            if (val && val !== '—') set.add(val)
        }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
}

function rowHasPerson(row, namesField, textField, wanted) {
    if (!wanted) return true
    const names = Array.isArray(row?.[namesField]) && row[namesField].length
        ? row[namesField]
        : String(row?.[textField] ?? '').split(/[,;\n]/)
    return names.some((name) => String(name ?? '').trim() === wanted)
        || String(row?.[textField] || '').trim() === wanted
}

export function useSolarTableFilters(rows, resetKey) {
    const [category, setCategory] = useState('')
    const [serviceCategory, setServiceCategory] = useState('')
    const [site, setSite] = useState('')
    const [status, setStatus] = useState('')
    const [currentStep, setCurrentStep] = useState('')
    const [claimMonth, setClaimMonth] = useState('')
    const [requestor, setRequestor] = useState('')
    const [sla, setSla] = useState('')
    const [source, setSource] = useState('')
    const [assignedTo, setAssignedTo] = useState('')
    const [closedBy, setClosedBy] = useState('')

    useEffect(() => {
        setCategory('')
        setServiceCategory('')
        setSite('')
        setStatus('')
        setCurrentStep('')
        setClaimMonth('')
        setRequestor('')
        setSla('')
        setSource('')
        setAssignedTo('')
        setClosedBy('')
    }, [resetKey])

    const categoryOptions = useMemo(() => collectOptions(rows, 'category'), [rows])
    const serviceCategoryOptions = useMemo(() => collectServiceCategoryOptions(rows), [rows])
    const siteOptions = useMemo(() => collectOptions(rows, 'project'), [rows])
    const statusOptions = useMemo(() => collectOptions(rows, 'status'), [rows])
    const claimMonthOptions = useMemo(() => collectOptions(rows, 'claimMonth'), [rows])
    const currentStepOptions = useMemo(() => {
        const set = new Set()
        for (const row of rows || []) {
            const label = formatCurrentStepLabel(row)
            if (label && label !== '—') set.add(label)
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b))
    }, [rows])
    const requestorOptions = useMemo(() => collectOptions(rows, 'employee'), [rows])
    const sourceOptions = useMemo(() => collectOptions(rows, 'source'), [rows])
    const assignedToOptions = useMemo(
        () => collectNameOptions(rows, 'assignedToNames', 'assignedTo'),
        [rows]
    )
    const closedByOptions = useMemo(
        () => collectNameOptions(rows, 'closedByNames', 'closedBy'),
        [rows]
    )

    const slaOptions = SOLAR_SLA_FILTER_OPTIONS
    const hasActive = Boolean(
        category ||
            serviceCategory ||
            site ||
            status ||
            currentStep ||
            claimMonth ||
            requestor ||
            sla ||
            source ||
            assignedTo ||
            closedBy
    )

    const clearFilters = useCallback(() => {
        setCategory('')
        setServiceCategory('')
        setSite('')
        setStatus('')
        setCurrentStep('')
        setClaimMonth('')
        setRequestor('')
        setSla('')
        setSource('')
        setAssignedTo('')
        setClosedBy('')
    }, [])

    const applyFilters = useCallback(
        (inputRows) => {
            return (inputRows || []).filter((row) => {
                if (category && String(row?.category || '').trim() !== category) return false
                if (serviceCategory && !rowHasServiceCategory(row, serviceCategory)) return false
                if (site && String(row?.project || '').trim() !== site) return false
                if (status) {
                    const rowStatus = normalizeStatus(row?.status)
                    const wanted = normalizeStatus(status)
                    if (rowStatus !== wanted && String(row?.status || '').trim() !== status) return false
                }
                if (currentStep) {
                    const label = formatCurrentStepLabel(row)
                    const raw = String(row?.currentStep || '').trim()
                    if (label !== currentStep && raw !== currentStep) return false
                }
                if (claimMonth && String(row?.claimMonth || '').trim() !== claimMonth) return false
                if (requestor && String(row?.employee || '').trim() !== requestor) return false
                if (source && String(row?.source || '').trim() !== source) return false
                if (assignedTo && !rowHasPerson(row, 'assignedToNames', 'assignedTo', assignedTo)) return false
                if (closedBy && !rowHasPerson(row, 'closedByNames', 'closedBy', closedBy)) return false
                if (sla && getSolarSlaFilterState(row) !== sla) return false
                return true
            })
        },
        [
            category,
            serviceCategory,
            site,
            status,
            currentStep,
            claimMonth,
            requestor,
            sla,
            source,
            assignedTo,
            closedBy,
        ]
    )

    return {
        category,
        setCategory,
        serviceCategory,
        setServiceCategory,
        site,
        setSite,
        status,
        setStatus,
        currentStep,
        setCurrentStep,
        claimMonth,
        setClaimMonth,
        requestor,
        setRequestor,
        sla,
        setSla,
        source,
        setSource,
        assignedTo,
        setAssignedTo,
        closedBy,
        setClosedBy,
        categoryOptions,
        serviceCategoryOptions,
        siteOptions,
        statusOptions,
        currentStepOptions,
        claimMonthOptions,
        requestorOptions,
        sourceOptions,
        assignedToOptions,
        closedByOptions,
        slaOptions,
        hasActive,
        clearFilters,
        applyFilters,
    }
}

export function normalizeStatus(status) {
    const token = String(status || '').trim().toLowerCase()
    if (token.includes('reject') || token.includes('cancel')) return 'Rejected'
    if (token.includes('approv') || token.includes('complete')) return 'Approved'
    if (token.includes('pending') || token.includes('progress') || token.includes('inprogress')) return 'Pending'
    return String(status || 'Pending').trim() || 'Pending'
}

export function matchStatusTab(row, tabKey) {
    if (!tabKey || tabKey === 'All') return true
    return normalizeStatus(row?.status) === tabKey
}

export function applySearchFilter(rows, search) {
    const q = String(search || '').trim().toLowerCase()
    if (!q) return rows || []
    return (rows || []).filter((row) => {
        const hay = [
            row?.id,
            row?.claimMonth,
            row?.employee,
            row?.project,
            row?.category,
            row?.serviceCategory,
            ...(Array.isArray(row?.serviceCategories) ? row.serviceCategories : []),
            row?.status,
            row?.currentStep,
            row?.source,
            row?.assignedTo,
            row?.closedBy,
        ]
            .map((v) => String(v ?? '').toLowerCase())
            .join(' ')
        return hay.includes(q)
    })
}

export function computeStatusCounts(rows) {
    const counts = { All: 0, Pending: 0, Approved: 0, Rejected: 0 }
    for (const row of rows || []) {
        counts.All += 1
        const key = normalizeStatus(row?.status)
        if (counts[key] != null) counts[key] += 1
    }
    return counts
}
