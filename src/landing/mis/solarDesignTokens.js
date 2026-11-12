/** Solar expense MIS design tokens — mirrors ITSM mis-modern palette. */

export const SOLAR_BRAND = {
    primary: '#0d9488',
    primaryDark: '#0f766e',
    soft: '#f0fdfa',
}

export const SOLAR_KPI_ACCENT = {
    brand: {
        border: 'border-teal-200',
        wash: 'bg-gradient-to-br from-white from-[14%] via-white via-[42%] to-teal-50/80',
        radial: 'bg-[radial-gradient(155%_118%_at_88%_88%,rgba(13,148,136,0.20)_0%,transparent_72%)]',
        iconGradient: 'bg-gradient-to-br from-[#0d9488] to-[#059669]',
        accent: 'text-[#0f766e]',
        watermark: 'text-[#0d9488]',
    },
    warning: {
        border: 'border-amber-300',
        wash: 'bg-gradient-to-br from-white from-[14%] via-white via-[42%] to-amber-50/85',
        radial: 'bg-[radial-gradient(155%_118%_at_88%_88%,rgba(245,158,11,0.20)_0%,transparent_72%)]',
        iconGradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
        accent: 'text-amber-700',
        watermark: 'text-amber-500',
    },
    success: {
        border: 'border-emerald-300',
        wash: 'bg-gradient-to-br from-white from-[14%] via-white via-[42%] to-emerald-50/90',
        radial: 'bg-[radial-gradient(155%_118%_at_88%_88%,rgba(16,185,129,0.18)_0%,transparent_72%)]',
        iconGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        accent: 'text-emerald-700',
        watermark: 'text-emerald-500',
    },
    error: {
        border: 'border-red-300',
        wash: 'bg-gradient-to-br from-white from-[14%] via-white via-[42%] to-red-50/90',
        radial: 'bg-[radial-gradient(155%_118%_at_88%_88%,rgba(239,68,68,0.18)_0%,transparent_72%)]',
        iconGradient: 'bg-gradient-to-br from-red-500 to-red-600',
        accent: 'text-red-700',
        watermark: 'text-red-500',
    },
    info: {
        border: 'border-sky-200',
        wash: 'bg-gradient-to-br from-white from-[14%] via-white via-[42%] to-sky-50/80',
        radial: 'bg-[radial-gradient(155%_118%_at_88%_88%,rgba(14,165,233,0.18)_0%,transparent_72%)]',
        iconGradient: 'bg-gradient-to-br from-sky-500 to-teal-600',
        accent: 'text-sky-800',
        watermark: 'text-sky-500',
    },
    violet: {
        border: 'border-indigo-200',
        wash: 'bg-gradient-to-br from-white from-[14%] via-white via-[42%] to-indigo-50/80',
        radial: 'bg-[radial-gradient(155%_118%_at_88%_88%,rgba(99,102,241,0.16)_0%,transparent_72%)]',
        iconGradient: 'bg-gradient-to-br from-indigo-500 to-teal-600',
        accent: 'text-indigo-800',
        watermark: 'text-indigo-400',
    },
}

export const SOLAR_STATUS = {
    Draft: { badge: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', dot: 'bg-slate-400' },
    Pending: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', dot: 'bg-amber-500' },
    Approved: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200', dot: 'bg-emerald-500' },
    Rejected: { badge: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200', dot: 'bg-red-500' },
    Withdrawn: { badge: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200', dot: 'bg-slate-400' },
}

/** Full-row status tint — mirrors ITSM / expense list marking. */
export const SOLAR_STATUS_ROW = {
    Draft: 'border-l-[3px] border-l-slate-400 bg-slate-50/80 hover:bg-slate-100/80',
    Pending: 'border-l-[3px] border-l-amber-500 bg-amber-50/40 hover:bg-amber-50/70',
    Approved: 'border-l-[3px] border-l-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70',
    Rejected: 'border-l-[3px] border-l-red-500 bg-red-50/45 hover:bg-red-100/60',
    Withdrawn: 'border-l-[3px] border-l-slate-400 bg-slate-50/70 hover:bg-slate-100/70',
}

export function getGreetingText() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

export function toInitials(name) {
    return String(name || 'User')
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U'
}

export const MONTH_OPTIONS = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
]

export const STATUS_TABS = [
    { key: 'All', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Rejected', label: 'Rejected' },
]

export const QUEUE_OPTIONS = [
    { id: 'advance', label: 'Advance' },
    { id: 'reimbursement', label: 'Reimbursement' },
]
