import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClassById, getClassContent, updateClassContent } from '../service/class_api.js'
import { formatTime, getScheduleErrorMessage, parseDurationMinutes } from '../dateFunctionality/dateFunctionality.js'

function getNotesFromResponse(response) {
  const notes = response?.class_content?.notes
  if (notes === undefined || notes === null) return []
  if (!Array.isArray(notes) || !notes.every((note) => typeof note === 'string')) {
    throw new Error('The saved class notes have an unexpected format.')
  }
  return notes
}

function DocumentIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 3.75h8l4 4v12.5H6z" strokeLinejoin="round" />
      <path d="M14 3.75v4h4M9 12h6M9 15.5h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Class() {
  const { classId } = useParams()
  const [classResult, setClassResult] = useState(null)
  const [contentResult, setContentResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveConfirmation, setSaveConfirmation] = useState('')

  useEffect(() => {
    let isActive = true

    getClassById(classId)
      .then((response) => {
        if (isActive) setClassResult({ classId, classItem: response.class || response, error: '' })
      })
      .catch((requestError) => {
        if (isActive) setClassResult({ classId, classItem: null, error: getScheduleErrorMessage(requestError) })
      })

    getClassContent(classId)
      .then((response) => {
        const savedNotes = getNotesFromResponse(response)
        if (isActive) setContentResult({ classId, notes: savedNotes, error: '' })
      })
      .catch((requestError) => {
        if (isActive) setContentResult({ classId, notes: [], error: getScheduleErrorMessage(requestError) })
      })

    return () => {
      isActive = false
    }
  }, [classId])

  const isLoading = classResult?.classId !== classId
  const classItem = classResult?.classId === classId ? classResult.classItem : null
  const error = classResult?.classId === classId ? classResult.error : ''
  const isLoadingContent = contentResult?.classId !== classId
  const notes = contentResult?.classId === classId ? contentResult.notes : []
  const contentError = contentResult?.classId === classId ? contentResult.error : ''

  function addPage() {
    setContentResult((currentResult) => ({
      classId,
      notes: [...(currentResult?.classId === classId ? currentResult.notes : []), ''],
      error: '',
    }))
    setSaveError('')
    setSaveConfirmation('')
  }

  function updatePageContent(index, value) {
    setContentResult((currentResult) => ({
      classId,
      notes: (currentResult?.classId === classId ? currentResult.notes : []).map((note, noteIndex) => (
        noteIndex === index ? value : note
      )),
      error: '',
    }))
    setSaveError('')
    setSaveConfirmation('')
  }

  async function saveNotes(event) {
    event.preventDefault()
    setIsSaving(true)
    setSaveError('')
    setSaveConfirmation('')

    try {
      const response = await updateClassContent(classId, notes)
      setContentResult({ classId, notes: getNotesFromResponse(response), error: '' })
      setSaveConfirmation('Your class notes have been saved.')
    } catch (requestError) {
      setSaveError(getScheduleErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  const scheduledDate = classItem ? new Date(classItem.scheduled_date) : null
  const hasScheduledDate = scheduledDate && !Number.isNaN(scheduledDate.getTime())
  const durationMinutes = classItem ? parseDurationMinutes(classItem.duration) : 0
  const durationLabel = durationMinutes >= 60
    ? `${Math.floor(durationMinutes / 60)} hr${Math.floor(durationMinutes / 60) === 1 ? '' : 's'}${durationMinutes % 60 ? ` ${durationMinutes % 60} min` : ''}`
    : `${durationMinutes} min`

  return (
    <main className="dashboard-shell min-h-screen">
      <header className="border-b border-[#e4e4f5] bg-white">
        <div className="mx-auto flex min-h-18 w-full max-w-6xl items-center px-5 py-3 sm:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5c5c99]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292966] text-lg font-semibold text-white">l</span>
            <span className="text-lg font-semibold tracking-wide text-[#292966]">Lektion ubq</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/dashboard" className="text-sm font-semibold text-[#5c5c99] hover:text-[#292966]">
          ← Back to dashboard
        </Link>
        {isLoading ? (
          <div className="mt-8 rounded-xl border border-[#dadce0] bg-white p-8 text-sm text-[#5f6368] shadow-sm" role="status">
            Loading class details...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-white p-8 text-sm text-red-700 shadow-sm" role="alert">
            Could not load this class: {error}
          </div>
        ) : classItem ? (
          <>
          <article className="mt-8 overflow-hidden rounded-xl border border-[#dadce0] bg-white shadow-sm">
            <div className="border-b border-[#e8eaed] bg-gradient-to-r from-[#f8faff] to-white px-6 py-8 sm:px-10 sm:py-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f0fe] text-[#4285f4]" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.7">
                  <path d="M6 3.75h8l4 4v12.5H6z" strokeLinejoin="round" />
                  <path d="M14 3.75v4h4M9 12h6M9 15.5h6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5c5c99]">Classroom</p>
                {classItem.status && (
                  <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-semibold capitalize text-[#137333]">
                    {classItem.status}
                  </span>
                )}
              </div>
              <h1 className="mt-2 break-words font-sans text-3xl font-semibold tracking-tight text-[#202124] sm:text-4xl">
                {classItem.class_name || 'Scheduled class'}
              </h1>
              <p className="mt-3 text-sm text-[#5f6368]">Class details and schedule</p>
            </div>

            <div className="grid gap-px bg-[#e8eaed] sm:grid-cols-2">
              <div className="bg-white px-6 py-6 sm:px-10">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#80868b]">Date and time</p>
                <p className="mt-2 text-base font-semibold text-[#202124]">
                  {hasScheduledDate
                    ? `${scheduledDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · ${formatTime(`${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`)}`
                    : 'Date to be confirmed'}
                </p>
              </div>
              <div className="bg-white px-6 py-6 sm:px-10">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#80868b]">Duration</p>
                <p className="mt-2 text-base font-semibold text-[#202124]">{durationLabel}</p>
              </div>
            </div>
          </article>

          <section className="mt-10" aria-labelledby="class-notes-heading">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5c5c99]">Class workspace</p>
                <h2 id="class-notes-heading" className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[#202124]">Your pages</h2>
                <p className="mt-1 text-sm text-[#5f6368]">Write and save notes for this class.</p>
              </div>
              <button
                type="button"
                onClick={addPage}
                disabled={isLoadingContent || Boolean(contentError)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#dadce0] bg-white px-4 py-2.5 text-sm font-semibold text-[#3c4043] shadow-sm transition hover:border-[#a8c7fa] hover:bg-[#f8faff] hover:text-[#1a73e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e8f0fe] text-[#4285f4]">
                  <DocumentIcon className="h-4 w-4" />
                </span>
                Add a page
              </button>
            </div>

            {isLoadingContent ? (
              <p className="rounded-xl border border-[#dadce0] bg-white px-5 py-6 text-sm text-[#5f6368]" role="status">Loading your pages...</p>
            ) : contentError ? (
              <p className="rounded-xl border border-red-200 bg-white px-5 py-6 text-sm text-red-700" role="alert">Could not load class pages: {contentError}</p>
            ) : (
              <form onSubmit={saveNotes}>
                {notes.length === 0 ? (
                  <button
                    type="button"
                    onClick={addPage}
                    className="group flex min-h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dadce0] bg-white px-6 py-10 text-center transition hover:border-[#a8c7fa] hover:bg-[#f8faff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4]"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#f1f3f4] text-[#5f6368] transition group-hover:bg-[#e8f0fe] group-hover:text-[#4285f4]">
                      <DocumentIcon className="h-9 w-9" />
                    </span>
                    <span className="mt-4 font-semibold text-[#3c4043]">Create your first page</span>
                    <span className="mt-1 text-sm text-[#80868b]">Start writing notes for this class.</span>
                  </button>
                ) : (
                  <div className="space-y-5">
                    {notes.map((note, index) => (
                      <article key={index} className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-[#dadce0] bg-white shadow-[0_1px_3px_#00000012] transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-3 border-b border-[#e8eaed] px-5 py-3">
                          <span className="text-[#4285f4]"><DocumentIcon className="h-5 w-5" /></span>
                          <h3 className="text-sm font-medium text-[#5f6368]">Page {index + 1}</h3>
                        </div>
                        <textarea
                          aria-label={`Class notes page ${index + 1}`}
                          value={note}
                          onChange={(event) => updatePageContent(index, event.target.value)}
                          placeholder="Start writing..."
                          rows={12}
                          className="block min-h-72 w-full resize-y border-0 bg-white px-8 py-8 font-sans text-base leading-7 text-[#202124] outline-none placeholder:text-[#bdc1c6] focus:ring-2 focus:ring-inset focus:ring-[#a8c7fa] sm:px-12"
                        />
                      </article>
                    ))}
                  </div>
                )}

                {notes.length > 0 && (
                  <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-between gap-3">
                    <div aria-live="polite">
                      {saveConfirmation && <p role="status" className="text-sm text-[#137333]">{saveConfirmation}</p>}
                      {saveError && <p role="alert" className="text-sm text-red-700">Could not save class pages: {saveError}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={isSaving || isLoadingContent}
                      className="rounded-lg bg-[#1a73e8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1765cc] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4] disabled:cursor-wait disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : 'Save pages'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </section>
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-[#dadce0] bg-white p-8 text-sm text-[#5f6368] shadow-sm">
            This class could not be found.
          </div>
        )}
      </section>
    </main>
  )
}

export default Class
