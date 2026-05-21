export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

export function isPositiveAmount(value) {
  const n = Number(value)
  return !Number.isNaN(n) && n > 0
}

export function passwordStrength(password) {
  const p = String(password || '')
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[Math.min(score, 4)], valid: score >= 4 }
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!isEmail(email)) errors.email = 'Enter a valid email'
  if (!isRequired(password)) errors.password = 'Password is required'
  return errors
}

export function validateRegister({ fullName, email, password, confirmPassword }) {
  const errors = {}
  if (!isRequired(fullName)) errors.fullName = 'Full name is required'
  if (!isEmail(email)) errors.email = 'Enter a valid email'
  const strength = passwordStrength(password)
  if (!strength.valid) errors.password = 'Use 8+ chars with upper, lower, number & symbol'
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export function validateTransaction(form) {
  const errors = {}
  if (!form.transactionType) errors.transactionType = 'Select transaction type'
  if (!isPositiveAmount(form.amount)) errors.amount = 'Enter a valid amount'
  if (!form.debitAccountId) errors.debitAccountId = 'Select debit account'
  if (!form.creditAccountId) errors.creditAccountId = 'Select credit account'
  if (form.debitAccountId === form.creditAccountId) {
    errors.creditAccountId = 'Debit and credit accounts must differ'
  }
  if (!isRequired(form.description)) errors.description = 'Description is required'
  if (!form.transactionDate) errors.transactionDate = 'Date is required'
  return errors
}
