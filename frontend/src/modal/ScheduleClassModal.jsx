import { useEffect, useRef, useState } from 'react'
import { getTutors } from '../service/account_api.js'

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
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:00`
}

function getTutorOptions(response) {
  const responseTutors = Array.isArray(response)
    ? response
    : response?.results || response?.tutors || response?.accounts || []
  const tutors = Array.isArray(responseTutors) ? responseTutors : []
  const uniqueTutors = new Map()

  for (const tutor of tutors) {
    const id = tutor.account_id || tutor.id || tutor.tutor_id
    if (!id || uniqueTutors.has(id)) continue

    const name = tutor.full_name
      || tutor.name
      || [tutor.first_name, tutor.last_name].filter(Boolean).join(' ')
      || tutor.email
      || id

    uniqueTutors.set(id, { id, name })
  }

  return Array.from(uniqueTutors.values())
}

function ScheduleClassModal({ error, isSubmitting, onClose, onSchedule }) {
  const dialogRef = useRef(null)
  const dateInputRef = useRef(null)
  const tutorInputRef = useRef(null)
  const [tutors, setTutors] = useState([])
  const [tutorsError, setTutorsError] = useState('')
  const [isLoadingTutors, setIsLoadingTutors] = useState(true)
  const [selectedTutor, setSelectedTutor] = useState('')
  const [dateOf, setDateOf] = useState(getInitialDateTime)
  const [duration, setDuration] = useState('60')
  const [comments, setComments] = useState('')
  const minimumDateTime = getLocalDateTime(new Date())

  useEffect(() => {
    let isActive = true
    const dialog = dialogRef.current
    dialog?.showModal()

    getTutors()
      .then((response) => {
        if (!isActive) return
        const tutorOptions = getTutorOptions(response)
        setTutors(tutorOptions)
        if (tutorOptions.length === 0) setTutorsError('No tutors are available to select.')
      })
      .catch((fetchError) => {
        if (isActive) setTutorsError(fetchError.message || 'Could not load tutors.')
      })
      .finally(() => {
        if (isActive) setIsLoadingTutors(false)
      })

    return () => {
      isActive = false
      if (dialog?.open) dialog.close()
    }
  }, [])

  function handleSchedule() {
    if (!tutorInputRef.current?.reportValidity() || !dateInputRef.current?.reportValidity()) return

    onSchedule({
      tutor: selectedTutor,
      date_of: new Date(dateOf).toISOString(),
      duration: formatDuration(Number(duration)),
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
            <label htmlFor="class-tutor" className="mb-2 block text-sm font-semibold">Tutor</label>
            <select
              ref={tutorInputRef}
              id="class-tutor"
              required
              value={selectedTutor}
              onChange={(event) => setSelectedTutor(event.target.value)}
              disabled={isLoadingTutors || tutors.length === 0}
              className="w-full rounded-md border border-[#dadaed] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50 disabled:bg-[#f7f7ff]"
            >
              <option value="">{isLoadingTutors ? 'Loading tutors...' : 'Select a tutor'}</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>{tutor.name}</option>
              ))}
            </select>
            {tutorsError && <p role="alert" className="mt-2 text-sm text-red-700">{tutorsError}</p>}
          </div>

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
            disabled={isSubmitting || isLoadingTutors || tutors.length === 0}
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