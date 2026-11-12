/**
 * Excel-style MIS column header filters/sort — mirrors ITSM RefexItsmSharedUI.
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Filter } from 'lucide-react'

function useFixedDropdownStyle(rootRef, open) {
    const [style, setStyle] = useState(null)

    useEffect(() => {
        if (!open || !rootRef.current) {
            setStyle(null)
            return undefined
        }
        const update = () => {
            if (!rootRef.current) return
            const rect = rootRef.current.getBoundingClientRect()
            setStyle({
                position: 'fixed',
                top: `${rect.bottom + 4}px`,
                left: `${rect.left}px`,
                minWidth: '10rem',
                zIndex: 10000,
            })
        }
        update()
        window.addEventListener('scroll', update, true)
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update, true)
            window.removeEventListener('resize', update)
        }
    }, [open, rootRef])

    return style
}

function MisFilterDropdownPanel({ open, rootRef, panelRef, children }) {
    const style = useFixedDropdownStyle(rootRef, open)
    if (!open || !style || typeof document === 'undefined') return null
    return createPortal(
        <div
            ref={panelRef}
            style={style}
            className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>,
        document.body
    )
}

function MisFilterOptionList({ value = '', options = [], onChange, allowAll = true, allLabel = 'All' }) {
    const items = []
    if (allowAll) items.push({ value: '', label: allLabel })
    ;(options || []).forEach((opt) => {
        const optionValue = typeof opt === 'string' ? opt : (opt?.value ?? opt?.label ?? '')
        const optionLabel = typeof opt === 'string' ? opt : (opt?.label ?? opt?.value ?? '')
        if (optionValue === '') return
        items.push({ value: optionValue, label: optionLabel || optionValue })
    })

    return (
        <div className="max-h-56 min-w-[10rem] overflow-y-auto">
            {items.map((item) => {
                const selected = (value || '') === (item.value || '')
                return (
                    <button
                        key={`${item.value || '__all'}::${item.label}`}
                        type="button"
                        className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs font-medium transition ${
                            selected
                                ? 'bg-teal-50 text-teal-800'
                                : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onChange?.(item.value)
                        }}
                    >
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}

function useOutsideClose(open, rootRef, panelRef, setOpen) {
    useEffect(() => {
        if (!open) return undefined
        const onDoc = (event) => {
            const target = event.target
            if (rootRef.current?.contains(target)) return
            if (panelRef.current?.contains(target)) return
            setOpen(false)
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [open, rootRef, panelRef, setOpen])
}

/** Column value filter — label + funnel icon dropdown. */
export function SolarMisColumnHeaderFilter({ label, value = '', options = [], onChange }) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef(null)
    const panelRef = useRef(null)
    const active = Boolean(value)
    useOutsideClose(open, rootRef, panelRef, setOpen)

    return (
        <div ref={rootRef} className="relative z-50 inline-flex max-w-full items-center gap-1">
            <span>{label}</span>
            <button
                type="button"
                title={`Filter ${label}`}
                aria-label={`Filter ${label}`}
                aria-expanded={open}
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen((prev) => !prev)
                }}
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                    active
                        ? 'bg-teal-600/15 text-teal-700'
                        : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-600'
                }`}
            >
                <Filter className="h-3 w-3" strokeWidth={2.25} />
            </button>
            <MisFilterDropdownPanel open={open} rootRef={rootRef} panelRef={panelRef}>
                <MisFilterOptionList
                    value={value}
                    options={options}
                    onChange={(next) => {
                        onChange?.(next || '')
                        setOpen(false)
                    }}
                />
                {active ? (
                    <button
                        type="button"
                        className="mt-1.5 w-full rounded-md px-2 py-1 text-left text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onChange?.('')
                            setOpen(false)
                        }}
                    >
                        Clear filter
                    </button>
                ) : null}
            </MisFilterDropdownPanel>
        </div>
    )
}

/** Ascending / Descending sort — same funnel icon pattern as ITSM Request ID. */
export function SolarMisColumnSortFilter({ label, value = 'asc', active = false, onChange }) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef(null)
    const panelRef = useRef(null)
    const highlighted = active
    useOutsideClose(open, rootRef, panelRef, setOpen)

    return (
        <div ref={rootRef} className="relative z-50 inline-flex max-w-full items-center gap-1">
            <span>{label}</span>
            <button
                type="button"
                title={`Sort ${label}`}
                aria-label={`Sort ${label}`}
                aria-expanded={open}
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen((prev) => !prev)
                }}
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                    highlighted
                        ? 'bg-teal-600/15 text-teal-700'
                        : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-600'
                }`}
            >
                <Filter className="h-3 w-3" strokeWidth={2.25} />
            </button>
            <MisFilterDropdownPanel open={open} rootRef={rootRef} panelRef={panelRef}>
                <MisFilterOptionList
                    value={value || 'asc'}
                    allowAll={false}
                    options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' },
                    ]}
                    onChange={(next) => {
                        onChange?.(next || 'asc')
                        setOpen(false)
                    }}
                />
            </MisFilterDropdownPanel>
        </div>
    )
}

/** Map solar table columns → filter or sort header control. */
export function renderSolarMisTableHeadLabel(col, {
    filters = {},
    sortKey = 'id',
    sortOrder = 'asc',
    onSortChange,
} = {}) {
    const key = col?.key

    if (key === 'id' || key === 'amount' || key === 'date') {
        const active = sortKey === key
        return (
            <SolarMisColumnSortFilter
                label={col.label}
                value={active ? sortOrder : 'asc'}
                active={active}
                onChange={(next) => onSortChange?.(key, next)}
            />
        )
    }

    if (key === 'employee') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.requestor || ''}
                options={filters.requestorOptions || []}
                onChange={filters.setRequestor}
            />
        )
    }

    if (key === 'project') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.site || ''}
                options={filters.siteOptions || []}
                onChange={filters.setSite}
            />
        )
    }

    if (key === 'category') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.category || ''}
                options={filters.categoryOptions || []}
                onChange={filters.setCategory}
            />
        )
    }

    if (key === 'serviceCategory') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.serviceCategory || ''}
                options={filters.serviceCategoryOptions || []}
                onChange={filters.setServiceCategory}
            />
        )
    }

    if (key === 'claimMonth') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.claimMonth || ''}
                options={filters.claimMonthOptions || []}
                onChange={filters.setClaimMonth}
            />
        )
    }

    if (key === 'status') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.status || ''}
                options={filters.statusOptions || []}
                onChange={filters.setStatus}
            />
        )
    }

    if (key === 'currentStep') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.currentStep || ''}
                options={filters.currentStepOptions || []}
                onChange={filters.setCurrentStep}
            />
        )
    }

    if (key === 'source') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.source || ''}
                options={filters.sourceOptions || []}
                onChange={filters.setSource}
            />
        )
    }

    if (key === 'assignedTo') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.assignedTo || ''}
                options={filters.assignedToOptions || []}
                onChange={filters.setAssignedTo}
            />
        )
    }

    if (key === 'closedBy') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.closedBy || ''}
                options={filters.closedByOptions || []}
                onChange={filters.setClosedBy}
            />
        )
    }

    if (key === 'sla') {
        return (
            <SolarMisColumnHeaderFilter
                label={col.label}
                value={filters.sla || ''}
                options={filters.slaOptions || []}
                onChange={filters.setSla}
            />
        )
    }

    return col.label
}
