import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { KissflowSDKContext, kf } from '../sdk/index.js'
import { SolarMisDashboardChrome } from './mis/SolarMisDashboardChrome.jsx'
import {
    applySearchFilter,
    useSolarPeriodFilter,
    useSolarTableFilters,
} from './mis/solarFilters.js'
import {
    fetchDashboardData,
    fetchWorkflowQueue,
    ADVANCE_TABLE_COLUMNS,
    REIMBURSEMENT_TABLE_COLUMNS,
    MY_ITEM_STATUSES,
    PROCESS_IDS,
    buildRecordPopupParams,
    resolveActivityForPopup,
} from './utils/pendingTasks.js'
import { resolveAppId, resolvePopupId, unwrapKfApiResponse } from './utils/kfEnv.js'
import {
    resolveCurrentRoleName,
    resolveRoleNameFromProfile,
    shouldShowCreateFab,
    userHasHoHeadRole,
} from './utils/kfRole.js'
import { getPreviewDashboardData } from './mocks/dashboard.js'
import {
    computeWorkflowSectionCards,
} from './mis/solarApprovalSteps.js'

function getClient() {
    return typeof window !== 'undefined' && window.kf ? window.kf : kf
}

function openPopup(label, params = {}) {
    const client = getClient()
    const popupId = resolvePopupId(label)
    if (!popupId) return Promise.resolve()
    if (!client?.app?.page?.openPopup) {
        console.warn('Kissflow SDK not ready')
        return Promise.resolve()
    }
    try {
        const result = client.app.page.openPopup(popupId, params)
        return result && typeof result.catch === 'function' ? result : Promise.resolve(result)
    } catch (e) {
        console.error('openPopup failed', e)
        client.client?.showInfo?.(`Unable to open the ${label} form.`)
        return Promise.reject(e)
    }
}

function popupLabelForRequestType(requestType) {
    return requestType === 'reimbursement' ? 'Reimbursement' : 'Advance'
}

function forceShowCreateFab() {
    try {
        return String(import.meta.env?.VITE_SHOW_CREATE_FAB || '').trim().toLowerCase() === 'true'
    } catch {
        return false
    }
}

export function DefaultLandingComponent() {
    const { kf: kfFromContext, sdkReady, sdkFailed } = useContext(KissflowSDKContext)
    const [requestType, setRequestType] = useState('advance')
    const [advanceRows, setAdvanceRows] = useState([])
    const [reimbursementRows, setReimbursementRows] = useState([])
    const [overviewAdvanceRows, setOverviewAdvanceRows] = useState([])
    const [overviewReimbursementRows, setOverviewReimbursementRows] = useState([])
    const [cardsLoading, setCardsLoading] = useState(true)
    const [tableColumns, setTableColumns] = useState(ADVANCE_TABLE_COLUMNS)
    const [dataError, setDataError] = useState('')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [usingMocks, setUsingMocks] = useState(false)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [sortKey, setSortKey] = useState('id')
    const [sortOrder, setSortOrder] = useState('asc')
    const [activeStep, setActiveStep] = useState('')
    const [workflowScope, setWorkflowScope] = useState('myItems')
    const [itemStatus, setItemStatus] = useState('Draft')
    const [activityStepId, setActivityStepId] = useState('')
    const [workflowSteps, setWorkflowSteps] = useState([])
    const [itemCounts, setItemCounts] = useState({
        Draft: 0,
        InProgress: 0,
        Completed: 0,
        Withdrawn: 0,
        Rejected: 0,
    })
    const activityStepRef = useRef('')
    const fetchSeqRef = useRef(0)
    const hasLoadedOnceRef = useRef(false)
    const popupContextRef = useRef({
        advance: { instanceActivityMap: {}, processId: '', appId: '' },
        reimbursement: { instanceActivityMap: {}, processId: '', appId: '' },
    })

    const { periodState, setPeriodState, applyPeriod, resetKey: periodResetKey } = useSolarPeriodFilter()

    const client = kfFromContext ?? getClient()
    const userName = (client && client.user && client.user.Name) || (usingMocks ? 'Preview User' : '')
    const accountId = client?.account?._id || client?.context?.account?._id
    const userId = String(client?.user?._id || client?.context?.user?._id || '').trim()
    const userEmail = String(client?.user?.Email || client?.user?.email || client?.context?.user?.Email || '')
        .trim()
        .toLowerCase()
    const appId = useMemo(() => resolveAppId(), [sdkReady])
    const [userProfile, setUserProfile] = useState(null)
    const [appRoleName, setAppRoleName] = useState('')
    const [roleName, setRoleName] = useState(() => resolveCurrentRoleName(client))

    const isSiteIncharge = useMemo(
        () =>
            shouldShowCreateFab({
                client,
                profile: userProfile,
                extraRoleNames: [roleName, appRoleName],
                forceShow: forceShowCreateFab(),
            }),
        [client, userProfile, roleName, appRoleName]
    )
    const isHoHead = useMemo(
        () => userHasHoHeadRole(client, userProfile, [roleName, appRoleName]),
        [client, userProfile, roleName, appRoleName]
    )
    const showFabAction = isSiteIncharge || usingMocks

    const [resolvedCompany, setResolvedCompany] = useState(() =>
        String(client?.user?.Company || client?.context?.user?.Company || '').trim()
    )
    const companyDisplayName = resolvedCompany.trim() || 'Refex Group'

    const tableRows = requestType === 'reimbursement' ? reimbursementRows : advanceRows
    const periodScopedRows = useMemo(() => applyPeriod(tableRows), [applyPeriod, tableRows])
    const overviewRows = useMemo(() => {
        const source = requestType === 'reimbursement' ? overviewReimbursementRows : overviewAdvanceRows
        return applyPeriod(source || [])
    }, [applyPeriod, requestType, overviewAdvanceRows, overviewReimbursementRows])
    const misFilters = useSolarTableFilters(periodScopedRows, `${requestType}:${periodResetKey}`)
    const {
        applyFilters,
        category: filterCategory,
        serviceCategory: filterServiceCategory,
        site: filterSite,
        status: filterStatus,
        currentStep: filterCurrentStep,
        claimMonth: filterClaimMonth,
        requestor: filterRequestor,
        sla: filterSla,
        source: filterSource,
        assignedTo: filterAssignedTo,
        closedBy: filterClosedBy,
    } = misFilters

    const filteredRows = useMemo(() => {
        const afterMis = applyFilters(periodScopedRows)
        const searched = applySearchFilter(afterMis, search)
        const list = [...searched]
        const dir = sortOrder === 'desc' ? -1 : 1
        list.sort((a, b) => {
            const aVal = a?.[sortKey]
            const bVal = b?.[sortKey]
            if (sortKey === 'amount') {
                return (Number(aVal) - Number(bVal)) * dir
            }
            if (sortKey === 'date') {
                const aTime = new Date(a?.createdAt || aVal || 0).getTime()
                const bTime = new Date(b?.createdAt || bVal || 0).getTime()
                return (aTime - bTime) * dir
            }
            return String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, {
                numeric: true,
                sensitivity: 'base',
            }) * dir
        })
        return list
    }, [
        applyFilters,
        periodScopedRows,
        search,
        filterCategory,
        filterServiceCategory,
        filterSite,
        filterStatus,
        filterCurrentStep,
        filterClaimMonth,
        filterRequestor,
        filterSla,
        filterSource,
        filterAssignedTo,
        filterClosedBy,
        sortKey,
        sortOrder,
    ])

    /** Summary cards follow the selected process (Advance or Reimbursement) in the selected period. */
    const workflowSections = useMemo(
        () => computeWorkflowSectionCards(overviewRows),
        [overviewRows]
    )

    const handleClearFilters = useCallback(() => {
        misFilters.clearFilters()
        setActiveStep('')
    }, [misFilters])

    const chromeFilters = useMemo(
        () => ({ ...misFilters, clearFilters: handleClearFilters, hasActive: misFilters.hasActive || Boolean(activeStep) }),
        [misFilters, handleClearFilters, activeStep]
    )

    useEffect(() => {
        setPage(1)
    }, [requestType, periodResetKey, search, activeStep, filterCategory, filterServiceCategory, filterSite, filterStatus, filterCurrentStep, filterClaimMonth, filterRequestor, filterSla, filterSource, filterAssignedTo, filterClosedBy, sortKey, sortOrder])

    useEffect(() => {
        const fromSdk = resolveCurrentRoleName(client)
        if (fromSdk) setRoleName(fromSdk)
    }, [client, sdkReady, kfFromContext])

    useEffect(() => {
        if (!sdkReady || !client?.app?.getVariable) return
        let cancelled = false
        ;(async () => {
            try {
                const variableRole = await client.app.getVariable('user_role_name')
                const resolved = String(variableRole || '').trim()
                if (!cancelled && resolved) setAppRoleName(resolved)
            } catch {
                // optional
            }
        })()
        return () => {
            cancelled = true
        }
    }, [sdkReady, client, userProfile, roleName])

    useEffect(() => {
        if (!sdkReady || !accountId || !userId || typeof client?.api !== 'function') return
        let cancelled = false
        ;(async () => {
            try {
                const appQuery = appId ? `?_application_id=${encodeURIComponent(appId)}` : ''
                const url = `/user/2/${accountId}/${userId}${appQuery}`
                const resp = await client.api(url, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                })
                const profile = unwrapKfApiResponse(resp)
                const co = String(profile?.Company ?? '').trim()
                const role = resolveRoleNameFromProfile(profile, client)
                if (!cancelled && profile) setUserProfile(profile)
                if (!cancelled && co) setResolvedCompany(co)
                if (!cancelled && role) setRoleName(role)
            } catch (e) {
                console.warn('[solar-expense-dashboard] User profile fetch failed', e)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [sdkReady, accountId, userId, client, appId])

    const loadOverview = useCallback(async () => {
        if (!sdkReady) return
        const activeClient = kfFromContext ?? getClient()
        setCardsLoading(true)
        const apiGet = async (url) =>
            activeClient.api(url, { method: 'GET', headers: { Accept: 'application/json' } })

        try {
            const liveAccountId = activeClient?.account?._id || activeClient?.context?.account?._id || accountId
            const canLiveFetch = !sdkFailed && liveAccountId && typeof activeClient?.api === 'function'
            if (!canLiveFetch) {
                setOverviewAdvanceRows(getPreviewDashboardData('advance').rows)
                setOverviewReimbursementRows(getPreviewDashboardData('reimbursement').rows)
                return
            }
            const fetchType = (type) =>
                fetchDashboardData(
                    liveAccountId,
                    type,
                    apiGet,
                    userEmail,
                    userId,
                    isSiteIncharge && !isHoHead,
                    activeClient,
                    appId,
                    isHoHead
                )
            const [advanceResult, reimbursementResult] = await Promise.allSettled([
                fetchType('advance'),
                fetchType('reimbursement'),
            ])
            setOverviewAdvanceRows(advanceResult.status === 'fulfilled' ? advanceResult.value.rows || [] : [])
            setOverviewReimbursementRows(
                reimbursementResult.status === 'fulfilled' ? reimbursementResult.value.rows || [] : []
            )
        } catch (e) {
            console.error('[solar-expense-dashboard] overview fetch failed', e)
        } finally {
            setCardsLoading(false)
        }
    }, [sdkReady, sdkFailed, kfFromContext, accountId, userEmail, userId, isSiteIncharge, isHoHead, appId])

    const loadDashboard = useCallback(
        async ({ silent = false } = {}) => {
            if (!sdkReady) return

            const seq = ++fetchSeqRef.current
            const activeClient = kfFromContext ?? getClient()
            if (!silent || !hasLoadedOnceRef.current) setLoading(true)
            else setRefreshing(true)
            setDataError('')

            const apiGet = async (url) => {
                try {
                    return await activeClient.api(url, {
                        method: 'GET',
                        headers: { Accept: 'application/json' },
                    })
                } catch (e) {
                    console.error('[solar-expense-dashboard] API failed', url, e)
                    throw e
                }
            }

            const applyPreview = (message = '') => {
                setUsingMocks(true)
                setAdvanceRows(getPreviewDashboardData('advance').rows)
                setReimbursementRows(getPreviewDashboardData('reimbursement').rows)
                setDataError(message)
            }

            try {
                const liveAccountId =
                    activeClient?.account?._id || activeClient?.context?.account?._id || accountId
                const canLiveFetch = !sdkFailed && liveAccountId && typeof activeClient?.api === 'function'

                if (!canLiveFetch) {
                    if (seq === fetchSeqRef.current) applyPreview('')
                    return
                }

                const result = await fetchWorkflowQueue({
                    accountId: liveAccountId,
                    requestType,
                    scope: workflowScope,
                    itemStatus,
                    activityId: activityStepRef.current,
                    apiGet,
                    apiCall: (url, opts) => activeClient.api(url, opts),
                    appId,
                    client: activeClient,
                })
                if (seq !== fetchSeqRef.current) return

                setUsingMocks(false)
                setWorkflowSteps(result.steps || [])
                setItemCounts(result.counts || {})
                if (result.resolvedActivityId) {
                    activityStepRef.current = result.resolvedActivityId
                    setActivityStepId(result.resolvedActivityId)
                }
                const nextRows = result.rows || []
                if (requestType === 'reimbursement') setReimbursementRows(nextRows)
                else setAdvanceRows(nextRows)
                popupContextRef.current[requestType] = {
                    instanceActivityMap: result.instanceActivityMap || {},
                    processId: result.processId || '',
                    appId: result.appId || appId,
                }
                setDataError('')
            } catch (e) {
                if (seq !== fetchSeqRef.current) return
                console.error('Dashboard fetch failed', e)
                if (sdkFailed) {
                    applyPreview('Unable to load live tasks — showing preview data.')
                } else {
                    setUsingMocks(false)
                    setAdvanceRows([])
                    setReimbursementRows([])
                    setDataError('Unable to load my tasks.')
                }
            } finally {
                if (seq === fetchSeqRef.current) {
                    setLoading(false)
                    setRefreshing(false)
                    hasLoadedOnceRef.current = true
                }
            }
        },
        [sdkReady, sdkFailed, kfFromContext, accountId, requestType, workflowScope, itemStatus, appId]
    )

    useEffect(() => {
        void loadOverview()
    }, [loadOverview])

    useEffect(() => {
        void loadDashboard()
    }, [loadDashboard])

    useEffect(() => {
        setSearch('')
        setTableColumns(requestType === 'reimbursement' ? REIMBURSEMENT_TABLE_COLUMNS : ADVANCE_TABLE_COLUMNS)
    }, [requestType])

    const handleRequestTypeChange = (next) => {
        if (next === requestType) return
        activityStepRef.current = ''
        setActivityStepId('')
        setWorkflowSteps([])
        setRequestType(next)
        setPage(1)
        setActiveStep('')
    }

    const handleWorkflowScopeChange = (next) => {
        if (next === workflowScope) return
        activityStepRef.current = ''
        setActivityStepId('')
        setWorkflowSteps([])
        setWorkflowScope(next)
        setPage(1)
        setActiveStep('')
    }

    const handleWorkflowSubTabChange = (id) => {
        setPage(1)
        setActiveStep('')
        if (workflowScope === 'myItems') {
            setItemStatus(id)
            return
        }
        activityStepRef.current = id
        setActivityStepId(id)
        void loadDashboard({ silent: true })
    }

    const workflowSubTabs = useMemo(() => {
        if (workflowScope === 'myItems') {
            return MY_ITEM_STATUSES.map((status) => ({
                id: status.id,
                label: status.label,
                count: itemCounts?.[status.id] ?? 0,
            }))
        }
        return (workflowSteps || []).map((step) => ({
            id: step.id,
            label: step.label,
            count: step.count,
        }))
    }, [workflowScope, itemCounts, workflowSteps])

    const activeWorkflowSubTab = workflowScope === 'myItems' ? itemStatus : activityStepId

    const handleFabAction = (label) => {
        if (!showFabAction) return
        if (usingMocks) {
            console.info('[preview] Create action:', label)
            return
        }
        if (resolvePopupId(label)) {
            openPopup(label)
            return
        }
        client?.client?.showInfo?.(`${label} — coming soon.`)
    }

    const handleRowClick = async (row) => {
        if (usingMocks) {
            console.info('[preview] Open row:', row?.id)
            return
        }
        const label = popupLabelForRequestType(requestType)
        const instanceId = String(row?.instanceId || '').trim()
        if (!instanceId) {
            client?.client?.showInfo?.('Unable to open this record: missing instance id.')
            return
        }

        const popupCtx = popupContextRef.current[requestType] || {}
        const activeClient = kfFromContext ?? getClient()
        const liveAccountId =
            activeClient?.account?._id || activeClient?.context?.account?._id || accountId
        const processId =
            popupCtx.processId ||
            (requestType === 'reimbursement' ? PROCESS_IDS.reimbursement : PROCESS_IDS.advance)

        let activityId = ''
        if (liveAccountId && processId && typeof activeClient?.api === 'function') {
            activityId = await resolveActivityForPopup({
                row,
                instanceActivityMap: popupCtx.instanceActivityMap,
                accountId: liveAccountId,
                processId,
                appId: popupCtx.appId || appId,
                apiGet: (url, opts) => activeClient.api(url, opts),
                client: activeClient,
            })
        } else {
            activityId = String(row?.activityId || '').trim()
        }

        if (!activityId) {
            console.warn('[solar-expense-dashboard] missing activity instance id', {
                instanceId,
                requestType,
                processId,
            })
            client?.client?.showInfo?.('Unable to open this record: missing activity id.')
            return
        }

        const params = buildRecordPopupParams(instanceId, activityId)
        try {
            console.info('[solar-expense-dashboard] open record', {
                label,
                instanceId,
                activityId,
                processId,
            })
            await openPopup(label, params)
        } catch (e) {
            console.error('[solar-expense-dashboard] row popup failed', e)
            client?.client?.showInfo?.('Unable to open this record.')
        }
    }

    const handleSortChange = (key, order) => {
        setSortKey(key)
        setSortOrder(order === 'desc' ? 'desc' : 'asc')
    }

    const tableTitle = requestType === 'reimbursement' ? 'Reimbursement Requests' : 'Advance Requests'
    const scopeLabel = workflowScope === 'myTasks' ? 'My Tasks' : workflowScope === 'participated' ? 'Participated' : 'My Items'
    const subLabel =
        workflowSubTabs.find((tab) => tab.id === activeWorkflowSubTab)?.label ||
        (workflowScope === 'myItems' ? 'Drafts' : '')
    const tableSubtitle = [subLabel, scopeLabel, 'for the selected process'].filter(Boolean).join(' · ')

    return (
        <SolarMisDashboardChrome
            userName={userName}
            companyName={companyDisplayName}
            loadError={dataError}
            cardsLoading={cardsLoading}
            listLoading={loading}
            refreshing={refreshing}
            onRefresh={() => {
                void loadOverview()
                void loadDashboard({ silent: true })
            }}
            showCreate={showFabAction}
            onCreateAction={handleFabAction}
            periodState={periodState}
            onPeriodChange={setPeriodState}
            requestType={requestType}
            onRequestTypeChange={handleRequestTypeChange}
            workflowScope={workflowScope}
            onWorkflowScopeChange={handleWorkflowScopeChange}
            workflowSubTabs={workflowSubTabs}
            activeWorkflowSubTab={activeWorkflowSubTab}
            onWorkflowSubTabChange={handleWorkflowSubTabChange}
            workflowSections={workflowSections}
            tableTitle={tableTitle}
            tableSubtitle={tableSubtitle}
            search={search}
            onSearchChange={setSearch}
            filters={chromeFilters}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            resultCount={filteredRows.length}
            columns={tableColumns}
            rows={filteredRows}
            onRowClick={handleRowClick}
            page={page}
            onPageChange={setPage}
        />
    )
}
