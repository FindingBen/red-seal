import { useEffect, useRef, useState } from 'react'

function getLocalDateTime(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function getInitialDateTime() {
  const date = new Date()
  date.setMinutes(Math.ceil((date.getMinutes() + 1) / 15) * 15, 0, 0)
  return getLocalDateTime(date)
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `PT${hours ? `${hours}H` : ''}${remainingMinutes ? `${remainingMinutes}M` : ''}`
}

function ScheduleClassModal({ error, isSubmitting, onClose, onSchedule }) {
  const dialogRef = useRef(null)
  const dateInputRef = useRef(null)
  const [dateOf, setDateOf] = useState(getInitialDateTime)
  const [duration, setDuration] = useState('60')
  const [comments, setComments] = useState('')
  const minimumDateTime = getLocalDateTime(new Date())

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function handleSchedule() {
    if (!dateInputRef.current?.reportValidity()) return

    onSchedule({
      date_of: new Date(dateOf).toISOString(),
      duration: formatDuration(Number(duration)),
      status: 'scheduled',
      comments: comments.trim(),
    })
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
      aria-labelledby="schedule-class-title"
    >
      <div>
        <div className="border-b border-[#e4e4f5] px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">New lesson</p>
          <h2 id="schedule-class-title" className="mt-1 font-serif text-2xl font-semibold">Schedule a class</h2>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="class-date" className="mb-2 block text-sm font-semibold">Date and time</label>
            <input
              ref={dateInputRef}
              id="class-date"
              type="datetime-local"
              required
              min={minimumDateTime}
              value={dateOf}
              onChange={(event) => setDateOf(event.target.value)}
              className="w-full rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
            />
          </div>

          <div>
            <label htmlFor="class-duration" className="mb-2 block text-sm font-semibold">Duration</label>
            <select
              id="class-duration"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="w-full rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
            >
              {Array.from({ length: 8 }, (_, index) => (index + 1) * 15).map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes === 60 ? '' : 's'}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="class-comments" className="mb-2 block text-sm font-semibold">Comments <span className="font-normal text-[#77779f]">(optional)</span></label>
            <textarea
              id="class-comments"
              maxLength={500}
              rows={3}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Bring course materials"
              className="w-full resize-y rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a3a3cc] focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
            />
          </div>

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
            type="button"
            onClick={handleSchedule}
            disabled={isSubmitting}
            className="rounded-md bg-[#292966] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule class'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ScheduleClassModal