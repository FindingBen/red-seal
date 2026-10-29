import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe } from '../service/account_api.js'
import { getBookedClasses, getClasses } from '../service/class_api.js'
import AccountMenu from '../components/AccountMenu.jsx'
import { tokenService } from '../service/token/tokenService.js'
import { formatTime, getScheduleErrorMessage, normalizeClasses, parseDurationMinutes } from '../dateFunctionality/dateFunctionality.js'
import Lessons from './LessonsTimetable.jsx'

function formatClassDate(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed'

  return `${date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${formatTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`)}`
}

function formatClassDuration(duration) {
  const minutes = parseDurationMinutes(duration)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const parts = []

  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? '' : 's'}`)
  if (remainingMinutes > 0) parts.push(`${remainingMinutes} min`)
  return parts.join(' ') || 'Duration not set'
}

function Dashboard() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('dashboard')
  const [classes, setClasses] = useState([])
  const [classesError, setClassesError] = useState('')
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isTutor, setIsTutor] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadDashboardClasses() {
      try {
        const account = await getMe()
        const isCurrentUserTutor = account.user_type === 'tutor'
        const classesResponse = isCurrentUserTutor
          ? await getBookedClasses()
          : await getClasses()

        if (isActive) {
          setIsTutor(isCurrentUserTutor)
          const userClasses = normalizeClasses(classesResponse)
          setClasses(isCurrentUserTutor
            ? userClasses
            : userClasses.filter((classItem) => classItem.student === account.id))
        }
      } catch (error) {
        if (isActive) setClassesError(getScheduleErrorMessage(error))
      } finally {
        if (isActive) setIsLoadingClasses(false)
      }
    }

    loadDashboardClasses()
    return () => {
      isActive = false
    }
  }, [])

  const handleLogout = () => {
    tokenService.clear()
    navigate('/login')
  }

  return (
    <main className="dashboard-shell min-h-screen">
      <header className="border-b border-[#e4e4f5] bg-white">
        <div className="mx-auto flex min-h-18 w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            className="inline-flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5c5c99]"
            aria-label="Lessonly dashboard"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292966] text-lg font-semibold text-white">l</span>
            <span className="text-lg font-semibold tracking-wide text-[#292966]">lessonly</span>
          </button>
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="flex items-center gap-1" aria-label="Main navigation">
              <button
                type="button"
                onClick={() => setActivePage('dashboard')}
                aria-current={activePage === 'dashboard' ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] ${activePage === 'dashboard' ? 'bg-[#eeeeff] text-[#292966]' : 'text-[#77779f] hover:bg-[#f7f7ff] hover:text-[#292966]'}`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActivePage('lessons')}
                aria-current={activePage === 'lessons' ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm cursor-pointer font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] ${activePage === 'lessons' ? 'bg-[#eeeeff] text-[#292966]' : 'text-[#77779f] hover:bg-[#f7f7ff] hover:text-[#292966]'}`}
              >
                Lessons
              </button>
            </nav>
            <span className="hidden h-7 w-px bg-[#e4e4f5] sm:block" aria-hidden="true" />
            <AccountMenu onSignOut={handleLogout} />
          </div>
        </div>
      </header>

      {activePage === 'lessons' ? (
        <Lessons />
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Your learning space</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-[#292966] sm:text-5xl">Welcome to your dashboard</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#77779f]">You’re signed in. Your courses, upcoming lessons, and learning progress will live here.</p>
          <section className="mt-12" aria-labelledby="student-classes-heading">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5c5c99]">{isTutor ? 'Teaching schedule' : 'Your schedule'}</p>
                <h2 id="student-classes-heading" className="mt-1 font-serif text-2xl font-semibold text-[#292966]">{isTutor ? 'Booked classes' : 'Your classes'}</h2>
              </div>
              <span className="text-sm text-[#77779f]">{classes.length} {classes.length === 1 ? 'class' : 'classes'}</span>
            </div>

            {isLoadingClasses ? (
              <p className="rounded-lg border border-[#e4e4f5] bg-white px-5 py-6 text-sm text-[#77779f]">Loading your classes...</p>
            ) : classesError ? (
              <p role="alert" className="rounded-lg border border-red-200 bg-white px-5 py-6 text-sm text-red-700">Could not load your classes: {classesError}</p>
            ) : classes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#dadaed] bg-white px-5 py-8 text-center">
                <p className="font-semibold text-[#292966]">{isTutor ? 'No classes booked yet' : 'No classes scheduled yet'}</p>
                <p className="mt-1 text-sm text-[#77779f]">{isTutor ? 'Classes booked with you will appear here.' : 'When a class is booked for you, it will appear here.'}</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {classes.map((classItem) => (
                  <li key={classItem.class_id}>
                    <Link
                      to={`/class/${encodeURIComponent(classItem.class_id)}`}
                      className="group flex items-center gap-4 rounded-xl border border-[#dadce0] bg-white px-4 py-4 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-[#a8c7fa] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4] sm:px-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f0fe] text-[#4285f4] transition-colors group-hover:bg-[#d2e3fc]" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.7">
                          <path d="M6 3.75h8l4 4v12.5H6z" strokeLinejoin="round" />
                          <path d="M14 3.75v4h4M9 12h6M9 15.5h6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-[#202124]">{classItem.class_name || 'Scheduled class'}</h3>
                        <p className="mt-1 text-sm text-[#5f6368]">{formatClassDate(classItem.scheduled_date)}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#f1f3f4] px-3 py-1 text-xs font-medium text-[#5f6368]">
                        {formatClassDuration(classItem.duration)}
                      </span>
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-[#9aa0a6] transition-transform group-hover:translate-x-1 group-hover:text-[#4285f4]">
                        <path fillRule="evenodd" d="M7.22 4.22a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L11.69 10 7.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="mt-8 border-t border-[#e4e4f5] pt-6 text-sm text-[#a3a3cc]">Your classroom is ready for what comes next.</div>
        </section>
      )}
    </main>
  )
}

export default Dashboard