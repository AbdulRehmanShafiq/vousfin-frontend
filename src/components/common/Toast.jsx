import toast from 'react-hot-toast'

export function showSuccess(message) {
  toast.success(message, { className: 'text-sm' })
}

export function showError(message) {
  toast.error(message, { className: 'text-sm' })
}

export function showWarning(message) {
  toast(message, { icon: '??', className: 'text-sm' })
}

export function showInfo(message) {
  toast(message, { icon: '??', className: 'text-sm' })
}
