import { useState } from 'react'
import Lessons from './LessonsTimetable.jsx'

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')

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
                className={`rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] ${activePage === 'lessons' ? 'bg-[#eeeeff] text-[#292966]' : 'text-[#77779f] hover:bg-[#f7f7ff] hover:text-[#292966]'}`}
              >
                Lessons
              </button>
            </nav>
            <span className="hidden h-7 w-px bg-[#e4e4f5] sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md px-2 py-2 text-sm font-semibold text-[#5c5c99] transition hover:text-[#292966] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
            >
              Sign out
            </button>
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
          <div className="mt-12 border-t border-[#e4e4f5] pt-6 text-sm text-[#a3a3cc]">Your classroom is ready for what comes next.</div>
        </section>
      )}
    </main>
  )
}

export default Dashboard