export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function downloadFromResponse(response, fallbackName = 'export') {
  const disposition = response.headers['content-disposition']
  let filename = fallbackName
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/)
    if (match?.[1]) filename = match[1]
  }
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  })
  downloadBlob(blob, filename)
}
