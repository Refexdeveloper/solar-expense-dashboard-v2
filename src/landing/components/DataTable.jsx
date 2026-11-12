import { useState, useMemo, useEffect } from 'react'
import StatusBadge from './StatusBadge.jsx'
import TablePagination from './TablePagination.jsx'
import { SolarSectionIcon, EmptyStateIllustration } from './SolarIllustrations.jsx'

export default function DataTable({ rows, columns, categories, loading, requestType = 'advance', onRowClick }) {
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [filterOpen, setFilterOpen] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState('All Categories')
    const itemsPerPage = 8

    const handleSort = (key) => {
        if (sortKey === key) {
            if (sortDir === 'asc') setSortDir('desc')
            else if (sortDir === 'desc') {
                setSortKey(null)
                setSortDir(null)
            }
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
        setCurrentPage(1)
    }

    const filteredAndSorted = useMemo(() => {
        let data = [...rows]
        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(
                (row) =>
                    String(row.id ?? '').toLowerCase().includes(q) ||
                    String(row.employee ?? '').toLowerCase().includes(q) ||
                    String(row.project ?? '').toLowerCase().includes(q) ||
                    String(row.category ?? '').toLowerCase().includes(q)
            )
        }
        if (categoryFilter !== 'All Categories') {
            data = data.filter((row) => row.category === categoryFilter)
        }
        if (sortKey && sortDir) {
            data.sort((a, b) => {
                const aVal = a[sortKey]
                const bVal = b[sortKey]
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
                }
                const aStr = String(aVal ?? '')
                const bStr = String(bVal ?? '')
                return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
            })
        }
        return data
    }, [rows, search, sortKey, sortDir, categoryFilter])

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage))
    const safePage = Math.min(currentPage, totalPages)
    const paginated = filteredAndSorted.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

    useEffect(() => {
        if (safePage !== currentPage) setCurrentPage(safePage)
    }, [safePage, currentPage])

    const getSortIcon = (key) => {
        if (sortKey !== key) return 'ri-arrow-up-down-line'
        return sortDir === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
    }

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(val)

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '—') return '—'
        const d = new Date(dateStr)
        if (Number.isNaN(d.getTime())) return dateStr
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const renderCell = (col, row) => {
        switch (col.key) {
            case 'id':
                return <span className="font-mono text-sm font-semibold text-primary-600">{row.id}</span>
            case 'employee': {
                const name = String(row.employee ?? '—')
                const initials = name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold">
                            {initials || '?'}
                        </div>
                        <span className="font-medium text-foreground-800">{name}</span>
                    </div>
                )
            }
            case 'project':
                return <span className="max-w-[200px] truncate block text-foreground-700">{row.project}</span>
            case 'amount':
                return <span className="font-semibold text-foreground-900">{formatCurrency(row.amount)}</span>
            case 'status':
                return <StatusBadge status={row.status} />
            case 'date':
                return <span className="text-foreground-600">{formatDate(row.date)}</span>
            default:
                return row[col.key] ?? '—'
        }
    }

    const sectionTitle = requestType === 'reimbursement' ? 'Reimbursement Requests' : 'Advance Requests'

    return (
        <section className="w-full animate-fade-in">
            <div className="dashboard-card overflow-hidden">
                <div className="px-5 pt-5 pb-4 sm:px-6 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <SolarSectionIcon className="w-10 h-10 shrink-0" />
                        <div>
                            <h2 className="text-lg md:text-xl font-heading font-bold text-foreground-900 tracking-tight">
                                {sectionTitle}
                            </h2>
                            <p className="text-foreground-500 text-sm mt-0.5">
                                {filteredAndSorted.length} request{filteredAndSorted.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 py-4 sm:px-6 bg-white">
                    <div className="relative flex-1">
                        <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 text-base" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setCurrentPage(1)
                            }}
                            placeholder="Search requests, sites, categories..."
                            className="search-input-mock w-full pl-10 pr-4 py-2.5 text-sm text-foreground-800 placeholder-foreground-400 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                                categoryFilter !== 'All Categories'
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-white border-slate-200 text-foreground-600 hover:border-slate-300'
                            }`}
                        >
                            <i className="ri-filter-3-line" />
                            <span>{categoryFilter === 'All Categories' ? 'Filter' : categoryFilter}</span>
                            <i className={`ri-arrow-down-s-line text-foreground-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {filterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                                <div className="absolute right-0 top-full mt-1.5 z-20 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => {
                                                setCategoryFilter(cat)
                                                setFilterOpen(false)
                                                setCurrentPage(1)
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                                categoryFilter === cat
                                                    ? 'bg-primary-50 text-primary-700 font-semibold'
                                                    : 'text-foreground-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="table-head-mock">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        className={`px-5 py-3.5 text-left text-[11px] font-bold text-primary-700 uppercase tracking-wider ${
                                            col.sortable ? 'cursor-pointer select-none hover:text-primary-800' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-1 whitespace-nowrap">
                                            {col.label}
                                            {col.sortable && (
                                                <i
                                                    className={`${getSortIcon(col.key)} text-sm ${
                                                        sortKey === col.key ? 'text-primary-600' : 'text-primary-300'
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length || 1} className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <i className="ri-loader-4-line text-4xl text-primary-500 animate-spin" />
                                            <p className="text-foreground-500 font-medium">Loading tasks…</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length || 1} className="px-5 py-12 text-center">
                                        <div className="flex flex-col items-center gap-4 py-6">
                                            <EmptyStateIllustration className="w-72 h-44 max-w-full" />
                                            <div>
                                                <p className="text-foreground-800 font-heading font-bold text-lg">
                                                    No requests found
                                                </p>
                                                <p className="text-foreground-400 text-sm mt-1">
                                                    Try adjusting your search or filters
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((row) => (
                                    <tr
                                        key={row.instanceId || row.id}
                                        onClick={() => onRowClick?.(row)}
                                        className={`border-b border-slate-100 transition-colors hover:bg-primary-50/30 ${
                                            onRowClick ? 'cursor-pointer' : ''
                                        }`}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-3.5 text-sm whitespace-nowrap">
                                                {renderCell(col, row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-5 pb-5 sm:px-6 border-t border-slate-100 bg-white">
                    <TablePagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredAndSorted.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            </div>
        </section>
    )
}
