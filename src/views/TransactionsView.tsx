import { useEffect, useState } from 'react'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import DatePicker from '../components/DatePicker'
import FilterCard from '../components/FilterCard'
import Input from '../components/Input'
import SelectDropdown from '../components/SelectDropdown'
import TableCard from '../components/TableCard'
import TableCardHeading from '../components/TableCardHeading'
import TableFooter from '../components/TableFooter'
import { addToast } from '../components/Toast'
import { getAdminTransactions } from '../api/client'
import type { AdminTransaction } from '../api/client'
import { formatDateTime } from '../utils/date'

export interface TransactionsViewProps {
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

const typeOptions = [
  { value: '', label: 'All types' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
]

const coTypeOptions = [
  { value: '', label: 'All categories' },
  { value: 'payin', label: 'Payin' },
  { value: 'payout', label: 'Payout' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'other', label: 'Other' },
]

function formatValue(value: unknown): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'object') {
    const decimal = value as { $numberDecimal?: string; toString?: () => string }
    if (typeof decimal.$numberDecimal === 'string') return decimal.$numberDecimal
    if (typeof decimal.toString === 'function') {
      const stringValue = decimal.toString()
      if (stringValue !== '[object Object]') return stringValue
    }
    return '—'
  }
  return String(value)
}

function transactionTypeBadgeClass(type: string): string {
  if (type === 'credit') return 'badge badge--success'
  if (type === 'debit') return 'badge badge--danger'
  return 'badge badge--warning'
}

function transactionCategoryBadgeClass(category: string): string {
  if (category === 'payin') return 'badge badge--success'
  if (category === 'payout' || category === 'adjustment') return 'badge badge--warning'
  if (category === 'bonus') return 'badge badge--info'
  return 'badge badge--danger'
}

export default function TransactionsView({
  page: controlledPage,
  limit: controlledLimit,
  onPageChange,
  onLimitChange,
}: TransactionsViewProps = {}) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalLimit, setInternalLimit] = useState(20)
  const page = controlledPage ?? internalPage
  const limit = controlledLimit ?? internalLimit

  const [uidInput, setUidInput] = useState('')
  const [groupIdInput, setGroupIdInput] = useState('')
  const [transactionNoInput, setTransactionNoInput] = useState('')
  const [typeInput, setTypeInput] = useState('')
  const [coTypeInput, setCoTypeInput] = useState('')
  const [createdFromInput, setCreatedFromInput] = useState('')
  const [createdToInput, setCreatedToInput] = useState('')

  const [appliedFilters, setAppliedFilters] = useState({
    uid: '',
    groupId: '',
    transactionNo: '',
    type: '',
    coType: '',
    createdFrom: '',
    createdTo: '',
  })
  const [lastActiveFilter, setLastActiveFilter] = useState<
    | 'uid'
    | 'groupId'
    | 'transactionNo'
    | 'type'
    | 'coType'
    | 'createdFrom'
    | 'createdTo'
    | ''
  >('')
  const [lastActiveIdentity, setLastActiveIdentity] = useState<'uid' | 'groupId' | ''>('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!appliedFilters.uid && !appliedFilters.groupId) {
      setTransactions([])
      setTotal(0)
      setTotalPages(1)
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await getAdminTransactions({
          page,
          limit,
          uid: appliedFilters.uid || undefined,
          groupId: appliedFilters.groupId || undefined,
          transactionNo: appliedFilters.transactionNo || undefined,
          type: appliedFilters.type || undefined,
          coType: appliedFilters.coType || undefined,
          createdFrom: appliedFilters.createdFrom || undefined,
          createdTo: appliedFilters.createdTo || undefined,
          includeTotal: true,
        })
        if (cancelled) return
        setTransactions(data.transactions ?? [])
        const count = data.total ?? 0
        setTotal(count)
        setTotalPages(Math.max(1, data.totalPages ?? Math.ceil(count / (limit || 20))))
      } catch (error) {
        if (cancelled) return
        setTransactions([])
        setTotal(0)
        setTotalPages(1)
        addToast((error as Error)?.message || 'Failed to fetch transactions', 'error')
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
    const hasUid = Boolean(uidInput.trim())
    const hasGroupId = Boolean(groupIdInput.trim())
    if (!hasUid && !hasGroupId) {
      addToast('Enter a UID or Group ID to search transactions.', 'error')
      return
    }

    setPage(1)
    const identityFilters =
      (lastActiveFilter === 'uid' || lastActiveIdentity === 'uid')
        ? { uid: uidInput.trim(), groupId: '' }
        : (lastActiveFilter === 'groupId' || lastActiveIdentity === 'groupId')
          ? { uid: '', groupId: groupIdInput.trim() }
          : {
              uid: uidInput.trim(),
              groupId: uidInput.trim() ? '' : groupIdInput.trim(),
            }
    const next = {
      ...identityFilters,
      transactionNo:
        lastActiveFilter === 'transactionNo' ? transactionNoInput.trim() : '',
      type: lastActiveFilter === 'type' ? typeInput : '',
      coType: lastActiveFilter === 'coType' ? coTypeInput : '',
      createdFrom: lastActiveFilter === 'createdFrom' ? createdFromInput : '',
      createdTo: lastActiveFilter === 'createdTo' ? createdToInput : '',
    }
    setUidInput(next.uid)
    setGroupIdInput(next.groupId)
    setTransactionNoInput(next.transactionNo)
    setTypeInput(next.type)
    setCoTypeInput(next.coType)
    setCreatedFromInput(next.createdFrom)
    setCreatedToInput(next.createdTo)
    setAppliedFilters(next)
  }

  const handleReset = () => {
    setUidInput('')
    setGroupIdInput('')
    setTransactionNoInput('')
    setTypeInput('')
    setCoTypeInput('')
    setCreatedFromInput('')
    setCreatedToInput('')
    setLastActiveFilter('')
    setLastActiveIdentity('')
    setPage(1)
    setAppliedFilters({
      uid: '',
      groupId: '',
      transactionNo: '',
      type: '',
      coType: '',
      createdFrom: '',
      createdTo: '',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterCard title="Filters" open collapsible={false}>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex w-[150px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">UID</label>
            <Input
              value={uidInput}
              onChange={(event) => {
                setUidInput(event.target.value)
                setLastActiveFilter('uid')
                setLastActiveIdentity('uid')
              }}
              placeholder="UID"
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex w-[150px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Group ID</label>
            <Input
              value={groupIdInput}
              onChange={(event) => {
                setGroupIdInput(event.target.value)
                setLastActiveFilter('groupId')
                setLastActiveIdentity('groupId')
              }}
              placeholder="Group ID"
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex w-[210px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Transaction No</label>
            <Input
              value={transactionNoInput}
              onChange={(event) => {
                setTransactionNoInput(event.target.value)
                setLastActiveFilter('transactionNo')
              }}
              placeholder="TRN..."
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex w-[140px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Type</label>
            <SelectDropdown
              value={typeInput}
              onChange={(value) => {
                setTypeInput(String(value))
                setLastActiveFilter('type')
              }}
              options={typeOptions}
            />
          </div>
          <div className="flex w-[170px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Category</label>
            <SelectDropdown
              value={coTypeInput}
              onChange={(value) => {
                setCoTypeInput(String(value))
                setLastActiveFilter('coType')
              }}
              options={coTypeOptions}
            />
          </div>
          <div className="flex w-[220px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Created from</label>
            <DatePicker
              value={createdFromInput}
              onChange={(value) => {
                setCreatedFromInput(value)
                setLastActiveFilter('createdFrom')
              }}
              placeholder="Created from"
            />
          </div>
          <div className="flex w-[220px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Created to</label>
            <DatePicker
              value={createdToInput}
              onChange={(value) => {
                setCreatedToInput(value)
                setLastActiveFilter('createdTo')
              }}
              placeholder="Created to"
            />
          </div>
          <div className="flex items-center gap-2.5 pb-[1px]">
            <Button size="sm" onClick={handleSearch} loading={loading}>
              Search
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>
        </div>
      </FilterCard>

      <TableCard>
        <TableCardHeading
          title={`Transactions (${total})`}
          subtitle={`Page ${page} / ${totalPages}`}
          actions={
            <Button variant="ghost" size="sm" onClick={() => setRefreshKey((key) => key + 1)}>
              Refresh
            </Button>
          }
        />
        <>
          <DataTable wide loading={loading}>
            <thead>
              <tr>
                <th>UID</th>
                <th>Group ID</th>
                <th>Transaction No</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Remark</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-sm">
                    {appliedFilters.uid || appliedFilters.groupId
                      ? 'No transactions found. Try different filters.'
                      : 'Enter a UID or Group ID to search transactions.'}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr
                    key={
                      transaction.transactionNo ||
                      `${transaction.uid}-${transaction.groupId}-${transaction.createdAt || index}-${index}`
                    }
                  >
                    <td className="mono">{formatValue(transaction.uid)}</td>
                    <td className="mono">{formatValue(transaction.groupId)}</td>
                    <td className="mono">{formatValue(transaction.transactionNo)}</td>
                    <td>
                      <span className={transactionTypeBadgeClass(transaction.type)}>
                        {formatValue(transaction.type)}
                      </span>
                    </td>
                    <td>
                      <span className={transactionCategoryBadgeClass(transaction.coType)}>
                        {formatValue(transaction.coType)}
                      </span>
                    </td>
                    <td className="mono">{formatValue(transaction.amount)}</td>
                    <td className="mono">{formatValue(transaction.balanceAfter)}</td>
                    <td>{formatValue(transaction.remark)}</td>
                    <td className="muted text-[12px]">{formatDateTime(transaction.createdAt)}</td>
                    <td className="muted text-[12px]">{formatDateTime(transaction.updatedAt)}</td>
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
            pageSizes={[10, 20, 50, 100, 200]}
            disabled={loading}
            onChange={setPage}
            onSizeChange={(next) => {
              setInternalLimit(next)
              onLimitChange?.(next)
              setPage(1)
            }}
          />
        </>
      </TableCard>
    </div>
  )
}
