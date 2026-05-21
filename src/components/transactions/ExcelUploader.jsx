import { useState } from 'react'
import FileUpload from '@/components/common/FileUpload'
import Button from '@/components/common/Button'
import { showError, showSuccess } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'
import transactionService from '@/services/transaction.service'

export default function ExcelUploader({ onSuccess }) {
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleFile = async (file) => {
    if (!file) { setPreview(null); return }
    setLoading(true)
    try {
      const { data } = await transactionService.importExcel(file, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setPreview(data.data)
      showSuccess(`Parsed ${data.data.validCount} valid rows`)
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const confirmImport = async () => {
    if (!preview?.validRows?.length) return
    setLoading(true)
    try {
      const { data } = await transactionService.confirmExcel(preview.validRows)
      showSuccess(data.message)
      setPreview(null)
      onSuccess?.()
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <FileUpload onFileSelect={handleFile} progress={progress} loading={loading} />
      {preview && (
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">
            Valid: {preview.validCount} ? Errors: {preview.invalidCount}
          </p>
          {preview.errors?.length > 0 && (
            <ul className="mt-2 max-h-32 overflow-auto text-xs text-red-600">
              {preview.errors.slice(0, 10).map((e, i) => (
                <li key={i}>Row {e.row}: {e.message}</li>
              ))}
            </ul>
          )}
          <Button className="mt-4" loading={loading} onClick={confirmImport} disabled={!preview.validCount}>
            Import {preview.validCount} transactions
          </Button>
        </div>
      )}
    </div>
  )
}
