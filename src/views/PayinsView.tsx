import { useEffect, useState } from 'react'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import FilterCard from '../components/FilterCard'
import Input from '../components/Input'
import SelectDropdown from '../components/SelectDropdown'
import TableCard from '../components/TableCard'
import TableCardHeading from '../components/TableCardHeading'
import TableFooter from '../components/TableFooter'
import { addToast } from '../components/Toast'
import { approveAdminPayin, getAdminPayins } from '../api/client'
import type { AdminPayin } from '../api/client'

export interface PayinsViewProps {
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
]

function fmtDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function statusBadgeClass(status?: string) {
  if (status === 'success') return 'badge badge--success'
  if (status === 'failed') return 'badge badge--danger'
  if (status === 'expired') return 'badge badge--warning'
  return 'badge badge--info'
}

export default function PayinsView({
  page: controlledPage,
  limit: controlledLimit,
  onPageChange,
  onLimitChange,
}: PayinsViewProps = {}) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalLimit, setInternalLimit] = useState(20)

  const page = controlledPage ?? internalPage
  const limit = controlledLimit ?? internalLimit

  const [qInput, setQInput] = useState('')
  const [uidInput, setUidInput] = useState('')
  const [groupIdInput, setGroupIdInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [outTradeNoInput, setOutTradeNoInput] = useState('')
  const [payOrderNoInput, setPayOrderNoInput] = useState('')
  const [upiInput, setUpiInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [createdFromInput, setCreatedFromInput] = useState('')
  const [createdToInput, setCreatedToInput] = useState('')

  const [appliedFilters, setAppliedFilters] = useState({
    q: '',
    uid: '',
    groupId: '',
    status: '',
    outTradeNo: '',
    payOrderNo: '',
    upi: '',
    amount: '',
    createdFrom: '',
    createdTo: '',
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const [payins, setPayins] = useState<AdminPayin[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const [viewPayin, setViewPayin] = useState<AdminPayin | null>(null)
  const [approvePayin, setApprovePayin] = useState<AdminPayin | null>(null)
  const [approveUtr, setApproveUtr] = useState('')
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await getAdminPayins({
          page,
          limit,
          q: appliedFilters.q || undefined,
          uid: appliedFilters.uid || undefined,
          groupId: appliedFilters.groupId || undefined,
          status: appliedFilters.status || undefined,
          outTradeNo: appliedFilters.outTradeNo || undefined,
          payOrderNo: appliedFilters.payOrderNo || undefined,
          upi: appliedFilters.upi || undefined,
          amount: appliedFilters.amount || undefined,
          createdFrom: appliedFilters.createdFrom || undefined,
          createdTo: appliedFilters.createdTo || undefined,
        })
        if (cancelled) return
        setPayins(data.payins ?? [])
        const count = data.total ?? 0
        setTotal(count)
        setTotalPages(Math.max(1, data.totalPages ?? Math.ceil(count / (limit || 20)) ?? 1))
      } catch (e) {
        if (cancelled) return
        const msg = (e as Error)?.message || 'Failed to fetch payins'
        setPayins([])
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
      q: qInput.trim(),
      uid: uidInput.trim(),
      groupId: groupIdInput.trim(),
      status: statusInput,
      outTradeNo: outTradeNoInput.trim(),
      payOrderNo: payOrderNoInput.trim(),
      upi: upiInput.trim(),
      amount: amountInput.trim(),
      createdFrom: createdFromInput,
      createdTo: createdToInput,
    })
  }

  const handleReset = () => {
    setQInput('')
    setUidInput('')
    setGroupIdInput('')
    setStatusInput('')
    setOutTradeNoInput('')
    setPayOrderNoInput('')
    setUpiInput('')
    setAmountInput('')
    setCreatedFromInput('')
    setCreatedToInput('')
    setPage(1)
    setAppliedFilters({
      q: '',
      uid: '',
      groupId: '',
      status: '',
      outTradeNo: '',
      payOrderNo: '',
      upi: '',
      amount: '',
      createdFrom: '',
      createdTo: '',
    })
  }

  const handleApprove = async () => {
    if (!approvePayin) return
    const id = approvePayin.payOrderNo || approvePayin._id
    setApproving(true)
    try {
      const data = await approveAdminPayin(id, approveUtr.trim() || undefined)
      addToast((data.msg as string) || 'Payin approved', 'success')
      setApprovePayin(null)
      setApproveUtr('')
      setRefreshKey((k) => k + 1)
    } catch (e) {
      addToast((e as Error)?.message || 'Failed to approve payin', 'error')
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterCard title="Filters" open collapsible={false}>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex min-w-[220px] flex-1 flex-col gap-1">
            <label className="text-sm text-btn-ghost">Search</label>
            <Input
              placeholder="payOrderNo, outTradeNo, uid, upi, utr, merNo…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex w-[150px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">UID</label>
            <Input value={uidInput} onChange={(e) => setUidInput(e.target.value)} placeholder="UID" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="flex w-[150px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Group ID</label>
            <Input value={groupIdInput} onChange={(e) => setGroupIdInput(e.target.value)} placeholder="Group ID" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="flex w-[160px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Status</label>
            <SelectDropdown value={statusInput} onChange={(v) => setStatusInput(String(v))} options={statusOptions} />
          </div>
          <div className="flex w-[190px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Pay Order No</label>
            <Input value={payOrderNoInput} onChange={(e) => setPayOrderNoInput(e.target.value)} placeholder="PO..." onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="flex w-[190px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Out Trade No</label>
            <Input value={outTradeNoInput} onChange={(e) => setOutTradeNoInput(e.target.value)} placeholder="Out trade no" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="flex w-[180px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">UPI / VPA</label>
            <Input value={upiInput} onChange={(e) => setUpiInput(e.target.value)} placeholder="merchant@bank" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="flex w-[140px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Amount</label>
            <Input value={amountInput} onChange={(e) => setAmountInput(e.target.value)} placeholder="100.00" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="flex w-[170px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Created from</label>
            <Input type="date" value={createdFromInput} onChange={(e) => setCreatedFromInput(e.target.value)} />
          </div>
          <div className="flex w-[170px] flex-col gap-1 max-sm:w-full">
            <label className="text-sm text-btn-ghost">Created to</label>
            <Input type="date" value={createdToInput} onChange={(e) => setCreatedToInput(e.target.value)} />
          </div>
          <div className="flex items-center gap-2.5 pb-[1px]">
            <Button size="sm" onClick={handleSearch}>Search</Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>Reset</Button>
          </div>
        </div>
      </FilterCard>

      <TableCard>
        <TableCardHeading
          title={`Payins (${total})`}
          subtitle={`Page ${page} / ${totalPages || 1}`}
          actions={<Button variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>Refresh</Button>}
        />
        <>
          <DataTable wide>
            <thead>
              <tr>
                <th>Pay Order No</th>
                <th>Out Trade No</th>
                <th>UID / Group</th>
                <th>Amount</th>
                <th>UPI</th>
                <th>Status</th>
                <th>UTR</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payins.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-sm">
                    {loading ? 'Loading payins…' : 'No payins found. Try different filters.'}
                  </td>
                </tr>
              ) : (
                payins.map((p) => (
                  <tr key={p._id}>
                    <td className="mono">{p.payOrderNo || '—'}</td>
                    <td className="mono">{p.outTradeNo || '—'}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="mono">{p.uid || p.group?.uid || '—'}</span>
                        <span className="muted text-[11px]">{p.group?.groupName || (p.groupId != null ? String(p.groupId) : '')}</span>
                      </div>
                    </td>
                    <td className="mono">
                      {p.deeplinkAmount || p.totalAmount || '—'} {p.currencyCode || ''}
                    </td>
                    <td className="mono">{p.upiId || '—'}</td>
                    <td>
                      <span className={statusBadgeClass(p.status)}>{p.status || '—'}</span>
                      {p.payState ? <div className="muted mt-1 text-[11px]">{p.payState}</div> : null}
                    </td>
                    <td className="mono">{p.utrCode || '—'}</td>
                    <td className="muted text-[12px]">{fmtDate(p.createdAt)}</td>
                    <td>
                      <div className="cell-actions flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewPayin(p)}>View</Button>
                        {p.status !== 'success' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setApprovePayin(p)
                              setApproveUtr(p.utrCode || '')
                            }}
                          >
                            Approve
                          </Button>
                        )}
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
            onChange={setPage}
            onSizeChange={(next) => {
              setInternalLimit(next)
              onLimitChange?.(next)
              setPage(1)
            }}
          />
        </>
      </TableCard>

      {viewPayin && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,18,24,0.5)] p-4"
          onClick={(e) => e.target === e.currentTarget && setViewPayin(null)}
        >
          <div className="w-full max-w-[720px] rounded-md border border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-4 py-3.5">
              <h3 className="text-base font-semibold text-ink">Payin Details — {viewPayin.payOrderNo || viewPayin._id}</h3>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-btn-border bg-page text-ink-soft hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand" aria-label="Close" onClick={() => setViewPayin(null)}>×</button>
            </div>
            <div className="grid max-h-[70vh] gap-2 overflow-auto px-4 py-4 text-sm sm:grid-cols-2">
              {[
                ['Pay Order No', viewPayin.payOrderNo],
                ['Out Trade No', viewPayin.outTradeNo],
                ['UID', viewPayin.uid || viewPayin.group?.uid],
                ['Group ID', viewPayin.groupId ?? viewPayin.group?.groupId],
                ['Group Name', viewPayin.group?.groupName],
                ['Amount', `${viewPayin.deeplinkAmount || viewPayin.totalAmount || '—'} ${viewPayin.currencyCode || ''}`],
                ['UPI', viewPayin.upiId],
                ['Status', viewPayin.status],
                ['Pay State', viewPayin.payState],
                ['UTR', viewPayin.utrCode],
                ['Pay URL', viewPayin.payURL],
                ['Mer No', viewPayin.merNo],
                ['Pay Type', viewPayin.payType],
                ['Created', fmtDate(viewPayin.createdAt)],
                ['Updated', fmtDate(viewPayin.updatedAt)],
                ['Paid At', fmtDate(viewPayin.paidAt as string | null | undefined)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex flex-col gap-0.5 rounded border border-card-border bg-page/40 p-2">
                  <span className="text-[12px] text-ink-soft">{label}</span>
                  <span className="mono break-all text-ink">{value != null && value !== '' ? String(value) : '—'}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-card-border px-4 py-3.5">
              <Button variant="ghost" size="sm" onClick={() => setViewPayin(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {approvePayin && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,18,24,0.5)] p-4"
          onClick={(e) => e.target === e.currentTarget && !approving && setApprovePayin(null)}
        >
          <div className="w-full max-w-[420px] rounded-md border border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-4 py-3.5">
              <h3 className="text-base font-semibold text-ink">Approve Payin — {approvePayin.payOrderNo || approvePayin._id}</h3>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-btn-border bg-page text-ink-soft hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand" aria-label="Close" onClick={() => !approving && setApprovePayin(null)} disabled={approving}>×</button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-sm text-ink-soft">Manually approve this payin. Optionally provide a UTR/reference code.</p>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">UTR / Reference (optional)</label>
                <Input placeholder="UTR code" value={approveUtr} onChange={(e) => setApproveUtr(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3.5">
              <Button variant="ghost" size="sm" onClick={() => setApprovePayin(null)} disabled={approving}>Cancel</Button>
              <Button variant="success" size="sm" loading={approving} onClick={handleApprove}>Approve</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
