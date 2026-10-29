import { useEffect, useState } from 'react'
import AvailabilityModal from '../components/AvailabilityModal.jsx'
import ScheduleClassModal from '../modal/ScheduleClassModal.jsx'
import { getMe } from '../service/account_api.js'
import { getClasses } from '../service/class_api.js'
import { createSchedule, createAvailability, getAvailability, getBookedSessions } from '../service/schedule_api.js'
import { tokenService } from '../service/token/tokenService.js'
import {
  formatDate,
  formatTime,
  getDateKey,
  getScheduleErrorMessage,
  getStartOfWeek,
  getWeekDays,
  GRID_END_MINUTES,
  GRID_START_MINUTES,
  normalizeAvailability,
  normalizeBookedSessions,
  normalizeClasses,
  parseDurationMinutes,
  SLOT_HEIGHT,
  TIME_SLOTS,
  WEEKDAYS,
} from '../dateFunctionality/dateFunctionality.js'

function LessonsTimetable() {
  const [classes, setClasses] = useState([])
  const [classesError, setClassesError] = useState('')
  const [bookedSessions, setBookedSessions] = useState([])
  const [bookedSessionsError, setBookedSessionsError] = useState('')
  const [currentAccountId, setCurrentAccountId] = useState(null)
  const [accountError, setAccountError] = useState('')
  const [isLoadingAccount, setIsLoadingAccount] = useState(true)
  const [availability, setAvailability] = useState([])
  const [availabilityLoadError, setAvailabilityLoadError] = useState('')
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [confirmation, setConfirmation] = useState('')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [isCreatingAvailability, setIsCreatingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const weekDays = getWeekDays(weekStart)
  const selectedDateKey = getDateKey(selectedDate)

  const user = tokenService.getUser()
  const isTutor = user?.user_type === 'tutor'

  useEffect(() => {
    let isActive = true

    getMe()
      .then((account) => {
        if (isActive) setCurrentAccountId(account.id)
      })
      .catch((error) => {
        if (isActive) setAccountError(getScheduleErrorMessage(error))
      })
      .finally(() => {
        if (isActive) setIsLoadingAccount(false)
      })

    getClasses()
      .then((response) => {
        if (isActive) setClasses(normalizeClasses(response))
      })
      .catch((error) => {
        if (isActive) setClassesError(getScheduleErrorMessage(error))
      })

    getAvailability()
      .then((response) => {
        if (isActive) {
          setAvailability(normalizeAvailability(response))
          setAvailabilityLoadError('')
        }
      })
      .catch((error) => {
        if (isActive) setAvailabilityLoadError(getScheduleErrorMessage(error))
      })

    getBookedSessions()
      .then((response) => {
        if (isActive) {
          setBookedSessions(normalizeBookedSessions(response))
          setBookedSessionsError('')
        }
      })
      .catch((error) => {
        if (isActive) setBookedSessionsError(getScheduleErrorMessage(error))
      })

    return () => {
      isActive = false
    }
  }, [])

  function changeWeek(offset) {
    const nextWeek = new Date(weekStart)
    nextWeek.setDate(nextWeek.getDate() + offset * 7)
    setWeekStart(nextWeek)
    setSelectedDate(nextWeek)
    setConfirmation('')
  }

  function goToThisWeek() {
    const currentDate = new Date()
    setWeekStart(getStartOfWeek(currentDate))
    setSelectedDate(currentDate)
    setConfirmation('')
  }

  function selectDate(date) {
    setSelectedDate(date)
    setConfirmation('')
  }

  async function scheduleClass(data) {
    setScheduleError('')
    setIsScheduling(true)

    try {
      await createSchedule({ ...data, account_id: user?.account_id })
      setIsScheduleModalOpen(false)
      setConfirmation('Class scheduled successfully.')
      try {
        setClasses(normalizeClasses(await getClasses()))
        setClassesError('')
      } catch (error) {
        setClassesError(getScheduleErrorMessage(error))
      }
      try {
        setBookedSessions(normalizeBookedSessions(await getBookedSessions()))
        setBookedSessionsError('')
      } catch (error) {
        setBookedSessionsError(getScheduleErrorMessage(error))
      }
    } catch (error) {
      setScheduleError(getScheduleErrorMessage(error))
    } finally {
      setIsScheduling(false)
    }
  }

  async function saveAvailability({ dates, startTime, duration, scheduleName, isAvailable }) {
    setAvailabilityError('')
    setIsCreatingAvailability(true)

    const failedDates = []

    try {
      for (const date of dates) {
        try {
          await createAvailability({
            schedule_name: scheduleName.trim(),
            activity_type: isAvailable ? 'available' : 'unavailable',
            date_of: new Date(`${date}T${startTime}`).toISOString(),
            duration,
          })
        } catch (error) {
          failedDates.push({ date, message: getScheduleErrorMessage(error) })
        }
      }

      const savedCount = dates.length - failedDates.length
      if (savedCount > 0) {
        const status = isAvailable ? 'available' : 'unavailable'
        setConfirmation(`${savedCount} ${status} date${savedCount === 1 ? '' : 's'} saved.`)
        try {
          setAvailability(normalizeAvailability(await getAvailability()))
          setAvailabilityLoadError('')
        } catch (error) {
          setAvailabilityLoadError(getScheduleErrorMessage(error))
        }
      }
      if (failedDates.length > 0) {
        setAvailabilityError(failedDates.map(({ date, message }) => `${date}: ${message}`).join(' '))
      }
      return failedDates
    } finally {
      setIsCreatingAvailability(false)
    }
  }

  const weekLabel = `${formatDate(weekDays[0], { month: 'long', day: 'numeric' })} – ${formatDate(weekDays[6], { month: 'long', day: 'numeric', year: 'numeric' })}`

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Plan your next class</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-[#292966]">Lessons</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#77779f]">View scheduled classes alongside teacher availability.</p>
        </div>
        {isTutor ? (
          <button
            type="button"
            onClick={() => {
              setAvailabilityError('')
              setIsAvailabilityModalOpen(true)
            }}
            className="rounded-md bg-[#292966] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
          >
            Create availability
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setScheduleError('')
              setIsScheduleModalOpen(true)
            }}
            className="rounded-md bg-[#292966] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
          >
            Schedule class
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-[#e4e4f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4f5] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              aria-label="Previous week"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e4e4f5] text-lg text-[#5c5c99] transition hover:bg-[#f7f7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => changeWeek(1)}
              aria-label="Next week"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e4e4f5] text-lg text-[#5c5c99] transition hover:bg-[#f7f7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
            >
              ›
            </button>
            <h2 className="ml-2 text-base font-semibold text-[#292966] sm:text-lg">{weekLabel}</h2>
          </div>
          <button
            type="button"
            onClick={goToThisWeek}
            className="rounded-md border border-[#dadaed] px-3 py-2 text-sm font-semibold text-[#5c5c99] transition hover:bg-[#eeeeff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
          >
            This week
          </button>
        </div>

        <div className="overflow-x-auto" aria-label="Weekly class timetable">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[68px_repeat(7,minmax(112px,1fr))] border-b border-[#e4e4f5] bg-white">
              <div className="sticky left-0 z-20 flex items-end justify-center border-r border-[#e4e4f5] bg-white pb-3 text-[10px] font-semibold uppercase tracking-wide text-[#a3a3cc]">Time</div>
              {weekDays.map((date, index) => {
                const isSelected = getDateKey(date) === selectedDateKey
                return (
                  <button
                    key={getDateKey(date)}
                    type="button"
                    onClick={() => selectDate(date)}
                    aria-pressed={isSelected}
                    className={`flex min-h-[68px] flex-col items-center justify-center border-r border-[#eeeeF8] text-sm transition last:border-r-0 focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5c5c99] ${isSelected ? 'bg-[#f1f1ff] text-[#292966]' : 'text-[#77779f] hover:bg-[#fafaff]'}`}
                  >
                    <span className="text-xs font-medium uppercase tracking-wide">{WEEKDAYS[index]}</span>
                    <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isSelected ? 'text-[#292966]' : 'text-[#5c5c99]'}`}>
                      {date.getDate()}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-[68px_repeat(7,minmax(112px,1fr))]">
              <div className="sticky left-0 z-10 grid border-r border-[#e4e4f5] bg-white" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_HEIGHT}px)` }}>
                {TIME_SLOTS.map((time, index) => (
                  <div key={time} className="relative border-b border-[#eeeeF8] pr-2 text-right text-[11px] text-[#a3a3cc]">
                    {index % 4 === 0 && <span className="absolute right-2 top-0 -translate-y-1/2 bg-white px-0.5">{formatTime(time)}</span>}
                  </div>
                ))}
              </div>

              {weekDays.map((date) => {
                const dateKey = getDateKey(date)
                const isSelectedDay = dateKey === selectedDateKey
                const dayClasses = classes.filter((classItem) => {
                  const scheduledDate = new Date(classItem.scheduled_date)
                  return !Number.isNaN(scheduledDate.getTime()) && getDateKey(scheduledDate) === dateKey
                })
                const dayBookedSessions = bookedSessions.filter((session) => {
                  const bookedDate = new Date(session.scheduled_date || session.date_of)
                  return !Number.isNaN(bookedDate.getTime())
                    && getDateKey(bookedDate) === dateKey
                })
                const dayAvailability = availability.filter((item) => {
                  if (item.activity_type !== 'available' && item.activity_type !== 'unavailable') return false
                  const date = new Date(item.date_of)
                  return !Number.isNaN(date.getTime()) && getDateKey(date) === dateKey
                })

                return (
                  <div
                    key={dateKey}
                    className={`relative grid border-r border-[#eeeeF8] last:border-r-0 ${isSelectedDay ? 'bg-[#fcfcff]' : 'bg-white'}`}
                    style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_HEIGHT}px)` }}
                    onClick={() => selectDate(date)}
                  >
                    {TIME_SLOTS.map((time, index) => (
                      <div key={time} className="border-b border-[#eeeeF8]" style={{ gridRow: index + 1 }} />
                    ))}

                    {dayAvailability.map((item) => {
                      const availabilityStart = new Date(item.date_of)
                      const startMinutes = availabilityStart.getHours() * 60 + availabilityStart.getMinutes()
                      const durationMinutes = parseDurationMinutes(item.duration)
                      const visibleStart = Math.max(startMinutes, GRID_START_MINUTES)
                      const visibleEnd = Math.min(startMinutes + durationMinutes, GRID_END_MINUTES)
                      if (visibleEnd <= visibleStart) return null

                      const top = ((visibleStart - GRID_START_MINUTES) / 15) * SLOT_HEIGHT
                      const height = ((visibleEnd - visibleStart) / 15) * SLOT_HEIGHT
                      const endTime = new Date(availabilityStart.getTime() + durationMinutes * 60000)
                      const isUnavailable = item.activity_type === 'unavailable'
                      const scheduleName = item.schedule_name || (isUnavailable ? 'Unavailable' : 'Tutor available')
                      const key = item.schedule_id || item.id || item.availability_id || `${item.date_of}-${scheduleName}`

                      return (
                        <div
                          key={key}
                          title={`${scheduleName}: ${formatTime(`${String(availabilityStart.getHours()).padStart(2, '0')}:${String(availabilityStart.getMinutes()).padStart(2, '0')}`)} – ${formatTime(`${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`)}`}
                          className={`pointer-events-none absolute left-1 right-1 z-10 overflow-hidden rounded-md border px-1.5 py-0.5 text-[10px] leading-3 ${isUnavailable ? 'border-[#dca4a4] bg-[#fbefef] text-[#803d3d]' : 'border-[#91a8d8] bg-[#eef2fb] text-[#344a78]'}`}
                          style={{ top, height }}
                        >
                          <span className="block truncate font-bold">{scheduleName}</span>
                          {height >= 30 && (
                            <span className="block truncate">
                              {formatTime(`${String(availabilityStart.getHours()).padStart(2, '0')}:${String(availabilityStart.getMinutes()).padStart(2, '0')}`)} – {formatTime(`${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`)}
                            </span>
                          )}
                        </div>
                      )
                    })}

                    {dayBookedSessions.map((session) => {
                      const bookedStart = new Date(session.scheduled_date || session.date_of)
                      const startMinutes = bookedStart.getHours() * 60 + bookedStart.getMinutes()
                      const durationMinutes = parseDurationMinutes(session.duration)
                      const visibleStart = Math.max(startMinutes, GRID_START_MINUTES)
                      const visibleEnd = Math.min(startMinutes + durationMinutes, GRID_END_MINUTES)
                      if (visibleEnd <= visibleStart) return null

                      const top = ((visibleStart - GRID_START_MINUTES) / 15) * SLOT_HEIGHT
                      const height = ((visibleEnd - visibleStart) / 15) * SLOT_HEIGHT
                      const endTime = new Date(bookedStart.getTime() + durationMinutes * 60000)
                      const sessionKey = session.session_id || session.booking_id || session.id || `${bookedStart.toISOString()}-${session.duration}`
                      const startLabel = `${String(bookedStart.getHours()).padStart(2, '0')}:${String(bookedStart.getMinutes()).padStart(2, '0')}`
                      const endLabel = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`
                      const isOwnBooking = session.student_account_id === currentAccountId
                      const bookingLabel = isOwnBooking ? 'Your booking' : 'Booked'
                      const bookingColor = isLoadingAccount
                        ? 'border-[#dadaed] bg-[#f7f7ff] text-[#5c5c99]'
                        : isOwnBooking
                          ? 'border-[#8bb9a7] bg-[#eef6f3] text-[#245343]'
                          : 'border-[#dca4a4] bg-[#fbefef] text-[#803d3d]'

                      return (
                        <div
                          key={sessionKey}
                          title={`${bookingLabel}: ${formatTime(startLabel)} – ${formatTime(endLabel)}`}
                          aria-label={`${bookingLabel}, ${formatTime(startLabel)} to ${formatTime(endLabel)}`}
                          className={`pointer-events-none absolute left-1 right-1 z-30 overflow-hidden rounded-md border px-1.5 py-0.5 text-[10px] leading-3 ${bookingColor}`}
                          style={{ top, height }}
                        >
                          <span className="block truncate font-bold">{bookingLabel}</span>
                          {height >= 30 && (
                            <span className="block truncate">{formatTime(startLabel)} – {formatTime(endLabel)}</span>
                          )}
                        </div>
                      )
                    })}

                    {dayClasses.map((classItem) => {
                      const classStart = new Date(classItem.scheduled_date)
                      const startMinutes = classStart.getHours() * 60 + classStart.getMinutes()
                      const durationMinutes = parseDurationMinutes(classItem.duration)
                      const visibleStart = Math.max(startMinutes, GRID_START_MINUTES)
                      const visibleEnd = Math.min(startMinutes + durationMinutes, GRID_END_MINUTES)
                      if (visibleEnd <= visibleStart) return null

                      const top = ((visibleStart - GRID_START_MINUTES) / 15) * SLOT_HEIGHT
                      const height = ((visibleEnd - visibleStart) / 15) * SLOT_HEIGHT
                      const endTime = new Date(classStart.getTime() + durationMinutes * 60000)
                      const classKey = classItem.class_id || `${classItem.scheduled_date}-${classItem.class_name}`

                      return (
                        <div
                          key={classKey}
                          title={`${classItem.class_name || 'Scheduled class'}: ${formatTime(`${String(classStart.getHours()).padStart(2, '0')}:${String(classStart.getMinutes()).padStart(2, '0')}`)} – ${formatTime(`${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`)}`}
                          className="pointer-events-none absolute left-1 right-1 z-20 overflow-hidden rounded-md border border-[#8bb9a7] bg-[#eef6f3] px-1.5 py-0.5 text-[10px] leading-3 text-[#245343]"
                          style={{ top, height }}
                        >
                          <span className="block truncate font-bold">{classItem.class_name || 'Scheduled class'}</span>
                          {height >= 30 && (
                            <span className="block truncate">
                              {formatTime(`${String(classStart.getHours()).padStart(2, '0')}:${String(classStart.getMinutes()).padStart(2, '0')}`)} – {formatTime(`${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {confirmation && (
          <div className="border-t border-[#e4e4f5] bg-[#fcfcff] px-4 py-4 sm:px-6" aria-live="polite">
            <p role="status" className="text-sm font-medium text-[#292966]">{confirmation}</p>
          </div>
        )}
      </div>
      {classesError && <p role="alert" className="mt-4 text-sm text-red-700">Could not load scheduled classes: {classesError}</p>}
      {bookedSessionsError && <p role="alert" className="mt-4 text-sm text-red-700">Could not load booked sessions: {bookedSessionsError}</p>}
      {accountError && <p role="alert" className="mt-4 text-sm text-red-700">Could not identify your bookings: {accountError}</p>}
      {availabilityLoadError && <p role="alert" className="mt-4 text-sm text-red-700">Could not load tutor availability: {availabilityLoadError}</p>}
      {isScheduleModalOpen && (
        <ScheduleClassModal
          error={scheduleError}
          isSubmitting={isScheduling}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={scheduleClass}
        />
      )}
      {isAvailabilityModalOpen && (
        <AvailabilityModal
          error={availabilityError}
          isSubmitting={isCreatingAvailability}
          onClose={() => setIsAvailabilityModalOpen(false)}
          onCreate={saveAvailability}
        />
      )}
    </section>
  )
}

export default LessonsTimetable