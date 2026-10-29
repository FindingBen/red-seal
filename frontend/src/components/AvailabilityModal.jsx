import { useEffect, useRef, useState } from 'react'

function getToday() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

function getDuration(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const remainingMinutes = String(minutes % 60).padStart(2, '0')
  return `${hours}:${remainingMinutes}:00`
}

function AvailabilityModal({ error, isSubmitting, onClose, onCreate }) {
  const dialogRef = useRef(null)
  const [dateInput, setDateInput] = useState(getToday)
  const [dates, setDates] = useState(() => [getToday()])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [isAvailable, setIsAvailable] = useState(false)
  const [scheduleName, setScheduleName] = useState('Appointment')

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function addDate() {
    if (dateInput && !dates.includes(dateInput)) {
      setDates([...dates, dateInput].sort())
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (dates.length === 0 || endTime <= startTime || !scheduleName.trim()) return

    const failedDates = await onCreate({
      dates,
      startTime,
      duration: getDuration(startTime, endTime),
      scheduleName,
      isAvailable,
    })
    setDates(failedDates.map(({ date }) => date))
    if (failedDates.length === 0) onClose()
  }

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-lg border border-[#e4e4f5] bg-white p-0 text-[#292966] shadow-xl backdrop:bg-[#292966]/40"
      aria-labelledby="availability-title"
    >
      <form onSubmit={handleSubmit}>
        <div className="border-b border-[#e4e4f5] px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Tutor schedule</p>
          <h2 id="availability-title" className="mt-1 font-serif text-2xl font-semibold">Create availability</h2>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="availability-date" className="mb-2 block text-sm font-semibold">Dates</label>
            <div className="flex flex-wrap gap-2">
              <input
                id="availability-date"
                type="date"
                min={getToday()}
                required={dates.length === 0}
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
              />
              <button
                type="button"
                onClick={addDate}
                disabled={!dateInput || dates.includes(dateInput)}
                className="rounded-md border border-[#dadaed] px-3 py-2 text-sm font-semibold text-[#5c5c99] transition hover:bg-[#eeeeff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add date
              </button>
            </div>
            {dates.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Selected dates">
                {dates.map((date) => (
                  <li key={date}>
                    <button
                      type="button"
                      onClick={() => setDates(dates.filter((selectedDate) => selectedDate !== date))}
                      aria-label={`Remove ${date}`}
                      className="rounded-full bg-[#eeeeff] px-3 py-1.5 text-xs font-medium text-[#292966] hover:bg-[#dadaed]"
                    >
                      {date} <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-[#77779f]">
              Add each day this time range will be {isAvailable ? 'available' : 'unavailable'}.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="availability-start-time" className="mb-2 block text-sm font-semibold">Start time</label>
              <input
                id="availability-start-time"
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
              />
            </div>
            <div>
              <label htmlFor="availability-end-time" className="mb-2 block text-sm font-semibold">End time</label>
              <input
                id="availability-end-time"
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="availability-name" className="mb-2 block text-sm font-semibold">Schedule name</label>
            <input
              id="availability-name"
              type="text"
              required
              maxLength={150}
              value={scheduleName}
              onChange={(event) => setScheduleName(event.target.value)}
              className="w-full rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
            />
          </div>

          <label className="flex items-start gap-3 rounded-md border border-[#e4e4f5] p-3 text-sm">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(event) => setIsAvailable(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#292966]"
            />
            <span>
              <span className="block font-semibold">Mark this time as available</span>
              <span className="mt-1 block text-xs text-[#77779f]">
                {isAvailable ? 'Tutors can be booked during this time.' : 'This time will be blocked out.'}
              </span>
            </span>
          </label>

          {endTime <= startTime && <p role="alert" className="text-sm text-red-700">End time must be after start time.</p>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e4e4f5] bg-[#fcfcff] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-[#dadaed] px-4 py-2 text-sm font-semibold text-[#5c5c99] transition hover:bg-[#eeeeff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || dates.length === 0 || endTime <= startTime || !scheduleName.trim()}
            className="rounded-md bg-[#292966] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save availability'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AvailabilityModal
