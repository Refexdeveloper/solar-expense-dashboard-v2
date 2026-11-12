function env(name, fallback = '') {
    try {
        const v = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]
        return v != null && String(v).trim() !== '' ? String(v).trim() : fallback
    } catch {
        return fallback
    }
}

/** Same hardcoded app id as solar-expense-dashboard v1 — required for live process APIs. */
export const APP_ID = 'Solar_Site_Expense_Governance_Syst_A00'

/** Kissflow application id for `_application_id=` on process APIs. */
export function resolveAppId() {
    return env('VITE_KF_APP_ID', APP_ID)
}

export function resolveAdvanceProcessId() {
    return env('VITE_KF_ADVANCE_PROCESS_ID', 'Solar_Advance_Request_YTLA')
}

export function resolveReimbursementProcessId() {
    return env('VITE_KF_REIMBURSEMENT_PROCESS_ID', 'Technician_Reimbursement__YTLM')
}

/** `_application_id` for reimbursement APIs (parent Solar Expense app, not process id). */
export function resolveReimbursementAppId() {
    return env('VITE_KF_REIMBURSEMENT_APPLICATION_ID', '') || resolveAppId()
}

export function resolveAdvanceReportId() {
    return env('VITE_KF_ADVANCE_REPORT_ID', 'All_Items_A11')
}

export function resolveReimbursementReportId() {
    return env('VITE_KF_REIMBURSEMENT_REPORT_ID', 'All_Items_A12')
}

export function resolvePopupId(kind) {
    if (kind === 'Advance') {
        return env('VITE_KF_POPUP_ADVANCE', 'Popup_6EVNyeI5ca')
    }
    if (kind === 'Reimbursement') {
        return env('VITE_KF_POPUP_REIMBURSEMENT', 'Popup_JOzzdtsOik')
    }
    return ''
}

/** Normalize kf.api() payloads (`{ data }` vs `{ Data }` vs raw). */
export function unwrapKfApiResponse(resp) {
    if (resp == null) return resp
    if (Array.isArray(resp)) return resp
    if (typeof resp !== 'object') return resp
    if (resp.data !== undefined && resp.data !== null) return resp.data
    if (resp.Data !== undefined && resp.Data !== null) return resp.Data
    return resp
}

export function extractListPayload(resp) {
    if (resp == null) return []
    if (Array.isArray(resp)) return resp
    if (typeof resp !== 'object') return []
    if (Array.isArray(resp.Data)) return resp.Data
    if (Array.isArray(resp.data)) return resp.data
    if (Array.isArray(resp.Item)) return resp.Item
    if (Array.isArray(resp.items)) return resp.items
    const nested = resp.data ?? resp.Data
    if (nested && typeof nested === 'object') {
        if (Array.isArray(nested.Data)) return nested.Data
        if (Array.isArray(nested.data)) return nested.data
        if (Array.isArray(nested.Item)) return nested.Item
        if (Array.isArray(nested.items)) return nested.items
    }
    return []
}
