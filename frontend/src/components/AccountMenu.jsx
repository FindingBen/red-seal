import { useEffect, useRef, useState } from 'react'
import { getMe } from '../service/account_api.js'

function getAccountErrorMessage(error) {
  const responseData = error.response?.data
  return responseData?.detail || responseData?.message || error.message || 'Could not load your account.'
}

function AccountMenu({ onSignOut }) {
  const menuRef = useRef(null)
  const [email, setEmail] = useState('')
  const [accountError, setAccountError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let isActive = true

    getMe()
      .then((user) => {
        if (isActive) setEmail(user.email)
      })
      .catch((error) => {
        if (isActive) setAccountError(getAccountErrorMessage(error))
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const accountLabel = isLoading ? 'Loading account...' : email || 'Account unavailable'

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label={`Account: ${accountLabel}`}
        title={accountLabel}
        className="flex max-w-[230px] items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-[#5c5c99] transition hover:bg-[#f7f7ff] hover:text-[#292966] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20v-1.25a6.5 6.5 0 0 1 13 0V20z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="truncate">{accountLabel}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="account-menu"
          className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-[#e4e4f5] bg-white p-2 shadow-lg"
        >
          {accountError ? (
            <p role="alert" className="px-3 py-2 text-sm text-red-700">{accountError}</p>
          ) : (
            <p className="truncate px-3 py-2 text-sm text-[#77779f]" title={email}>{email || 'Loading account...'}</p>
          )}
          <div className="my-1 border-t border-[#e4e4f5]" />
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-[#5c5c99] transition hover:bg-[#f7f7ff] hover:text-[#292966] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5c5c99]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default AccountMenu
