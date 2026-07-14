import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import announcementService from '@/services/announcement.service'
import { cn } from '@/utils/cn'

/**
 * AnnouncementBanner - Displays active announcements as dismissible banners
 */
export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get dismissed announcements from localStorage
  const getDismissedAnnouncements = () => {
    if (typeof window === 'undefined') return []
    const dismissed = localStorage.getItem('dismissedAnnouncements')
    return dismissed ? JSON.parse(dismissed) : []
  }

  // Save dismissed announcement to localStorage
  const dismissAnnouncement = (id) => {
    const dismissed = getDismissedAnnouncements()
    if (!dismissed.includes(id)) {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify([...dismissed, id]))
    }
    setAnnouncement(null)
  }

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true)
      try {
        const res = await announcementService.active()
        const announcements = res.data.data || []

        // Filter out dismissed announcements
        const dismissed = getDismissedAnnouncements()
        const activeAnnouncements = announcements.filter(a => !dismissed.includes(a._id))

        // Get the most recent active announcement
        if (activeAnnouncements.length > 0) {
          // Sort by creation date (newest first) and take the first
          const sorted = [...activeAnnouncements].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
          setAnnouncement(sorted[0])
        } else {
          setAnnouncement(null)
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncement()
  }, [])

  if (loading) return null
  if (!announcement) return null

  // Determine colors based on type
  const getTypeClasses = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'warning':
        return 'bg-highlight/10 text-highlight border-highlight/20'
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="mb-4">
      <div
        className={cn(
          'px-4 py-3 rounded-lg flex items-center gap-3 border-l-4',
          getTypeClasses(announcement.type)
        )}
        role="alert"
      >
        <div className="flex-shrink-0">
          {/* Icon based on type */}
          {announcement.type === 'info' && (
            <span className="h-4 w-4">{/* Info icon */}</span>
          )}
          {announcement.type === 'warning' && (
            <span className="h-4 w-4">{/* Warning icon */}</span>
          )}
          {announcement.type === 'success' && (
            <span className="h-4 w-4">{/* Success icon */}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="mb-1 text-small font-medium">{announcement.title}</p>
          <p className="text-small">{announcement.body}</p>
          {announcement.expiresAt && (
            <p className="mt-1 text-label text-text-muted">
              Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={() => dismissAnnouncement(announcement._id)}
          className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-secondary transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}