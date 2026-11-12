/** Compact person display — mirrors ITSM misCompactDisplay / MisPersonInitialsCell. */

function norm(value) {
    return String(value ?? '').trim()
}

/** Mohamed Aasik → MA, Arun Kumar → AK, Gowtham → GW */
export function getPersonInitials(name) {
    const label = norm(name)
    if (!label || label === '—') return ''
    const parts = label.split(',').map((part) => part.trim()).filter(Boolean)
    if (parts.length > 1) {
        return parts.map((part) => getPersonInitials(part)).filter(Boolean).join(', ')
    }
    const words = label.split(/\s+/).filter(Boolean)
    if (!words.length) return ''
    if (words.length === 1) {
        const token = words[0].replace(/[^A-Za-z]/g, '')
        if (!token) return words[0].slice(0, 2).toUpperCase()
        const first = token.charAt(0)
        const nextConsonant = token.slice(1).split('').find((ch) => !/[aeiou]/i.test(ch))
        if (nextConsonant) return `${first}${nextConsonant}`.toUpperCase()
        return token.slice(0, 2).toUpperCase()
    }
    const first = words[0].replace(/[^A-Za-z]/g, '').charAt(0)
    const last = words[words.length - 1].replace(/[^A-Za-z]/g, '').charAt(0)
    return `${first}${last}`.toUpperCase()
}

export const MIS_AVATAR_TONES = [
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-sky-100', text: 'text-sky-800' },
    { bg: 'bg-violet-100', text: 'text-violet-800' },
    { bg: 'bg-amber-100', text: 'text-amber-800' },
    { bg: 'bg-rose-100', text: 'text-rose-800' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800' },
]

/** Stable color for a person name so initials stay distinct across rows. */
export function getPersonAvatarTone(name) {
    const label = norm(name).toLowerCase()
    if (!label) return MIS_AVATAR_TONES[0]
    let hash = 0
    for (let i = 0; i < label.length; i += 1) {
        hash = (hash << 5) - hash + label.charCodeAt(i)
        hash |= 0
    }
    const index = Math.abs(hash) % MIS_AVATAR_TONES.length
    return MIS_AVATAR_TONES[index]
}

export function splitPersonNames(name) {
    return norm(name)
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part && part !== '—')
}

const HOVER_NAME_TOOLTIP_CLASS =
    'pointer-events-none absolute left-full top-1/2 z-40 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-black shadow-lg group-hover/misrel:block'

function MisPersonAvatar({ name }) {
    const full = norm(name)
    const initials = getPersonInitials(full) || full.slice(0, 2).toUpperCase()
    const tone = getPersonAvatarTone(full)
    return (
        <span className="group/misrel relative inline-flex leading-none">
            <span
                className={`inline-flex h-7 w-7 shrink-0 cursor-default items-center justify-center rounded-full text-[10px] font-bold leading-none ${tone.bg} ${tone.text}`}
                aria-label={full}
            >
                {initials}
            </span>
            <span role="tooltip" className={HOVER_NAME_TOOLTIP_CLASS}>
                {full}
            </span>
        </span>
    )
}

/** Requestor cell — 2-letter avatar; hover shows full name (ITSM pattern). */
export function MisPersonInitialsCell({ name }) {
    const names = splitPersonNames(name)
    if (!names.length) return <span className="text-slate-400">—</span>
    return (
        <span className="inline-flex items-center gap-1 leading-none">
            {names.map((person) => (
                <MisPersonAvatar key={person} name={person} />
            ))}
        </span>
    )
}
