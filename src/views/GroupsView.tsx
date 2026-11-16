import { useEffect, useState } from 'react'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import FilterCard from '../components/FilterCard'
import Input from '../components/Input'
import SelectDropdown from '../components/SelectDropdown'
import TableCard from '../components/TableCard'
import TableCardHeading from '../components/TableCardHeading'
import TableFooter from '../components/TableFooter'
import { getAdminGroups, updateAdminGroup } from '../api/client'
import { addToast } from '../components/Toast'
import type { AdminGroup } from '../api/client'

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

  const [searchInput, setSearchInput] = useState('')
  const [uidInput, setUidInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    uid: '',
    status: '',
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null)
  const [updateStatus, setUpdateStatus] = useState('active')
  const [updateRemark, setUpdateRemark] = useState('')
  const [updateExchangeRate, setUpdateExchangeRate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await getAdminGroups({
          page,
          limit,
          uid: appliedFilters.uid,
          status: appliedFilters.status,
          search: appliedFilters.search,
        })
        if (cancelled) return
        setGroups(data.groups ?? [])
        const count = data.count ?? data.total ?? 0
        setTotal(count)
        setTotalPages(Math.max(1, Math.ceil(count / (limit || 20))))
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
    setAppliedFilters({
      search: searchInput,
      uid: uidInput,
      status: statusInput,
    })
  }

  const handleReset = () => {
    setSearchInput('')
    setUidInput('')
    setStatusInput('')
    setPage(1)
    setAppliedFilters({ search: '', uid: '', status: '' })
  }

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const handleUpdate = async () => {
    if (!selectedGroup) {
      addToast('Please select a group first.', 'error')
      return
    }
    if (updateStatus && updateStatus !== selectedGroup.status && !updateRemark.trim()) {
      addToast('Remark is required when changing status.', 'error')
      return
    }
    const body: Record<string, unknown> = {
      status: updateStatus,
      remark: updateRemark,
      exchangeRate: Number(updateExchangeRate) || undefined,
    }
    setSaving(true)
    try {
      const data = await updateAdminGroup(selectedGroup._id, body)
      addToast((data.msg as string) || 'Group updated', 'success')
      setSelectedGroup(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to update group'
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const selectGroup = (value: string | number) => {
    const group = groups.find((g) => g._id === String(value)) ?? null
    setSelectedGroup(group)
    if (group) {
      setUpdateStatus(group.status || 'active')
      setUpdateRemark(group.remark || '')
      setUpdateExchangeRate(formatDecimal(group.exchangeRate))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterCard
        title="Group filters"
        description="Search by UID, group name or Telegram chat id."
        open
        collapsible={false}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center">
            <label htmlFor="groups-search" className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0">
              Search
            </label>
            <div className="w-[220px] max-sm:w-full">
              <Input
                id="groups-search"
                placeholder="Search by uid, groupName or groupId"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
            </div>
          </div>
          <div className="flex items-center">
            <label htmlFor="groups-uid" className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0">
              UID
            </label>
            <div className="w-[150px] max-sm:w-full">
              <Input
                id="groups-uid"
                placeholder="Please enter UID"
                maxLength={10}
                inputMode="numeric"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value)}
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
                }}
                options={statusOptions}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button size="sm" onClick={handleSearch}>
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
          <DataTable>
            <thead>
              <tr>
                <th>UID</th>
                <th>Group ID</th>
                <th>Group Name</th>
                <th>Status</th>
                <th>Exchange Rate</th>
                <th>Balance</th>
                <th>Remark</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-sm">
                    {loading ? 'Loading groups…' : 'No groups found. Try different filters.'}
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
                    <td className="mono">{formatDecimal(group.exchangeRate)}</td>
                    <td className="mono">{formatDecimal(group.balance)}</td>
                    <td className="muted">{group.remark || '—'}</td>
                    <td>
                      <div className="cell-actions flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectGroup(group._id)}
                        >
                          Update
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

        <div className="mt-5 border-t border-card-border pt-4">
          <h4 className="text-base font-semibold text-ink">Update group</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-btn-ghost">Group</label>
              <SelectDropdown
                value={selectedGroup ? selectedGroup._id : ''}
                onChange={selectGroup}
                options={groups.map((g) => ({
                  value: g._id,
                  label: `${g.uid} · ${g.groupName}`,
                }))}
                placeholder="Select a group"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-btn-ghost">Status</label>
              <SelectDropdown
                value={updateStatus}
                onChange={(v) => setUpdateStatus(String(v))}
                options={statusOptions}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-btn-ghost">Remark</label>
              <Input
                placeholder="Remark"
                value={updateRemark}
                onChange={(e) => setUpdateRemark(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-btn-ghost">Exchange rate</label>
              <Input
                placeholder="Exchange rate"
                inputMode="decimal"
                value={updateExchangeRate}
                onChange={(e) => setUpdateExchangeRate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="success"
              size="sm"
              loading={saving}
              onClick={handleUpdate}
            >
              Update
            </Button>
          </div>
        </div>
      </TableCard>
    </div>
  )
}
