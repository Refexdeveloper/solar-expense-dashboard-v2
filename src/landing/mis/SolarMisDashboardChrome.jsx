import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    X,
    Building2,
    Landmark,
    AlertTriangle,
    TimerOff,
} from 'lucide-react'
import {
    SOLAR_KPI_ACCENT,
    QUEUE_OPTIONS,
    SOLAR_STATUS,
    SOLAR_STATUS_ROW,
} from './solarDesignTokens.js'
import { QUEUE_ICONS } from './queueIcons.jsx'
import MisPillBadge from './MisPillBadge.jsx'
import WelcomeHeader from '../components/WelcomeHeader.jsx'
import TablePagination from '../components/TablePagination.jsx'
import { normalizeStatus } from './solarFilters.js'
import { MisPersonInitialsCell } from './MisPersonInitialsCell.jsx'
import { renderSolarMisTableHeadLabel } from './SolarMisColumnHeaders.jsx'
import SolarSlaBadge from './SolarSlaBadge.jsx'
import SolarPeriodPicker from './SolarPeriodPicker.jsx'
import { formatMisTableDate, formatMisTableTime } from './solarMisDates.js'
import { formatCurrentStepLabel, getCurrentStepBadgeStyle } from './solarApprovalSteps.js'

function useCountUp(target, duration = 900, { frozen = false } = {}) {
    const [count, setCount] = useState(0)
    const startTime = useRef(null)
    const raf = useRef(null)

    useEffect(() => {
        if (frozen) {
            setCount(0)
            return undefined
        }
        startTime.current = null
        const animate = (timestamp) => {
            if (startTime.current == null) startTime.current = timestamp
            const progress = Math.min((timestamp - startTime.current) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * Number(target || 0)))
            if (progress < 1) raf.current = requestAnimationFrame(animate)
        }
        raf.current = requestAnimationFrame(animate)
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current)
        }
    }, [target, duration, frozen])

    return count
}

function ServiceCategoryCell({ row }) {
    const values = Array.isArray(row?.serviceCategories) && row.serviceCategories.length
        ? row.serviceCategories.map((v) => String(v ?? '').trim()).filter((v) => v && v !== '—')
        : String(row?.serviceCategory || '')
              .split(/[,;\n]/)
              .map((v) => v.trim())
              .filter((v) => v && v !== '—')
    if (!values.length) return <span className="text-slate-400">—</span>
    return (
        <div className="flex max-w-[13.5rem] flex-wrap gap-1" title={values.join(', ')}>
            {values.map((label) => (
                <span
                    key={label}
                    className="inline-flex max-w-full items-center truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-slate-700 ring-1 ring-inset ring-slate-200/80"
                >
                    {label}
                </span>
            ))}
        </div>
    )
}

function PeriodToolbar({ periodState, onPeriodChange }) {
    return (
        <div className="flex w-full shrink-0 items-center sm:w-auto sm:justify-end">
            <SolarPeriodPicker
                className="w-full sm:w-auto"
                mode={periodState?.mode}
                range={periodState?.range}
                summaryLabel={periodState?.summaryLabel}
                onChange={onPeriodChange}
            />
        </div>
    )
}

function QueueSwitch({ activeQueue, onChange }) {
    return (
        <div className="flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUEUE_OPTIONS.map((tab) => {
                const Icon = QUEUE_ICONS[tab.id] || FileText
                const active = activeQueue === tab.id
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange?.(tab.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                            active
                                ? 'border-[#0d9488] bg-[#0d9488] text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                    >
                        <Icon className="h-4 w-4" strokeWidth={2.25} />
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

function ScopeChip({ active, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition sm:text-xs ${
                active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
            {label}
            {count != null && count !== '' ? (
                <span className={`tabular-nums ${active ? 'text-white/80' : 'text-slate-400'}`}>{count}</span>
            ) : null}
        </button>
    )
}

function KpiStatCard({ label, value, sub, icon: Icon, accent, loading, active, onClick, delay = 0 }) {
    const tokens = accent || SOLAR_KPI_ACCENT.brand
    const animated = useCountUp(value, 900, { frozen: loading })
    const displayValue = loading ? 0 : animated
    const activeRing = active ? 'ring-2 ring-[#0d9488] ring-offset-2 border-[#0d9488] shadow-md' : ''

    const inner = (
        <>
            <span aria-hidden className={`pointer-events-none absolute inset-0 ${tokens.wash}`} />
            <span aria-hidden className={`pointer-events-none absolute inset-0 opacity-[0.82] ${tokens.radial}`} />
            <span aria-hidden className={`pointer-events-none absolute bottom-1 right-1 opacity-[0.12] ${tokens.watermark}`}>
                <Icon className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.25} />
            </span>
            <div className="relative z-10 flex h-full min-h-0 flex-col p-2.5 sm:p-3">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white shadow-sm sm:h-6 sm:w-6 ${tokens.iconGradient}`}>
                        <Icon className="h-3.5 w-3.5 sm:h-3 sm:w-3" strokeWidth={2.25} />
                    </div>
                    <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500 sm:text-[11px] sm:tracking-[0.1em]">
                        {label}
                    </p>
                </div>
                <div className="mt-1.5 min-w-0 sm:mt-2">
                    <p className={`text-[1.375rem] font-bold tabular-nums leading-none tracking-tight sm:text-3xl ${tokens.accent}`}>
                        {displayValue.toLocaleString('en-IN')}
                    </p>
                    {sub ? (
                        <p className="mt-1 truncate text-[10px] font-medium leading-tight text-slate-500 sm:text-[11px]">
                            {sub}
                        </p>
                    ) : null}
                </div>
            </div>
        </>
    )

    const className = `group relative h-full min-h-[88px] w-full min-w-0 overflow-hidden rounded-2xl border bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:min-h-[96px] ${tokens.border} ${activeRing} ${
        onClick ? 'cursor-pointer transition hover:shadow-md active:scale-[0.99]' : ''
    }`

    if (onClick) {
        return (
            <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onClick={onClick}
                className={className}
            >
                {inner}
            </motion.button>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {inner}
        </motion.div>
    )
}

function StatusBadge({ status }) {
    const key = normalizeStatus(status)
    const style = SOLAR_STATUS[key] || SOLAR_STATUS.Pending
    return <MisPillBadge label={key || status || 'Pending'} badgeClass={style.badge} dotClass={style.dot} />
}

const WORKFLOW_METRICS = [
    { key: 'total', label: 'Total', sub: 'In queue', icon: FileText, accentKey: 'brand' },
    { key: 'pending', label: 'Pending', sub: 'Awaiting action', icon: Clock, accentKey: 'warning' },
    { key: 'closed', label: 'Closed', sub: 'Completed', icon: CheckCircle2, accentKey: 'success' },
    { key: 'onTime', label: 'On Time', sub: 'Within SLA', icon: CheckCircle2, accentKey: 'success' },
    { key: 'atRisk', label: 'At Risk', sub: 'Deadline approaching', icon: AlertTriangle, accentKey: 'warning' },
    { key: 'breached', label: 'Breached', sub: 'Past deadline', icon: TimerOff, accentKey: 'error' },
]

const SECTION_THEMES = {
    operations: {
        label: 'Operations',
        sub: 'HO · BU · VP Approvals',
        icon: Building2,
        headerBg: 'bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white',
        headerBorder: 'border-amber-200/80',
        headerText: 'text-amber-900',
        headerSub: 'text-amber-700/70',
        iconWrap: 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200/60',
        rowRing: 'ring-amber-100/80',
    },
    finance: {
        label: 'Finance',
        sub: 'Finance Processing',
        icon: Landmark,
        headerBg: 'bg-gradient-to-r from-sky-50/90 via-blue-50/40 to-white',
        headerBorder: 'border-sky-200/80',
        headerText: 'text-sky-900',
        headerSub: 'text-sky-700/70',
        iconWrap: 'bg-gradient-to-br from-sky-500 to-indigo-500 shadow-sky-200/60',
        rowRing: 'ring-sky-100/80',
    },
}

function WorkflowMetricCard({
    sectionKey,
    metric,
    value,
    loading,
    active,
    onClick,
    delay = 0,
    variant = 'default',
}) {
    const tokens = SOLAR_KPI_ACCENT[metric.accentKey] || SOLAR_KPI_ACCENT.brand
    const Icon = metric.icon
    const animated = useCountUp(value, 800, { frozen: loading })
    const displayValue = loading ? 0 : animated
    const activeRing = active ? 'ring-2 ring-[#0d9488] ring-offset-2 border-[#0d9488] shadow-md scale-[1.01]' : ''
    const isCompact = variant === 'compact'

    const Tag = onClick ? motion.button : motion.div

    return (
        <Tag
            {...(onClick ? { type: 'button', onClick } : {})}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex h-full min-h-[96px] w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-white text-left shadow-[0_4px_16px_rgba(15,23,42,0.04)] ${tokens.border} ${activeRing} sm:min-h-[104px] ${
                onClick ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] active:scale-[0.99]' : ''
            }`}
        >
            <span aria-hidden className={`pointer-events-none absolute inset-0 ${tokens.wash}`} />
            <span aria-hidden className={`pointer-events-none absolute inset-0 opacity-[0.75] ${tokens.radial}`} />
            <span aria-hidden className={`pointer-events-none absolute -bottom-1 -right-1 opacity-[0.1] ${tokens.watermark}`}>
                <Icon className={isCompact ? 'h-9 w-9' : 'h-11 w-11 sm:h-12 sm:w-12'} strokeWidth={1.25} />
            </span>
            <div className="relative z-10 flex h-full flex-col p-2.5 sm:p-3">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${tokens.iconGradient}`}>
                        <Icon className="h-3 w-3" strokeWidth={2.4} />
                    </div>
                    <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px]">
                        {metric.label}
                    </p>
                </div>
                <p className={`mt-2 text-2xl font-bold tabular-nums leading-none sm:text-[1.65rem] ${tokens.accent}`}>
                    {displayValue.toLocaleString('en-IN')}
                </p>
                {metric.sub ? (
                    <p className="mt-1 truncate text-[10px] font-medium text-slate-500 sm:text-[11px]">{metric.sub}</p>
                ) : null}
            </div>
        </Tag>
    )
}

function WorkflowSectionRow({ sectionKey, metrics, loading, activeStep, onCardClick, delayBase = 0 }) {
    const theme = SECTION_THEMES[sectionKey]
    if (!theme || !metrics) return null
    const SectionIcon = theme.icon

    return (
        <section
            className={`overflow-hidden rounded-2xl border bg-white shadow-[0_6px_20px_rgba(15,23,42,0.05)] ring-1 ring-inset ${theme.rowRing} ${theme.headerBorder}`}
        >
            <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 sm:px-4 sm:py-3 ${theme.headerBg} ${theme.headerBorder}`}>
                <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${theme.iconWrap}`}>
                    <SectionIcon className="h-4 w-4" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                    <h3 className={`text-sm font-bold tracking-tight sm:text-[0.95rem] ${theme.headerText}`}>
                        {theme.label}
                    </h3>
                    <p className={`text-[11px] font-medium ${theme.headerSub}`}>{theme.sub}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-3 sm:gap-2.5 sm:p-3 lg:grid-cols-6">
                {WORKFLOW_METRICS.map((metric, index) => {
                    const filterKey = `${sectionKey}-${metric.key}`
                    return (
                        <WorkflowMetricCard
                            key={filterKey}
                            sectionKey={sectionKey}
                            metric={metric}
                            value={metrics[metric.key] ?? 0}
                            loading={loading}
                            active={activeStep === filterKey}
                            onClick={onCardClick ? () => onCardClick(sectionKey, metric.key) : undefined}
                            delay={delayBase + index * 0.04}
                        />
                    )
                })}
            </div>
        </section>
    )
}

function getStatusRowClass(status) {
    const key = normalizeStatus(status)
    return SOLAR_STATUS_ROW[key] || ''
}

function formatCurrency(val) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(Number(val) || 0)
}

function DateTimeCell({ value }) {
    if (!value || value === '—') return <span className="text-slate-400">—</span>
    const dateLine = formatMisTableDate(value)
    const timeLine = formatMisTableTime(value)
    if (!dateLine) return <span className="text-slate-400">—</span>
    return (
        <div className="min-w-[4.5rem]">
            <p className="text-sm text-slate-700">{dateLine}</p>
            {timeLine ? <p className="mt-0.5 text-xs font-medium text-slate-500">{timeLine}</p> : null}
        </div>
    )
}

function StackedNamesCell({ names, fallback }) {
    const list = Array.isArray(names) && names.length
        ? names
        : String(fallback || '')
            .split(/[,;\n]/)
            .map((part) => part.trim())
            .filter((part) => part && part !== '—')
    if (!list.length) return <span className="text-slate-400">—</span>
    return (
        <div className="min-w-[5.5rem]">
            {list.map((name) => (
                <p key={name} className="text-sm leading-5 text-slate-700">
                    {name}
                </p>
            ))}
        </div>
    )
}

function CenterLoader({ loading, message = 'Loading dashboard...', submessage = 'Please wait while we fetch your data' }) {
    if (!loading) return null
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#f6f7f9]/70 backdrop-blur-[2px]">
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-xl">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                <p className="text-sm font-semibold text-slate-800">{message}</p>
                <p className="mt-1 text-xs text-slate-500">{submessage}</p>
            </div>
        </div>
    )
}

export function SolarMisDashboardChrome({
    userName,
    companyName,
    loadError,
    refreshing,
    onRefresh,
    showCreate,
    onCreateAction,
    periodState,
    onPeriodChange,
    requestType,
    onRequestTypeChange,
    cardsLoading = false,
    listLoading = false,
    workflowScope = 'myItems',
    onWorkflowScopeChange,
    workflowSubTabs = [],
    activeWorkflowSubTab = '',
    onWorkflowSubTabChange,
    workflowSections,
    tableTitle,
    tableSubtitle,
    search,
    onSearchChange,
    filters,
    sortKey = 'id',
    sortOrder = 'asc',
    onSortChange,
    resultCount,
    columns,
    rows,
    onRowClick,
    page,
    pageSize = 8,
    onPageChange,
}) {
    const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize))
    const safePage = Math.min(page, totalPages)
    const paginated = (rows || []).slice((safePage - 1) * pageSize, safePage * pageSize)

    const renderCell = (col, row) => {
        switch (col.key) {
            case 'id':
                return <span className="font-mono text-sm font-semibold text-teal-700">{row.id}</span>
            case 'claimMonth':
                return row.claimMonth && row.claimMonth !== '—' ? (
                    <span className="font-medium tabular-nums text-slate-700">{row.claimMonth}</span>
                ) : (
                    <span className="text-slate-400">—</span>
                )
            case 'employee':
                return <MisPersonInitialsCell name={row.employee} />
            case 'project':
                return <span className="block max-w-[200px] truncate text-slate-700">{row.project}</span>
            case 'category':
                return row.category && row.category !== '—' ? (
                    <span className="block max-w-[160px] truncate text-slate-700">{row.category}</span>
                ) : (
                    <span className="text-slate-400">—</span>
                )
            case 'serviceCategory':
                return <ServiceCategoryCell row={row} />
            case 'amount':
                return <span className="font-semibold text-slate-900">{formatCurrency(row.amount)}</span>
            case 'status':
                return <StatusBadge status={row.status} />
            case 'currentStep': {
                const label = formatCurrentStepLabel(row)
                const style = getCurrentStepBadgeStyle(row)
                return <MisPillBadge label={label} badgeClass={style.badge} dotClass={style.dot} />
            }
            case 'source':
                return row.source && row.source !== '—' ? (
                    <span className="text-slate-700">{row.source}</span>
                ) : (
                    <span className="text-slate-400">—</span>
                )
            case 'assignedTo':
                return (
                    <MisPersonInitialsCell
                        name={(row.assignedToNames || []).join(', ') || row.assignedTo}
                    />
                )
            case 'date':
                return <DateTimeCell value={row.createdAt || row.date} />
            case 'closedOn':
                return <DateTimeCell value={row.closedOn} />
            case 'closedBy':
                return <StackedNamesCell names={row.closedByNames} fallback={row.closedBy} />
            case 'sla':
                return <SolarSlaBadge row={row} />
            default:
                return row[col.key] ?? '—'
        }
    }

    return (
        <>
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f6f7f9]" aria-hidden />
            <CenterLoader loading={cardsLoading && !refreshing && !workflowSections} />

            <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-5">
                <div className="mb-4">
                    <WelcomeHeader
                        userName={userName}
                        companyName={companyName}
                        onFabAction={onCreateAction}
                        showFabAction={showCreate}
                        loadError={loadError}
                    />
                </div>

                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <QueueSwitch activeQueue={requestType} onChange={onRequestTypeChange} />
                    <PeriodToolbar periodState={periodState} onPeriodChange={onPeriodChange} />
                </div>

                <p className="mb-3 text-xs text-slate-500 sm:text-sm">
                    {requestType === 'reimbursement' ? 'Reimbursement' : 'Advance'} totals for the selected period
                </p>

                <div className="mb-5 flex flex-col gap-3 sm:mb-6">
                    {workflowSections ? (
                        <>
                            <WorkflowSectionRow
                                sectionKey="operations"
                                metrics={workflowSections.operations}
                                loading={cardsLoading}
                                activeStep=""
                                delayBase={0.04}
                            />
                            <WorkflowSectionRow
                                sectionKey="finance"
                                metrics={workflowSections.finance}
                                loading={cardsLoading}
                                activeStep=""
                                delayBase={0.12}
                            />
                        </>
                    ) : null}
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                >
                    <div className="relative z-20 border-b border-slate-200/90 px-3 py-3 sm:px-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                                    {tableTitle}
                                </h2>
                                {tableSubtitle ? (
                                    <p className="text-[11px] text-slate-500 sm:text-xs">{tableSubtitle}</p>
                                ) : null}
                            </div>
                            <div className="flex min-w-0 items-center gap-2 sm:max-w-sm sm:flex-1">
                                <div className="relative min-w-0 flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => onSearchChange?.(e.target.value)}
                                        placeholder="Search requests…"
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-3 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
                                    />
                                </div>
                                {filters.hasActive ? (
                                    <button
                                        type="button"
                                        onClick={filters.clearFilters}
                                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <div className="inline-flex shrink-0 gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                                {[
                                    { id: 'myItems', label: 'My Items' },
                                    { id: 'myTasks', label: 'My Tasks' },
                                    { id: 'participated', label: 'Participated' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => onWorkflowScopeChange?.(tab.id)}
                                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition sm:text-xs ${
                                            workflowScope === tab.id
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {workflowSubTabs.map((tab) => (
                                <ScopeChip
                                    key={tab.id}
                                    label={tab.label}
                                    count={tab.count}
                                    active={activeWorkflowSubTab === tab.id}
                                    onClick={() => onWorkflowSubTabChange?.(tab.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`${resultCount}-${search}`}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-slate-300/80 px-3 py-2 text-[11px] text-slate-500 sm:px-4 sm:text-xs"
                        >
                            Showing {resultCount} result{resultCount === 1 ? '' : 's'}
                            {search ? ` for "${search}"` : ''}
                        </motion.p>
                    </AnimatePresence>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1320px]">
                            <thead>
                                <tr className="bg-gradient-to-b from-[#f1f5f9] to-[#e8edf2] text-left text-xs font-semibold uppercase tracking-[0.06em] text-slate-600">
                                    {(columns || []).map((col) => (
                                        <th
                                            key={col.key}
                                            className={`whitespace-nowrap border-b border-slate-200 px-3 py-3 sm:px-4 ${
                                                col.key === 'currentStep'
                                                    ? 'min-w-[11.5rem]'
                                                    : col.key === 'serviceCategory'
                                                      ? 'min-w-[12rem]'
                                                      : ''
                                            }`}
                                        >
                                            {renderSolarMisTableHeadLabel(col, {
                                                filters,
                                                sortKey,
                                                sortOrder,
                                                onSortChange,
                                            })}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading && !paginated.length ? (
                                    <tr>
                                        <td colSpan={(columns || []).length || 1} className="px-5 py-16 text-center text-sm text-slate-500">
                                            Loading tasks…
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={(columns || []).length || 1} className="px-5 py-16 text-center">
                                            <p className="text-base font-bold text-slate-800">No requests found</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Try adjusting period, search, or filters
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((row) => {
                                        const statusKey = normalizeStatus(row.status)
                                        const statusRowClass = getStatusRowClass(row.status)
                                        return (
                                            <tr
                                                key={row.instanceId || row.id}
                                                onClick={() => onRowClick?.(row)}
                                                className={`border-b border-slate-100 transition-colors ${statusRowClass || 'hover:bg-teal-50/40'} ${
                                                    onRowClick ? 'cursor-pointer' : ''
                                                }`}
                                                data-status={statusKey}
                                            >
                                                {(columns || []).map((col) => (
                                                    <td
                                                        key={col.key}
                                                        className={`px-3 py-3.5 text-sm sm:px-4 ${
                                                            col.key === 'sla' ||
                                                            col.key === 'assignedTo' ||
                                                            col.key === 'serviceCategory'
                                                                ? 'whitespace-normal'
                                                                : col.key === 'currentStep'
                                                                  ? 'whitespace-nowrap min-w-[11.5rem]'
                                                                  : 'whitespace-nowrap'
                                                        }`}
                                                    >
                                                        {renderCell(col, row)}
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 sm:px-6">
                        <TablePagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            totalItems={rows?.length || 0}
                            itemsPerPage={pageSize}
                        />
                    </div>
                </motion.section>

                <footer className="py-6 text-center">
                    <p className="text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} {companyName || 'Refex Group'}. All rights reserved.
                    </p>
                </footer>
            </div>
        </>
    )
}

export { FileText, Clock, CheckCircle2, XCircle, Building2, Landmark }
