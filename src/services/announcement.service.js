import api from './api'

/** Announcement service */
const announcementService = {
  /** Get active announcements */
  active: () =>
    api.get('/announcements/active'),
}

export default announcementService