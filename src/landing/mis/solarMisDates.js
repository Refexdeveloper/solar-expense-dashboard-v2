/** MIS table date-only display — DD MMM YYYY (e.g. 07 Aug 2026). */
export function formatMisTableDate(value) {
    if (value == null || value === '' || value === '—') return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = d.toLocaleString('en-GB', { month: 'short' })
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
}

/** MIS table time line — e.g. 5:49 PM */
export function formatMisTableTime(value) {
    if (value == null || value === '' || value === '—') return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}
