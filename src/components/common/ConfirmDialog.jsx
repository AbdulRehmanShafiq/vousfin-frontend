import Modal from './Modal'
import Button from './Button'

const PRESETS = {
  delete: {
    title: 'Delete confirmation',
    message: 'This action cannot be undone. Are you sure you want to delete?',
    confirmLabel: 'Delete',
    variant: 'danger',
  },
  suspend: {
    title: 'Suspend customer',
    message: 'The customer will lose access until reinstated.',
    confirmLabel: 'Suspend',
    variant: 'danger',
  },
  reverse: {
    title: 'Reverse transaction',
    message: 'A reversing journal entry will be created. Continue?',
    confirmLabel: 'Reverse',
    variant: 'danger',
  },
  logout: {
    title: 'Log out',
    message: 'Are you sure you want to log out of vousFin?',
    confirmLabel: 'Log out',
    variant: 'primary',
  },
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  type = 'delete',
  title,
  message,
  loading,
}) {
  const preset = PRESETS[type] || PRESETS.delete

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || preset.title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={preset.variant} loading={loading} onClick={onConfirm}>
            {preset.confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">{message || preset.message}</p>
    </Modal>
  )
}
