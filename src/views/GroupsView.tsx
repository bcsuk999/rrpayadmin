import { useEffect, useState } from 'react'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import FilterCard from '../components/FilterCard'
import Input from '../components/Input'
import SelectDropdown from '../components/SelectDropdown'
import TableCard from '../components/TableCard'
import TableCardHeading from '../components/TableCardHeading'
import TableFooter from '../components/TableFooter'
import {
  createAdminTransaction,
  getAdminGateways,
  getAdminGroups,
  updateAdminGateway,
  updateAdminGroup,
} from '../api/client'
import { addToast } from '../components/Toast'
import { formatDateTime } from '../utils/date'
import type { AdminGateway, AdminGroup } from '../api/client'

function formatDecimal(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'object') {
    const v = value as { $numberDecimal?: string; toString?: () => string }
    if (typeof v.$numberDecimal === 'string') return v.$numberDecimal
    if (typeof v.toString === 'function') {
      const s = v.toString()
      if (s !== '[object Object]') return s
    }
    return ''
  }
  return String(value)
}

export interface GroupsViewProps {
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
]

export default function GroupsView({
  page: controlledPage,
  limit: controlledLimit,
  onPageChange,
  onLimitChange,
}: GroupsViewProps = {}) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalLimit, setInternalLimit] = useState(20)

  const page = controlledPage ?? internalPage
  const limit = controlledLimit ?? internalLimit

  const [uidInput, setUidInput] = useState('')
  const [groupIdInput, setGroupIdInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    uid: '',
    groupId: '',
    status: '',
  })
  const [lastActiveFilter, setLastActiveFilter] = useState<
    'uid' | 'groupId' | 'status' | ''
  >('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const [statusDialogGroup, setStatusDialogGroup] = useState<AdminGroup | null>(null)
  const [statusValue, setStatusValue] = useState('active')
  const [statusRemark, setStatusRemark] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)

  const [rateDialogGroup, setRateDialogGroup] = useState<AdminGroup | null>(null)
  const [rateValue, setRateValue] = useState('')
  const [rateSaving, setRateSaving] = useState(false)

  const [adjustDialogGroup, setAdjustDialogGroup] = useState<AdminGroup | null>(null)
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustRemark, setAdjustRemark] = useState('')
  const [adjustSaving, setAdjustSaving] = useState(false)

  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false)
  const [gateways, setGateways] = useState<AdminGateway[]>([])
  const [gatewayPayTypes, setGatewayPayTypes] = useState<Record<string, string>>({})
  const [gatewayLoading, setGatewayLoading] = useState(false)
  const [gatewayLoadError, setGatewayLoadError] = useState('')
  const [gatewaySavingId, setGatewaySavingId] = useState<string | null>(null)
  const [gatewaySavingAction, setGatewaySavingAction] = useState<
    'status' | 'payType' | null
  >(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await getAdminGroups({
          page,
          limit,
          uid: appliedFilters.uid,
          groupId: appliedFilters.groupId,
          status: appliedFilters.status,
          includeTotal: true,
        })
        if (cancelled) return
        setGroups(data.groups ?? [])
        const count = data.count ?? 0
        setTotal(count)
        setTotalPages(
          Math.max(1, data.totalPages ?? Math.ceil(count / (limit || 20))),
        )
      } catch (e) {
        if (cancelled) return
        const msg = (e as Error)?.message || 'Failed to fetch groups'
        setGroups([])
        setTotal(0)
        setTotalPages(1)
        addToast(msg, 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [page, limit, appliedFilters, refreshKey])

  const setPage = (next: number) => {
    setInternalPage(next)
    onPageChange?.(next)
  }

  const handleSearch = () => {
    setPage(1)
    const next = {
      uid: lastActiveFilter === 'uid' ? uidInput.trim() : '',
      groupId: lastActiveFilter === 'groupId' ? groupIdInput.trim() : '',
      status: lastActiveFilter === 'status' ? statusInput : '',
    }
    setUidInput(next.uid)
    setGroupIdInput(next.groupId)
    setStatusInput(next.status)
    setAppliedFilters(next)
  }

  const handleReset = () => {
    setUidInput('')
    setGroupIdInput('')
    setStatusInput('')
    setLastActiveFilter('')
    setPage(1)
    setAppliedFilters({ uid: '', groupId: '', status: '' })
  }

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const loadGateways = async () => {
    setGatewayLoading(true)
    setGatewayLoadError('')
    try {
      const data = await getAdminGateways()
      const loadedGateways = data.gateways ?? []
      setGateways(loadedGateways)
      setGatewayPayTypes(
        loadedGateways.reduce<Record<string, string>>((values, gateway) => {
          values[gateway._id] = gateway.payType ?? ''
          return values
        }, {}),
      )
    } catch (error) {
      const message = (error as Error)?.message || 'Failed to fetch gateways'
      setGatewayLoadError(message)
      addToast(message, 'error')
    } finally {
      setGatewayLoading(false)
    }
  }

  const openGatewayDialog = () => {
    setGatewayDialogOpen(true)
    void loadGateways()
  }

  const handleGatewayStatusChange = async (
    gateway: AdminGateway,
    status: AdminGateway['status'],
  ) => {
    setGatewaySavingId(gateway._id)
    setGatewaySavingAction('status')
    try {
      const data = await updateAdminGateway(gateway._id, { status })
      setGateways((current) =>
        current.map((item) => {
          if (item._id === data.gateway._id) return data.gateway
          if (data.gateway.status === 'active') return { ...item, status: 'inactive' }
          return item
        }),
      )
      setGatewayPayTypes((current) => ({
        ...current,
        [data.gateway._id]: data.gateway.payType ?? '',
      }))
      addToast(data.msg || `Gateway ${gateway.name} set to ${status}`, 'success')
    } catch (error) {
      addToast((error as Error)?.message || 'Failed to update gateway status', 'error')
    } finally {
      setGatewaySavingId(null)
      setGatewaySavingAction(null)
    }
  }

  const handleGatewayPayTypeChange = async (gateway: AdminGateway) => {
    const payType = (gatewayPayTypes[gateway._id] ?? '').trim()
    if (!payType) {
      addToast('Pay type is required.', 'error')
      return
    }

    setGatewaySavingId(gateway._id)
    setGatewaySavingAction('payType')
    try {
      const data = await updateAdminGateway(gateway._id, { payType })
      setGateways((current) =>
        current.map((item) => (item._id === data.gateway._id ? data.gateway : item)),
      )
      setGatewayPayTypes((current) => ({
        ...current,
        [data.gateway._id]: data.gateway.payType ?? '',
      }))
      addToast(data.msg || `Gateway ${gateway.name} pay type updated`, 'success')
    } catch (error) {
      addToast((error as Error)?.message || 'Failed to update gateway pay type', 'error')
    } finally {
      setGatewaySavingId(null)
      setGatewaySavingAction(null)
    }
  }

  const openStatusDialog = (group: AdminGroup) => {
    setStatusDialogGroup(group)
    setStatusValue(group.status || 'active')
    setStatusRemark('')
  }

  const closeStatusDialog = () => {
    if (statusSaving) return
    setStatusDialogGroup(null)
  }

  const openRateDialog = (group: AdminGroup) => {
    setRateDialogGroup(group)
    setRateValue(formatDecimal(group.exchangeRate))
  }

  const closeRateDialog = () => {
    if (rateSaving) return
    setRateDialogGroup(null)
  }

  const openAdjustDialog = (group: AdminGroup) => {
    setAdjustDialogGroup(group)
    setAdjustType('credit')
    setAdjustAmount('')
    setAdjustRemark('')
  }

  const closeAdjustDialog = () => {
    if (adjustSaving) return
    setAdjustDialogGroup(null)
  }

  const handleStatusUpdate = async () => {
    if (!statusDialogGroup) return
    if (statusValue && statusValue !== statusDialogGroup.status && !statusRemark.trim()) {
      addToast('Remark is required when changing status.', 'error')
      return
    }
    setStatusSaving(true)
    try {
      const data = await updateAdminGroup(statusDialogGroup._id, {
        status: statusValue,
        remark: statusRemark,
      })
      addToast((data.msg as string) || 'Group status updated', 'success')
      setStatusDialogGroup(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to update group status'
      addToast(msg, 'error')
    } finally {
      setStatusSaving(false)
    }
  }

  const handleRateUpdate = async () => {
    if (!rateDialogGroup) return
    if (rateValue.trim() === '') {
      addToast('Exchange rate is required.', 'error')
      return
    }
    const rate = Number(rateValue)
    if (Number.isNaN(rate)) {
      addToast('Please enter a valid exchange rate.', 'error')
      return
    }
    setRateSaving(true)
    try {
      const data = await updateAdminGroup(rateDialogGroup._id, { exchangeRate: rate })
      addToast((data.msg as string) || 'Exchange rate updated', 'success')
      setRateDialogGroup(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to update exchange rate'
      addToast(msg, 'error')
    } finally {
      setRateSaving(false)
    }
  }

  const handleAdjust = async () => {
    if (!adjustDialogGroup) return
    const amount = adjustAmount.trim()
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      addToast('Enter an amount greater than 0 with up to 2 decimal places.', 'error')
      return
    }

    setAdjustSaving(true)
    try {
      const data = await createAdminTransaction(
        adjustDialogGroup.uid,
        adjustType,
        amount,
        adjustRemark.trim() || undefined,
      )
      addToast(data.msg || `Transaction ${adjustType === 'credit' ? 'credited' : 'debited'}`, 'success')
      setAdjustDialogGroup(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      addToast((error as Error)?.message || 'Failed to adjust group balance', 'error')
    } finally {
      setAdjustSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterCard title="Filters" open collapsible={false}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center">
            <label htmlFor="groups-uid" className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0">
              UID
            </label>
            <div className="w-[150px] max-sm:w-full">
              <Input
                id="groups-uid"
                placeholder="Please enter UID"
                value={uidInput}
                onChange={(e) => {
                  setUidInput(e.target.value)
                  setLastActiveFilter('uid')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
            </div>
          </div>
          <div className="flex items-center">
            <label htmlFor="groups-group-id" className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0">
              Group ID
            </label>
            <div className="w-[150px] max-sm:w-full">
              <Input
                id="groups-group-id"
                placeholder="Please enter Group ID"
                value={groupIdInput}
                onChange={(e) => {
                  setGroupIdInput(e.target.value)
                  setLastActiveFilter('groupId')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
            </div>
          </div>
          <div className="flex items-center">
            <label htmlFor="groups-status" className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0">
              Status
            </label>
            <div className="w-[160px] max-sm:w-full">
              <SelectDropdown
                id="groups-status"
                value={statusInput}
                onChange={(v) => {
                  setStatusInput(String(v))
                  setLastActiveFilter('status')
                }}
                options={statusOptions}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="outline" onClick={openGatewayDialog}>
              Config
            </Button>
            <Button size="sm" onClick={handleSearch} loading={loading}>
              Search
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </FilterCard>

      <TableCard>
        <TableCardHeading
          title={`Groups (${total})`}
          subtitle={`Page ${page} / ${totalPages || 1}`}
          actions={
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          }
        />
        <>
          <DataTable loading={loading}>
            <thead>
              <tr>
                <th>UID</th>
                <th>Group ID</th>
                <th>Group Name</th>
                <th>Status</th>
                <th>Exchange Rate</th>
                <th>Balance</th>
                <th>Remark</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-sm">
                    No groups found. Try different filters.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group._id}>
                    <td className="mono">{group.uid}</td>
                    <td className="mono">{String(group.groupId)}</td>
                    <td>{group.groupName}</td>
                    <td>
                      <span
                        className={[
                          'badge',
                          group.status === 'active'
                            ? 'badge--success'
                            : group.status === 'suspended'
                              ? 'badge--warning'
                              : 'badge--danger',
                        ].join(' ')}
                      >
                        {group.status}
                      </span>
                    </td>
                    <td className="mono">
                      {formatDecimal(group.exchangeRate) ? (
                        <div className="flex items-center justify-center gap-2">
                          <span>{formatDecimal(group.exchangeRate)}</span>
                          <Button variant="ghost" size="sm" onClick={() => openRateDialog(group)}>
                            Edit
                          </Button>
                        </div>
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => openRateDialog(group)}>
                          Set
                        </Button>
                      )}
                    </td>
                    <td className="mono">{formatDecimal(group.balance)}</td>
                    <td className="muted">{group.remark || '—'}</td>
                    <td className="muted text-[12px]">{formatDateTime(group.updatedAt)}</td>
                    <td>
                      <div className="cell-actions flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openAdjustDialog(group)}>
                          Adjust
                        </Button>
                        <Button variant="warning" size="sm" onClick={() => openStatusDialog(group)}>
                          Change Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
          <TableFooter
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={limit}
            pageSizes={[10, 20, 50, 100]}
            disabled={loading}
            onChange={(next) => {
              setPage(next)
            }}
            onSizeChange={(next) => {
              setInternalLimit(next)
              onLimitChange?.(next)
              setPage(1)
            }}
          />
        </>
      </TableCard>

      {gatewayDialogOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,18,24,0.5)] p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !gatewaySavingId) {
              setGatewayDialogOpen(false)
            }
          }}
        >
          <div
            className="w-full max-w-[520px] rounded-md border border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gateway-config-title"
          >
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-4 py-3.5">
              <h3 id="gateway-config-title" className="text-base font-semibold text-ink">
                Gateway Configuration
              </h3>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-btn-border bg-page text-ink-soft hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand"
                aria-label="Close"
                onClick={() => setGatewayDialogOpen(false)}
                disabled={gatewaySavingId !== null}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-sm text-ink-soft">
                Only one gateway can be active at a time. New orders use its configured pay type
                unless the order specifies an override.
              </p>
              {gatewayLoading ? (
                <p className="py-3 text-center text-sm text-ink-soft">Loading gateways…</p>
              ) : gatewayLoadError ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-danger">{gatewayLoadError}</p>
                  <Button size="sm" variant="ghost" onClick={() => void loadGateways()}>
                    Retry
                  </Button>
                </div>
              ) : gateways.length === 0 ? (
                <p className="py-3 text-center text-sm text-ink-soft">No gateways found.</p>
              ) : (
                <div className="flex flex-col divide-y divide-card-border">
                  {gateways.map((gateway) => (
                    <div
                      key={gateway._id}
                      className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{gateway.name}</span>
                          <span
                            className={[
                              'badge',
                              gateway.status === 'active' ? 'badge--success' : 'badge--warning',
                            ].join(' ')}
                          >
                            {gateway.status}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={gateway.status === 'active' ? 'ghost' : 'primary'}
                          loading={
                            gatewaySavingId === gateway._id &&
                            gatewaySavingAction === 'status'
                          }
                          disabled={gatewaySavingId !== null && gatewaySavingId !== gateway._id}
                          onClick={() =>
                            void handleGatewayStatusChange(
                              gateway,
                              gateway.status === 'active' ? 'inactive' : 'active',
                            )
                          }
                        >
                          Set {gateway.status === 'active' ? 'Inactive' : 'Active'}
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-[180px] flex-1">
                          <Input
                            label="Pay type"
                            value={gatewayPayTypes[gateway._id] ?? ''}
                            placeholder="e.g. UPI_INRO"
                            disabled={gatewaySavingId !== null}
                            onChange={(event) =>
                              setGatewayPayTypes((current) => ({
                                ...current,
                                [gateway._id]: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={
                            gatewaySavingId === gateway._id &&
                            gatewaySavingAction === 'payType'
                          }
                          disabled={
                            gatewaySavingId !== null &&
                            gatewaySavingId !== gateway._id ||
                            (gatewayPayTypes[gateway._id] ?? '').trim() === gateway.payType
                          }
                          onClick={() => void handleGatewayPayTypeChange(gateway)}
                        >
                          Save Pay Type
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-card-border px-4 py-3.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGatewayDialogOpen(false)}
                disabled={gatewaySavingId !== null}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {statusDialogGroup && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,18,24,0.5)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeStatusDialog()
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-md border border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-status-title"
          >
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-4 py-3.5">
              <h3 id="group-status-title" className="text-base font-semibold text-ink">
                Change Status — {statusDialogGroup.groupName || statusDialogGroup.uid}
              </h3>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-btn-border bg-page text-ink-soft hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand"
                aria-label="Close"
                onClick={closeStatusDialog}
                disabled={statusSaving}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Status</label>
                <SelectDropdown
                  value={statusValue}
                  onChange={(v) => setStatusValue(String(v))}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'banned', label: 'Banned' },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">
                  Remark {statusValue !== statusDialogGroup.status ? '(required)' : ''}
                </label>
                <Input
                  placeholder="Reason / remark"
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3.5">
              <Button variant="ghost" size="sm" onClick={closeStatusDialog} disabled={statusSaving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={statusSaving} onClick={handleStatusUpdate}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {rateDialogGroup && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,18,24,0.5)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRateDialog()
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-md border border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-rate-title"
          >
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-4 py-3.5">
              <h3 id="group-rate-title" className="text-base font-semibold text-ink">
                {formatDecimal(rateDialogGroup.exchangeRate) ? 'Edit' : 'Set'} Exchange Rate — {rateDialogGroup.groupName || rateDialogGroup.uid}
              </h3>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-btn-border bg-page text-ink-soft hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand"
                aria-label="Close"
                onClick={closeRateDialog}
                disabled={rateSaving}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Exchange rate</label>
                <Input
                  placeholder="Exchange rate"
                  inputMode="decimal"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3.5">
              <Button variant="ghost" size="sm" onClick={closeRateDialog} disabled={rateSaving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={rateSaving} onClick={handleRateUpdate}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {adjustDialogGroup && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,18,24,0.5)] p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAdjustDialog()
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-md border border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-adjust-title"
          >
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-4 py-3.5">
              <h3 id="group-adjust-title" className="text-base font-semibold text-ink">
                Adjust Balance — {adjustDialogGroup.groupName || adjustDialogGroup.uid}
              </h3>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-btn-border bg-page text-ink-soft hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand"
                aria-label="Close"
                onClick={closeAdjustDialog}
                disabled={adjustSaving}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-sm text-ink-soft">
                UID: <span className="mono">{adjustDialogGroup.uid}</span>
                {' · '}Current balance: <span className="mono">{formatDecimal(adjustDialogGroup.balance) || '0'}</span>
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Transaction type</label>
                <SelectDropdown
                  value={adjustType}
                  onChange={(value) => setAdjustType(String(value) as 'credit' | 'debit')}
                  options={[
                    { value: 'credit', label: 'Credit' },
                    { value: 'debit', label: 'Debit' },
                  ]}
                  disabled={adjustSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Amount</label>
                <Input
                  placeholder="Amount"
                  inputMode="decimal"
                  value={adjustAmount}
                  onChange={(event) => setAdjustAmount(event.target.value)}
                  disabled={adjustSaving}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleAdjust()
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Remark (optional)</label>
                <Input
                  placeholder="Remark"
                  value={adjustRemark}
                  onChange={(event) => setAdjustRemark(event.target.value)}
                  disabled={adjustSaving}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleAdjust()
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3.5">
              <Button variant="ghost" size="sm" onClick={closeAdjustDialog} disabled={adjustSaving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={adjustSaving} onClick={handleAdjust}>
                Adjust
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
