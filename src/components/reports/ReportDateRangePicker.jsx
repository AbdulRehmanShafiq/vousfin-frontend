import DatePicker from '@/components/common/DatePicker'
import Button from '@/components/common/Button'

export default function ReportDateRangePicker({ startDate, endDate, onChange, onApply, loading }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-glass bg-navy-2 p-4 sm:flex-row sm:items-end">
      <DatePicker range startDate={startDate} endDate={endDate} onRangeChange={onChange} className="flex-1" />
      <Button onClick={onApply} loading={loading}>Apply</Button>
    </div>
  )
}
