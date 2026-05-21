import { Download } from 'lucide-react'
import Button from './Button'

export default function ExportButton({ data, filename = 'export.csv', headers = [] }) {
  const handleExport = () => {
    if (!data || !data.length) return

    // Convert data to CSV string
    const csvRows = []
    
    // Use provided headers or extract keys from first object
    const keys = headers.length > 0 ? headers.map(h => h.key) : Object.keys(data[0])
    const headerLabels = headers.length > 0 ? headers.map(h => h.label) : keys

    // Add header row
    csvRows.push(headerLabels.map(label => `"${label}"`).join(','))

    // Add data rows
    data.forEach(row => {
      const values = keys.map(key => {
        const val = row[key] !== null && row[key] !== undefined ? row[key] : ''
        return `"${String(val).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    })

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button 
      variant="outline" 
      icon={Download} 
      onClick={handleExport}
      disabled={!data || data.length === 0}
    >
      Export CSV
    </Button>
  )
}
