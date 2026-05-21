import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/modals/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccounts'

const accountSchema = z.object({
  accountName: z.string().min(2, 'Account name must be at least 2 characters'),
  accountType: z.string().min(1, 'Account type is required'),
  normalBalance: z.string().min(1, 'Normal balance is required'),
})

const ACCOUNT_TYPES = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' },
]

const NORMAL_BALANCES = [
  { value: 'Debit', label: 'Debit' },
  { value: 'Credit', label: 'Credit' },
]

export default function AccountFormModal({ isOpen, onClose, initialData = null }) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountName: '',
      accountType: '',
      normalBalance: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          accountName: initialData.accountName,
          accountType: initialData.accountType,
          normalBalance: initialData.normalBalance,
        })
      } else {
        reset({
          accountName: '',
          accountType: '',
          normalBalance: '',
        })
      }
    }
  }, [isOpen, initialData, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateAccount.mutateAsync({ id: initialData._id, data })
      } else {
        await createAccount.mutateAsync(data)
      }
      onClose()
    } catch {
      // toast is handled in the hook
    }
  }

  const accountTypeVal = watch('accountType')
  const normalBalanceVal = watch('normalBalance')

  // Auto-suggest normal balance based on account type
  useEffect(() => {
    if (!isEditing && accountTypeVal) {
      if (['Asset', 'Expense'].includes(accountTypeVal)) {
        setValue('normalBalance', 'Debit')
      } else if (['Liability', 'Equity', 'Revenue'].includes(accountTypeVal)) {
        setValue('normalBalance', 'Credit')
      }
    }
  }, [accountTypeVal, isEditing, setValue])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Account' : 'Add New Account'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
        <Input
          label="Account Name"
          placeholder="e.g. Office Supplies"
          error={errors.accountName?.message}
          {...register('accountName')}
        />

        <Select
          label="Account Type"
          options={ACCOUNT_TYPES}
          value={accountTypeVal}
          onChange={(val) => setValue('accountType', val)}
          error={errors.accountType?.message}
          placeholder="Select an account type"
        />

        <Select
          label="Normal Balance"
          options={NORMAL_BALANCES}
          value={normalBalanceVal}
          onChange={(val) => setValue('normalBalance', val)}
          error={errors.normalBalance?.message}
        />

        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-glass">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || createAccount.isPending || updateAccount.isPending}>
            {isEditing ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
