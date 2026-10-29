export const TIME_SLOTS = Array.from({ length: 56 }, (_, index) => {
  const hour = 8 + Math.floor(index / 4)
  const minute = String((index % 4) * 15).padStart(2, '0')
  return `${String(hour).padStart(2, '0')}:${minute}`
})
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const SLOT_HEIGHT = 18
export const GRID_START_MINUTES = 8 * 60
export const GRID_END_MINUTES = 22 * 60

export function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getStartOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return monday
}

export function getWeekDays(weekStart) {
  return WEEKDAYS.map((_, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return date
  })
}

export function parseDurationMinutes(duration) {
  if (typeof duration !== 'string') return 60

  const isoDuration = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/)
  if (isoDuration) {
    return Number(isoDuration[1] || 0) * 1440
      + Number(isoDuration[2] || 0) * 60
      + Number(isoDuration[3] || 0)
      + Number(isoDuration[4] || 0) / 60
  }

  const djangoDuration = duration.match(/^(?:(\d+)\s+days?,?\s*)?(\d+):(\d{2}):(\d{2})(?:\.\d+)?$/)
  if (djangoDuration) {
    return Number(djangoDuration[1] || 0) * 1440
      + Number(djangoDuration[2]) * 60
      + Number(djangoDuration[3])
      + Number(djangoDuration[4]) / 60
  }

  return 60
}

export function normalizeClasses(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.classes)) return response.classes
  return []
}

export function normalizeBookedSessions(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.booked)) return response.booked
  if (Array.isArray(response?.booked_sessions)) return response.booked_sessions
  if (Array.isArray(response?.sessions)) return response.sessions
  return []
}

export function normalizeAvailability(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.availability)) return response.availability
  if (Array.isArray(response?.schedules)) return response.schedules
  return []
}

export function formatTime(time) {
  const [hour, minute] = time.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDate(date, options) {
  return date.toLocaleDateString(undefined, options)
}

export function getScheduleErrorMessage(error) {
  const responseData = error.response?.data
  let message = responseData?.detail || responseData?.message

  if (!message && typeof responseData === 'string') {
    message = responseData
  } else if (!message && responseData && typeof responseData === 'object') {
    message = Object.entries(responseData)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join(' ')
  }

  const status = error.response?.status
  return `${status ? `${status}: ` : ''}${message || error.message || 'Could not save this schedule.'}`
}