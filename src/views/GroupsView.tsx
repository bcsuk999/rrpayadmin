import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import FilterCard from '../components/FilterCard'
import Input from '../components/Input'
import SelectDropdown from '../components/SelectDropdown'
import TableCard from '../components/TableCard'
import TableCardHeading from '../components/TableCardHeading'
import TableFooter from '../components/TableFooter'
import { getAdminGroups, updateAdminGroup } from '../api/client'
import { useToast } from '../components/Toast'
import type { AdminGroup } from '../api/client'

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
  const toast = useToast()
  const [internalPage, setInternalPage] = useState(1)
  const [internalLimit, setInternalLimit] = useState(20)

  const page = controlledPage ?? internalPage
  const limit = controlledLimit ?? internalLimit

  const [search, setSearch] = useState('')
  const [uid, setUid] = useState('')
  const [status, setStatus] = useState('')
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null)
  const [updateStatus, setUpdateStatus] = useState('active')
  const [updateRemark, setUpdateRemark] = useState('')
  const [updateExchangeRate, setUpdateExchangeRate] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminGroups({ page, limit, uid, status, search })
      setGroups(data.groups ?? [])
      const count = data.count ?? data.total ?? 0
      setTotal(count)
      setTotalPages(Math.max(1, Math.ceil(count / (limit || 20))))
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to fetch groups'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [page, limit, uid, status, search, toast])

  useEffect(() => {
    void fetchGroups()
  }, [fetchGroups])

  const handleSearch = () => {
    setInternalPage(1)
    void fetchGroups()
  }

  const handleReset = () => {
    setSearch('')
    setUid('')
    setStatus('')
    setInternalPage(1)
    void fetchGroups()
  }

  const handleUpdate = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group first.')
      return
    }
    if (updateStatus && updateStatus !== selectedGroup.status && !updateRemark.trim()) {
      toast.error('Remark is required when changing status.')
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
      toast.success((data.msg as string) || 'Group updated')
      setSelectedGroup(null)
      void fetchGroups()
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to update group'
      toast.error(msg)
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
      setUpdateExchangeRate(group.exchangeRate ? String(group.exchangeRate) : '')
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                value={uid}
                onChange={(e) => setUid(e.target.value)}
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
                value={status}
                onChange={(v) => {
                  const next = String(v)
                  setStatus(next)
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
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Refresh
            </Button>
          }
        />
        {error ? (
          <p className="empty" role="alert">
            {error}
          </p>
        ) : (
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
                      <td className="mono">{String(group.exchangeRate)}</td>
                      <td className="mono">{group.balance}</td>
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
                setInternalPage(next)
                onPageChange?.(next)
              }}
              onSizeChange={(next) => {
                setInternalLimit(next)
                onLimitChange?.(next)
              }}
            />
          </>
        )}

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
