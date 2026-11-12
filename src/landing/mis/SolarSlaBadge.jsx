import { getSolarSlaMisDisplay, SOLAR_SLA_BADGE } from './solarSla.js'
import MisPillBadge from './MisPillBadge.jsx'

/** SLA pill matches Status badge; duration stays as a subtitle. */
export default function SolarSlaBadge({ row }) {
    const display = getSolarSlaMisDisplay(row)
    const primary = display.primary === '—' || !display.primary ? 'No SLA' : display.primary
    const state = display.primary === '—' || !display.primary ? 'none' : display.state
    const style = SOLAR_SLA_BADGE[state] || SOLAR_SLA_BADGE.none

    return (
        <div className="min-w-[5.5rem]">
            <MisPillBadge label={primary} badgeClass={style.badge} dotClass={style.dot} />
            {display.sub ? (
                <p className="mt-1 text-xs font-medium text-slate-500">{display.sub}</p>
            ) : null}
        </div>
    )
}
