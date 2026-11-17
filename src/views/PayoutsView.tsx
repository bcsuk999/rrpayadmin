import { useState, type FormEvent } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SelectDropdown from '../components/SelectDropdown'
import { addToast } from '../components/Toast'
import {
  ApiError,
  createAdminPayout,
  type CreateAdminPayoutResponse,
} from '../api/client'

interface PayoutForm {
  uid: string
  groupId: string
  amount: string
  currencyCode: string
  bankCode: 'IMPS' | 'UPI'
  bankAcctNo: string
  bankAcctName: string
  bankFirstName: string
  bankLastName: string
  accPhone: string
  accEmail: string
  identityNo: string
  notifyUrl: string
  remark: string
}

const initialForm: PayoutForm = {
  uid: '',
  groupId: '',
  amount: '',
  currencyCode: 'INR',
  bankCode: 'UPI',
  bankAcctNo: '',
  bankAcctName: '',
  bankFirstName: '',
  bankLastName: '',
  accPhone: '',
  accEmail: '',
  identityNo: '',
  notifyUrl: '',
  remark: '',
}

const currencyOptions = [
  'INR',
  'MXN',
  'PKR',
  'VND',
  'IDR',
  'BDT',
  'PHP',
  'BRL',
].map((value) => ({ value, label: value }))

function PayoutResult({ result }: { result: CreateAdminPayoutResponse }) {
  const accepted = result.success !== false && result.state !== 'rejected'
  return (
    <Card
      title={accepted ? 'Payout submitted' : 'Payout rejected'}
      subtitle={
        accepted
          ? 'The gateway accepted the payout request. This does not confirm that funds have reached the recipient.'
          : 'The gateway rejected the payout request. The group balance was not debited.'
      }
      className={accepted ? 'border-success/40' : 'border-danger/40'}
    >
      {result.msg && <p className="mb-3 text-sm text-ink">{result.msg}</p>}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-soft">State</dt>
          <dd className="font-medium">{result.state || 'submitted'}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Result code</dt>
          <dd className="font-medium">{result.resultCode || '—'}</dd>
        </div>
        {result.debited !== undefined && (
          <div>
            <dt className="text-ink-soft">Balance debited</dt>
            <dd className="font-medium">{result.debited ? 'Yes' : 'No'}</dd>
          </div>
        )}
        <div>
          <dt className="text-ink-soft">Payout order number</dt>
          <dd className="break-all font-medium">{result.payoutOrderNo || '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Merchant order number</dt>
          <dd className="break-all font-medium">{result.outTradeNo || '—'}</dd>
        </div>
        {result.remitOrderNo && (
          <div>
            <dt className="text-ink-soft">Remit order number</dt>
            <dd className="break-all font-medium">{result.remitOrderNo}</dd>
          </div>
        )}
        {result.group?.balance !== undefined && (
          <div>
            <dt className="text-ink-soft">Updated group balance</dt>
            <dd className="font-medium">{result.group.balance}</dd>
          </div>
        )}
        {result.resultMsg && (
          <div className="sm:col-span-2">
            <dt className="text-ink-soft">Gateway message</dt>
            <dd className="font-medium">{result.resultMsg}</dd>
          </div>
        )}
      </dl>
      {accepted && (
        <p className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-ink">
          Reconcile the final outcome using the payout callback before issuing any refund.
        </p>
      )}
    </Card>
  )
}

export default function PayoutsView() {
  const [form, setForm] = useState<PayoutForm>(initialForm)
  const [nameMode, setNameMode] = useState<'full' | 'split'>('full')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CreateAdminPayoutResponse | null>(null)

  const updateField = <K extends keyof PayoutForm>(
    field: K,
    value: PayoutForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
    setConfirmed(false)
    setResult(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const uid = form.uid.trim()
    const groupId = form.groupId.trim()
    if (Boolean(uid) === Boolean(groupId)) {
      addToast('Enter exactly one of UID or Group ID.', 'error')
      return
    }
    if (
      !form.bankAcctNo.trim() ||
      !form.accPhone.trim() ||
      !form.accEmail.trim() ||
      !form.identityNo.trim()
    ) {
      addToast('Recipient account, phone, email, and identity number are required.', 'error')
      return
    }
    if (groupId) {
      const parsedGroupId = Number(groupId)
      if (!/^-?\d+$/.test(groupId) || !Number.isSafeInteger(parsedGroupId)) {
        addToast('Group ID must be a valid whole number.', 'error')
        return
      }
    }

    const amount = form.amount.trim()
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isFinite(Number(amount))) {
      addToast('Amount must be positive with up to 2 decimals.', 'error')
      return
    }
    if (Number(amount) <= 0) {
      addToast('Amount must be greater than 0.', 'error')
      return
    }

    const name = nameMode === 'full'
      ? form.bankAcctName.trim()
      : {
          first: form.bankFirstName.trim(),
          last: form.bankLastName.trim(),
        }
    if (
      (typeof name === 'string' && !name) ||
      (typeof name !== 'string' && (!name.first || !name.last))
    ) {
      addToast('Recipient name is required.', 'error')
      return
    }

    if (!confirmed) {
      addToast('Confirm the payout details before submitting.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const body = {
        ...(uid ? { uid } : { groupId: Number(groupId) }),
        amount,
        currencyCode: form.currencyCode,
        bankCode: form.bankCode,
        identityType: form.bankCode,
        bankAcctNo: form.bankAcctNo.trim(),
        ...(typeof name === 'string'
          ? { bankAcctName: name }
          : { bankFirstName: name.first, bankLastName: name.last }),
        accPhone: form.accPhone.trim(),
        accEmail: form.accEmail.trim(),
        identityNo: form.identityNo.trim(),
        ...(form.notifyUrl.trim() ? { notifyUrl: form.notifyUrl.trim() } : {}),
        ...(form.remark.trim() ? { remark: form.remark.trim() } : {}),
      }
      const data = await createAdminPayout(body)
      setResult(data)
      setForm(initialForm)
      setNameMode('full')
      setConfirmed(false)
      addToast(data.msg || 'Payout order submitted', 'success')
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.data?.success === false &&
        typeof error.data.resultCode === 'string'
      ) {
        const rejected: CreateAdminPayoutResponse = {
          success: false,
          msg: typeof error.data.msg === 'string' ? error.data.msg : error.message,
          state: 'rejected',
          debited: false,
          resultCode: error.data.resultCode,
          ...(typeof error.data.resultMsg === 'string'
            ? { resultMsg: error.data.resultMsg }
            : {}),
          ...(typeof error.data.payoutOrderNo === 'string'
            ? { payoutOrderNo: error.data.payoutOrderNo }
            : {}),
          ...(typeof error.data.outTradeNo === 'string'
            ? { outTradeNo: error.data.outTradeNo }
            : {}),
        }
        setResult(rejected)
        addToast(rejected.msg || 'Payout rejected by gateway', 'error')
      } else {
        addToast((error as Error)?.message || 'Failed to submit payout', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {result && <PayoutResult result={result} />}

      <Card
        title="Create RRPAY payout"
        subtitle="Submit a payout to RRPAY. The group balance is debited only when the gateway accepts the request."
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <section>
            <h4 className="mb-3 text-sm font-semibold text-ink">Group and amount</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="UID (use UID or Group ID)"
                value={form.uid}
                onChange={(event) => updateField('uid', event.target.value)}
                placeholder="Group UID"
                disabled={submitting}
              />
              <Input
                label="Group ID (use UID or Group ID)"
                value={form.groupId}
                onChange={(event) => updateField('groupId', event.target.value)}
                placeholder="Telegram group ID"
                inputMode="numeric"
                disabled={submitting}
              />
              <Input
                label="Amount"
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
                placeholder="100.50"
                inputMode="decimal"
                required
                disabled={submitting}
              />
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Currency</label>
                <SelectDropdown
                  value={form.currencyCode}
                  onChange={(value) => updateField('currencyCode', String(value))}
                  options={currencyOptions}
                  disabled={submitting}
                  ariaLabel="Currency"
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold text-ink">Recipient details</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Bank code / identity type</label>
                <SelectDropdown
                  value={form.bankCode}
                  onChange={(value) =>
                    updateField('bankCode', String(value) as PayoutForm['bankCode'])
                  }
                  options={[
                    { value: 'UPI', label: 'UPI' },
                    { value: 'IMPS', label: 'IMPS (bank card)' },
                  ]}
                  disabled={submitting}
                  ariaLabel="Bank code and identity type"
                />
                <p className="text-xs text-ink-soft">
                  Identity type is set to match the selected bank code.
                </p>
              </div>
              <Input
                label="Bank account number / UPI ID"
                value={form.bankAcctNo}
                onChange={(event) => updateField('bankAcctNo', event.target.value)}
                placeholder="Recipient account"
                required
                disabled={submitting}
              />
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-btn-ghost">Recipient name format</label>
                <SelectDropdown
                  value={nameMode}
                  onChange={(value) => {
                    setNameMode(String(value) as 'full' | 'split')
                    setConfirmed(false)
                    setResult(null)
                  }}
                  options={[
                    { value: 'full', label: 'Full name' },
                    { value: 'split', label: 'First and last name' },
                  ]}
                  disabled={submitting}
                  ariaLabel="Recipient name format"
                />
              </div>
              {nameMode === 'full' ? (
                <Input
                  label="Recipient full name"
                  value={form.bankAcctName}
                  onChange={(event) => updateField('bankAcctName', event.target.value)}
                  placeholder="Full name"
                  required
                  disabled={submitting}
                />
              ) : (
                <>
                  <Input
                    label="Recipient first name"
                    value={form.bankFirstName}
                    onChange={(event) => updateField('bankFirstName', event.target.value)}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label="Recipient last name"
                    value={form.bankLastName}
                    onChange={(event) => updateField('bankLastName', event.target.value)}
                    required
                    disabled={submitting}
                  />
                </>
              )}
              <Input
                label="Phone number (include country code)"
                type="tel"
                value={form.accPhone}
                onChange={(event) => updateField('accPhone', event.target.value)}
                placeholder="+919876543210"
                required
                disabled={submitting}
              />
              <Input
                label="Email"
                type="email"
                value={form.accEmail}
                onChange={(event) => updateField('accEmail', event.target.value)}
                placeholder="recipient@example.com"
                required
                disabled={submitting}
              />
              <Input
                label="Identity number (IFSC / UPI account number)"
                value={form.identityNo}
                onChange={(event) => updateField('identityNo', event.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold text-ink">Additional details</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Notify URL (optional)"
                type="url"
                value={form.notifyUrl}
                onChange={(event) => updateField('notifyUrl', event.target.value)}
                placeholder="https://example.com/payout-notify"
                disabled={submitting}
              />
              <Input
                label="Remark (optional)"
                value={form.remark}
                onChange={(event) => updateField('remark', event.target.value)}
                placeholder="Admin note"
                disabled={submitting}
              />
            </div>
          </section>

          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-ink">
            An accepted payout is only submitted to the bank, not confirmed as paid. Use the payout
            callback to reconcile its final state before any refund.
          </div>

          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={submitting}
              className="mt-0.5 accent-brand"
            />
            <span>I have verified the recipient details and payout amount.</span>
          </label>

          <div className="flex justify-end border-t border-card-border pt-4">
            <Button type="submit" loading={submitting} disabled={!confirmed}>
              Submit payout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
