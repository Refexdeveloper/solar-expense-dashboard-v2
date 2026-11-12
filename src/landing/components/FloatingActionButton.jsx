import { useState } from 'react'
import { QUEUE_ICONS } from '../mis/queueIcons.jsx'

const PILL_WIDTH = 140
const PILL_HEIGHT = 32
const PILL_GAP = 8
const PILL_OFFSET_Y = (PILL_HEIGHT + PILL_GAP) / 2
const PLUS_SIZE = 44
const PILL_RIGHT = 0
const PILL_H_GAP = 14
const PILL_TRANSLATE_X = PLUS_SIZE + PILL_H_GAP

const SATELLITE_ACTIONS = [
    {
        label: 'Advance',
        icon: QUEUE_ICONS.advance,
        offsetY: -PILL_OFFSET_Y,
        delayOpen: '0ms',
        delayClose: '40ms',
    },
    {
        label: 'Reimbursement',
        icon: QUEUE_ICONS.reimbursement,
        offsetY: PILL_OFFSET_Y,
        delayOpen: '55ms',
        delayClose: '0ms',
    },
]

const FAN_WIDTH = PILL_TRANSLATE_X + PILL_WIDTH + 12
const FAN_HEIGHT = PILL_OFFSET_Y * 2 + PILL_HEIGHT + 24
const PLUS_TOP = (FAN_HEIGHT - PLUS_SIZE) / 2
const PILL_ANCHOR_TOP = FAN_HEIGHT / 2 - PILL_HEIGHT / 2

function PlusIcon({ open }) {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{
                display: 'block',
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
        >
            <path d="M12 5v14M5 12h14" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
}

function SatelliteButton({ action, actionOpen, onAction }) {
    const Icon = action.icon
    return (
        <button
            type="button"
            onClick={() => onAction?.(action.label)}
            className="header-fab-pill satellite-pill absolute flex items-center justify-start gap-1.5 cursor-pointer rounded-xl transition-all duration-300"
            style={{
                width: `${PILL_WIDTH}px`,
                height: `${PILL_HEIGHT}px`,
                padding: '0 10px 0 8px',
                top: `${PILL_ANCHOR_TOP}px`,
                right: `${PILL_RIGHT}px`,
                transform: actionOpen
                    ? `translate(-${PILL_TRANSLATE_X}px, ${action.offsetY}px)`
                    : 'translate(0px, 0px) scale(0)',
                opacity: actionOpen ? 1 : 0,
                pointerEvents: actionOpen ? 'auto' : 'none',
                transitionDelay: actionOpen ? action.delayOpen : action.delayClose,
                transformOrigin: 'right center',
                zIndex: 22,
            }}
        >
            <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 bg-white/20">
                <Icon className="h-3 w-3 text-white" strokeWidth={2.4} aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-white">{action.label}</span>
        </button>
    )
}

function MobilePill({ action, onAction }) {
    const Icon = action.icon
    return (
        <button
            key={action.label}
            type="button"
            onClick={() => onAction?.(action.label)}
            className="header-fab-pill flex items-center justify-start gap-1.5 cursor-pointer rounded-lg"
            style={{
                width: `${PILL_WIDTH}px`,
                height: `${PILL_HEIGHT}px`,
                padding: '0 8px',
            }}
        >
            <Icon className="h-3 w-3 text-white" strokeWidth={2.4} aria-hidden="true" />
            <span className="text-[10px] font-semibold text-white">{action.label}</span>
        </button>
    )
}

export default function FloatingActionButton({ onAction }) {
    const [actionOpen, setActionOpen] = useState(false)

    return (
        <>
            <div className="flex sm:hidden items-center gap-1.5">
                {SATELLITE_ACTIONS.map((action) => (
                    <MobilePill key={action.label} action={action} onAction={onAction} />
                ))}
            </div>

            <div
                className="relative hidden sm:block flex-shrink-0"
                style={{ width: `${FAN_WIDTH}px`, height: `${FAN_HEIGHT}px`, minWidth: `${PLUS_SIZE + 8}px` }}
                onMouseEnter={() => setActionOpen(true)}
                onMouseLeave={() => setActionOpen(false)}
            >
                {SATELLITE_ACTIONS.map((action) => (
                    <SatelliteButton
                        key={action.label}
                        action={action}
                        actionOpen={actionOpen}
                        onAction={onAction}
                    />
                ))}

                <button
                    type="button"
                    aria-expanded={actionOpen}
                    aria-label="Create request"
                    tabIndex={-1}
                    className={`header-fab-btn absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        actionOpen ? 'is-open' : ''
                    }`}
                    style={{
                        width: `${PLUS_SIZE}px`,
                        height: `${PLUS_SIZE}px`,
                        top: `${PLUS_TOP}px`,
                        right: 0,
                        zIndex: 30,
                    }}
                >
                    <PlusIcon open={actionOpen} />
                </button>
            </div>
        </>
    )
}
