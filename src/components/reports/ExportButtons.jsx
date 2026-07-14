import { FileDown, FileSpreadsheet } from 'lucide-react'
import Button from '@/components/ui/Button'
import { showError } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'
import { downloadFromResponse } from '@/utils/exportHelpers'
import reportService from '@/services/report.service'

export default function ExportButtons({ reportType, startDate, endDate }) {
  const exportFile = async (format) => {
    try {
      const res = await reportService.exportReport({
        type: reportType,
        format,
        startDate,
        endDate,
      })
      downloadFromResponse(res, `${reportType}.${format}`)
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" icon={FileDown} onClick={() => exportFile('pdf')}>PDF</Button>
      <Button variant="outline" icon={FileSpreadsheet} onClick={() => exportFile('xlsx')}>Excel</Button>
    </div>
  )
}
