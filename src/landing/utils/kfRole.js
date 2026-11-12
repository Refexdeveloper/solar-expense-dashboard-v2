/** Normalize role label for comparison (Site Incharge, Site_Incharge, etc.). */
export function normalizeRoleKey(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

export function isSiteInchargeRoleName(name) {
    return normalizeRoleKey(name) === 'siteincharge'
}

/** HO Head / HO Heads — full All Items visibility on Solar expense dashboards. */
export function isHoHeadRoleName(name) {
    const key = normalizeRoleKey(name)
    if (!key) return false
    return key === 'hohead' || key === 'hoheads' || key.startsWith('hohead')
}

export function stringifyKfRole(value) {
    if (!value) return ''
    if (typeof value === 'string') return value.trim()
    if (Array.isArray(value)) {
        for (const item of value) {
            const resolved = stringifyKfRole(item)
            if (resolved) return resolved
        }
        return ''
    }
    if (typeof value === 'object') {
        return String(
            value.Name ??
                value.name ??
                value._name ??
                value.Title ??
                value.title ??
                value.Role ??
                value.role ??
                ''
        ).trim()
    }
    return ''
}

/** Collect every role / group label from a Kissflow user or profile object. */
export function collectRoleNames(source) {
    if (!source || typeof source !== 'object') return []

    const names = []
    const seen = new Set()
    const add = (val) => {
        if (val == null || val === '') return
        if (typeof val === 'string') {
            const s = val.trim()
            if (s && !seen.has(s.toLowerCase())) {
                seen.add(s.toLowerCase())
                names.push(s)
            }
            return
        }
        const resolved = stringifyKfRole(val)
        if (resolved && !seen.has(resolved.toLowerCase())) {
            seen.add(resolved.toLowerCase())
            names.push(resolved)
        }
    }

    add(source.Role)
    add(source._user_type)

    for (const list of [source.Roles, source.AppRoles, source.roles, source.Groups, source.groups]) {
        if (!Array.isArray(list)) continue
        for (const item of list) add(item)
    }

    return names
}

export function resolveCurrentRoleName(client) {
    const u = client?.user ?? client?.context?.user
    const names = collectRoleNames(u)
    return names[0] || ''
}

export function resolveRoleNameFromProfile(profile, client) {
    const names = [...collectRoleNames(profile), ...collectRoleNames(client?.user ?? client?.context?.user)]
    return names[0] || ''
}

function collectAllRoleNames(client, profile, extraRoleNames = []) {
    return [
        ...collectRoleNames(profile),
        ...collectRoleNames(client?.user),
        ...collectRoleNames(client?.context?.user),
        ...deepCollectRoleStrings(profile),
        ...deepCollectRoleStrings(client?.user),
        ...deepCollectRoleStrings(client?.context?.user),
        ...extraRoleNames.filter(Boolean).map((n) => String(n).trim()),
    ]
}

/** True when any resolved role matches Site Incharge. */
export function userHasSiteInchargeRole(client, profile, extraRoleNames = []) {
    return collectAllRoleNames(client, profile, extraRoleNames).some(isSiteInchargeRoleName)
}

/** True when any resolved role matches HO Head. */
export function userHasHoHeadRole(client, profile, extraRoleNames = []) {
    return collectAllRoleNames(client, profile, extraRoleNames).some(isHoHeadRoleName)
}

const ROLE_FIELD_HINTS = /role|group|title|designation|type|permission|app/i

/** Walk user/profile objects for any string that might be a role label. */
export function deepCollectRoleStrings(source, depth = 0, seen = new Set()) {
    if (!source || depth > 5) return []

    const names = []
    const add = (val) => {
        if (typeof val !== 'string') return
        const s = val.trim()
        if (s.length < 2 || s.length > 120) return
        const key = s.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        names.push(s)
    }

    if (typeof source === 'string') {
        add(source)
        return names
    }

    if (Array.isArray(source)) {
        for (const item of source) {
            names.push(...deepCollectRoleStrings(item, depth + 1, seen))
        }
        return names
    }

    if (typeof source !== 'object') return names

    for (const [key, val] of Object.entries(source)) {
        if (key === 'Email' || key === 'email' || key === 'Name' && depth > 0) continue
        if (typeof val === 'string' && (ROLE_FIELD_HINTS.test(key) || depth <= 1)) {
            add(val)
        } else if (val && typeof val === 'object') {
            const resolved = stringifyKfRole(val)
            if (resolved) add(resolved)
            if (ROLE_FIELD_HINTS.test(key) || depth <= 2) {
                names.push(...deepCollectRoleStrings(val, depth + 1, seen))
            }
        }
    }

    return names
}

/** True when the user has the Site Incharge app role (same rule as solar-expense-dashboard v1). */
export function shouldShowCreateFab({ client, profile, extraRoleNames, forceShow }) {
    if (forceShow) return true
    return userHasSiteInchargeRole(client, profile, extraRoleNames)
}
