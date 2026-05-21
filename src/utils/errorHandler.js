export function getErrorMessage(error) {
  if (!error) return 'Something went wrong'
  const data = error.response?.data
  if (data?.errors && typeof data.errors === 'string') {
    return data.message === 'Validation failed'
      ? data.errors
      : `${data.message}: ${data.errors}`
  }
  if (Array.isArray(data?.details) && data.details.length > 0) {
    return data.details.map((d) => d.message).join('. ')
  }
  if (data?.message) return data.message
  if (error.message) return error.message
  return 'Something went wrong'
}

export function isAuthError(error) {
  return error?.response?.status === 401
}

export function isLockoutError(error) {
  const msg = getErrorMessage(error).toLowerCase()
  return msg.includes('locked') || msg.includes('too many') || error?.response?.status === 429
}
