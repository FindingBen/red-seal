import { useState } from 'react'

const STORAGE_KEY = 'lessonly-booked-lessons'
const AVAILABLE_TIMES = ['09:00', '10:30', '13:00', '14:30']
const TIME_SLOTS = Array.from({ length: 20 }, (_, index) => {
  const hour = 8 + Math.floor(index / 2)
  const minute = index % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
})
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOT_HEIGHT = 36

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStartOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return monday
}

function getWeekDays(weekStart) {
  return WEEKDAYS.map((_, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return date
  })
}

function getInitialBookings() {
  try {
    const savedBookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(savedBookings) ? savedBookings : []
  } catch {
    return []
  }
}

function getSlotIndex(time) {
  const [hour, minute] = time.split(':').map(Number)
  return (hour - 8) * 2 + minute / 30
}

function formatTime(time) {
  const [hour, minute] = time.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(date, options) {
  return date.toLocaleDateString(undefined, options)
}

function isInPast(date, time, now) {
  const [hour, minute] = time.split(':').map(Number)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute) <= now
}

function LessonsTimetable() {
  const [bookings, setBookings] = useState(getInitialBookings)
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekDays = getWeekDays(weekStart)
  const selectedDateKey = getDateKey(selectedDate)

  function changeWeek(offset) {
    const nextWeek = new Date(weekStart)
    nextWeek.setDate(nextWeek.getDate() + offset * 7)
    setWeekStart(nextWeek)
    setSelectedDate(nextWeek)
    setSelectedTime('')
    setConfirmation('')
  }

  function goToThisWeek() {
    const currentDate = new Date()
    setWeekStart(getStartOfWeek(currentDate))
    setSelectedDate(currentDate)
    setSelectedTime('')
    setConfirmation('')
  }

  function selectDate(date) {
    setSelectedDate(date)
    setSelectedTime('')
    setConfirmation('')
  }

  function selectTime(date, time) {
    setSelectedDate(date)
    setSelectedTime(time)
    setConfirmation('')
  }

  function bookLesson() {
    if (!selectedTime) return

    const booking = {
      id: `${selectedDateKey}-${selectedTime}`,
      date: selectedDateKey,
      time: selectedTime,
    }
    const nextBookings = [...bookings, booking]
    setBookings(nextBookings)
    setSelectedTime('')
    setConfirmation(`Class booked for ${formatDate(selectedDate, { month: 'long', day: 'numeric' })} at ${formatTime(booking.time)}.`)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings))
    } catch {
      setConfirmation('Class booked for this session, but could not be saved on this device.')
    }
  }

  const weekLabel = `${formatDate(weekDays[0], { month: 'long', day: 'numeric' })} – ${formatDate(weekDays[6], { month: 'long', day: 'numeric', year: 'numeric' })}`

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Plan your next class</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-[#292966]">Lessons</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#77779f]">Choose an open time to book a one-hour class with your teacher.</p>
        </div>
        <span className="rounded-md border border-[#dadaed] bg-white px-3 py-2 text-xs font-semibold text-[#5c5c99]">Sample teacher availability</span>
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
                const isToday = getDateKey(date) === getDateKey(today)
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
                    <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-[#292966] text-white' : isSelected ? 'text-[#292966]' : 'text-[#5c5c99]'}`}>
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
                    {index % 2 === 0 && <span className="absolute right-2 top-0 -translate-y-1/2 bg-white px-0.5">{formatTime(time)}</span>}
                  </div>
                ))}
              </div>

              {weekDays.map((date) => {
                const dateKey = getDateKey(date)
                const isWeekday = date.getDay() !== 0 && date.getDay() !== 6
                const isSelectedDay = dateKey === selectedDateKey
                const dayBookings = bookings.filter((booking) => booking.date === dateKey)

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

                    {isWeekday && AVAILABLE_TIMES.map((time) => {
                      const booking = dayBookings.find((item) => item.time === time)
                      const isPast = isInPast(date, time, now)
                      const isSelectedSlot = isSelectedDay && selectedTime === time
                      const row = getSlotIndex(time) + 1

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            if (!booking && !isPast) selectTime(date, time)
                          }}
                          disabled={Boolean(booking) || isPast}
                          aria-label={`${formatTime(time)}, ${booking ? 'class booked' : isPast ? 'time unavailable' : 'available for one hour'}`}
                          aria-pressed={isSelectedSlot}
                          className={`z-10 m-1 flex min-h-0 flex-col items-start justify-center overflow-hidden rounded-md border px-2 text-left text-[11px] leading-4 transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5c5c99] ${booking ? 'cursor-not-allowed border-[#dadaed] bg-[#eeeeff] text-[#5c5c99]' : isPast ? 'cursor-not-allowed border-transparent bg-[#f7f7fb] text-[#c9c9dc]' : isSelectedSlot ? 'border-[#292966] bg-[#292966] text-white shadow-sm' : 'border-[#dadaed] bg-[#f7f7ff] text-[#5c5c99] hover:border-[#5c5c99] hover:bg-[#eeeeff]'}`}
                          style={{ gridRow: `${row} / span 2` }}
                        >
                          <span className="font-bold">{booking ? 'Class booked' : isPast ? 'Unavailable' : 'Available'}</span>
                          <span>{formatTime(time)} – {formatTime(TIME_SLOTS[getSlotIndex(time) + 2])}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e4e4f5] bg-[#fcfcff] px-4 py-4 sm:px-6">
          <div className="min-h-10" aria-live="polite">
            {confirmation ? (
              <p role="status" className="text-sm font-medium text-[#292966]">{confirmation}</p>
            ) : selectedTime ? (
              <p className="text-sm text-[#5c5c99]">
                Selected: <span className="font-semibold text-[#292966]">{formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })} at {formatTime(selectedTime)}</span>
              </p>
            ) : (
              <p className="text-sm text-[#a3a3cc]">Select an available one-hour time to book a class.</p>
            )}
          </div>
          <button
            type="button"
            onClick={bookLesson}
            disabled={!selectedTime}
            className="rounded-md bg-[#292966] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:cursor-not-allowed disabled:bg-[#dadaed]"
          >
            Book class
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#a3a3cc]">Availability shown is sample data. Bookings are saved on this device until connected to your scheduling API.</p>
    </section>
  )
}

export default LessonsTimetable