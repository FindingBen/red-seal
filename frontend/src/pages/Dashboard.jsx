import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getMe, getStudents, getWallet } from '../service/account_api.js'
import { getBookedClasses, getClasses } from '../service/class_api.js'
import AccountMenu from '../components/AccountMenu.jsx'
import PaymentResultModal from '../components/PaymentResultModal.jsx'
import { tokenService } from '../service/token/tokenService.js'
import { formatTime, getScheduleErrorMessage, normalizeClasses, parseDurationMinutes } from '../dateFunctionality/dateFunctionality.js'
import Lessons from './LessonsTimetable.jsx'

const CLASSES_PER_PAGE = 5

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

function normalizeStudents(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.students)) return response.students
  if (Array.isArray(response?.accounts)) return response.accounts
  return []
}

function getStudentName(student, index) {
  return student.full_name
    || student.name
    || [student.first_name, student.last_name].filter(Boolean).join(' ')
    || student.email
    || `Student ${index + 1}`
}

function getStudentInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function getPaginationPages(totalPages, currentPage) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  if (currentPage <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages]
  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activePage, setActivePage] = useState('dashboard')
  const [classes, setClasses] = useState([])
  const [currentClassesPage, setCurrentClassesPage] = useState(1)
  const [classesError, setClassesError] = useState('')
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [students, setStudents] = useState([])
  const [studentsError, setStudentsError] = useState('')
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [isTutor, setIsTutor] = useState(false)
  const [availableClasses, setAvailableClasses] = useState(null)
  const [walletError, setWalletError] = useState('')
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)

  useEffect(() => {
    let isActive = true

    async function loadDashboardClasses() {
      let account

      try {
        account = await getMe()
      } catch (error) {
        if (isActive) setClassesError(getScheduleErrorMessage(error))
        if (isActive) {
          setIsLoadingClasses(false)
          setIsLoadingStudents(false)
        }
        return
      }

      const isCurrentUserTutor = account.user_type === 'tutor'
      if (isActive) setIsTutor(isCurrentUserTutor)

      const loadClasses = (isCurrentUserTutor ? getBookedClasses() : getClasses())
        .then((response) => {
          if (!isActive) return
          const userClasses = normalizeClasses(response)
          setClasses(isCurrentUserTutor
            ? userClasses
            : userClasses.filter((classItem) => classItem.student === account.id))
        })
        .catch((error) => {
          if (isActive) setClassesError(getScheduleErrorMessage(error))
        })
        .finally(() => {
          if (isActive) setIsLoadingClasses(false)
        })

      const loadStudents = isCurrentUserTutor
        ? getStudents()
          .then((response) => {
            if (isActive) setStudents(normalizeStudents(response))
          })
          .catch((error) => {
            if (isActive) setStudentsError(getScheduleErrorMessage(error))
          })
          .finally(() => {
            if (isActive) setIsLoadingStudents(false)
          })
        : Promise.resolve().then(() => {
          if (isActive) setIsLoadingStudents(false)
        })

      await Promise.all([loadClasses, loadStudents])
    }

    loadDashboardClasses()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadWallet() {
      try {
        const wallet = await getWallet()
        if (wallet?.available === undefined || wallet.available === null || wallet.available === '') {
          throw new Error('The wallet response is missing the available balance.')
        }

        const available = Number(wallet?.available)
        if (!Number.isFinite(available) || available < 0) {
          throw new Error('The wallet response has an invalid available balance.')
        }

        if (isActive) setAvailableClasses(available)
      } catch (error) {
        if (isActive) {
          setWalletError(
            error.response?.data?.detail
              || error.response?.data?.message
              || error.message
              || 'Could not load your class balance.',
          )
        }
      } finally {
        if (isActive) setIsLoadingWallet(false)
      }
    }

    loadWallet()
    return () => {
      isActive = false
    }
  }, [])

  const handleLogout = () => {
    tokenService.clear()
    navigate('/login')
  }

  const closePaymentResult = () => {
    navigate(location.pathname, { replace: true, state: null })
  }

  const totalClassPages = Math.ceil(classes.length / CLASSES_PER_PAGE)
  const activeClassesPage = Math.min(currentClassesPage, Math.max(totalClassPages, 1))
  const visibleClasses = classes.slice(
    (activeClassesPage - 1) * CLASSES_PER_PAGE,
    activeClassesPage * CLASSES_PER_PAGE,
  )

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
              <div className="flex items-center gap-1">
                <Link
                  to="/payment"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-[#77779f] transition hover:bg-[#f7f7ff] hover:text-[#292966] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
                >
                  Buy classes
                </Link>
                <span
                  title={walletError || (availableClasses === null ? undefined : `${availableClasses} classes available for booking`)}
                  aria-label={walletError
                    ? `Class balance unavailable: ${walletError}`
                    : isLoadingWallet
                      ? 'Loading available class balance'
                      : `${availableClasses} classes available for booking`}
                  role={walletError ? 'alert' : undefined}
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                    walletError
                      ? 'bg-red-50 text-red-700'
                      : 'bg-[#eeeeff] text-[#292966]'
                  }`}
                >
                  {isLoadingWallet
                    ? 'Loading…'
                    : walletError
                      ? 'Balance unavailable'
                      : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(availableClasses)} ${availableClasses === 1 ? 'class' : 'classes'}`}
                </span>
              </div>
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
          <div className={`mt-12 grid items-start gap-6 ${isTutor ? 'lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)]' : 'lg:grid-cols-1'}`}>
            <section aria-labelledby="student-classes-heading">
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
                <>
                  <ul className="space-y-3">
                    {visibleClasses.map((classItem) => (
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
                  {totalClassPages > 1 && (
                    <nav className="mt-5 flex flex-wrap items-center justify-between gap-3" aria-label="Booked classes pagination">
                      <p className="text-sm text-[#77779f]">
                        Showing {(activeClassesPage - 1) * CLASSES_PER_PAGE + 1}–{Math.min(activeClassesPage * CLASSES_PER_PAGE, classes.length)} of {classes.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentClassesPage(activeClassesPage - 1)}
                          disabled={activeClassesPage === 1}
                          className="rounded-md border border-[#dadaed] px-3 py-2 text-sm font-medium text-[#5c5c99] transition hover:bg-[#eeeeff] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>
                        {getPaginationPages(totalClassPages, activeClassesPage).map((page, index) => (
                          page === 'ellipsis' ? (
                            <span key={`ellipsis-${index}`} className="px-1 text-sm text-[#77779f]" aria-hidden="true">…</span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentClassesPage(page)}
                              aria-label={`Page ${page}`}
                              aria-current={page === activeClassesPage ? 'page' : undefined}
                              className={`h-9 min-w-9 rounded-md px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] ${page === activeClassesPage ? 'bg-[#292966] text-white' : 'text-[#5c5c99] hover:bg-[#eeeeff]'}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentClassesPage(activeClassesPage + 1)}
                          disabled={activeClassesPage === totalClassPages}
                          className="rounded-md border border-[#dadaed] px-3 py-2 text-sm font-medium text-[#5c5c99] transition hover:bg-[#eeeeff] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </nav>
                  )}
                </>
              )}
            </section>
            {isTutor && (
              <section aria-labelledby="students-heading">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5c5c99]">Student List</p>
                    <h2 id="students-heading" className="mt-1 font-serif text-2xl font-semibold text-[#292966]">Students</h2>
                  </div>
                  {!isLoadingStudents && !studentsError && (
                    <span className="text-sm text-[#77779f]">{students.length} {students.length === 1 ? 'student' : 'students'}</span>
                  )}
                </div>
                {isLoadingStudents ? (
                  <p className="rounded-lg border border-[#e4e4f5] bg-white px-5 py-6 text-sm text-[#77779f]">Loading students...</p>
                ) : studentsError ? (
                  <p role="alert" className="rounded-lg border border-red-200 bg-white px-5 py-6 text-sm text-red-700">Could not load students: {studentsError}</p>
                ) : students.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#dadaed] bg-white px-5 py-8 text-center">
                    <p className="font-semibold text-[#292966]">No students yet</p>
                    <p className="mt-1 text-sm text-[#77779f]">Students who book classes with you will appear here.</p>
                  </div>
                ) : (
                  <ul className="max-h-[28rem] space-y-3 overflow-y-auto">
                    {students.map((student, index) => {
                      const name = getStudentName(student, index)
                      const initials = getStudentInitials(name)
                      const avatarColors = [
                        'bg-[#e8f0fe] text-[#3159a8]',
                        'bg-[#f3e8ff] text-[#7139a5]',
                        'bg-[#e6f4ea] text-[#27734a]',
                        'bg-[#fff1e0] text-[#a65b16]',
                      ]
                      const key = student.account_id || student.id || student.student_id || student.email || `${name}-${index}`

                      return (
                        <li key={key}>
                          <div className="flex min-w-0 items-center gap-4 rounded-xl border border-[#dadce0] bg-white px-4 py-4 shadow-sm sm:px-5">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColors[index % avatarColors.length]}`} aria-hidden="true">
                              {initials}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-[#202124]">{name}</span>
                              {student.email && name !== student.email && (
                                <span className="mt-1 block truncate text-sm text-[#5f6368]">{student.email}</span>
                              )}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )}
          </div>
          <div className="mt-8 border-t border-[#e4e4f5] pt-6 text-sm text-[#a3a3cc]">Your classroom is ready for what comes next.</div>
        </section>
      )}
      {location.state?.paymentResult && (
        <PaymentResultModal
          result={{ type: location.state.paymentResult }}
          onClose={closePaymentResult}
        />
      )}
    </main>
  )
}

export default Dashboard