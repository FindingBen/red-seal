import { useEffect, useRef, useState } from 'react'
import { sendInvatation } from '../service/account_api.js'

function InvitationModal({ onClose }) {
  const dialogRef = useRef(null)
  const [invitation, setInvitation] = useState(null)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const registerLink = invitation
    ? `${window.location.origin}/register/${encodeURIComponent(invitation.token)}`
    : ''

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  async function generateInvitation() {
    setError('')
    setCopyMessage('')
    setIsGenerating(true)

    try {
      const response = await sendInvatation()
      if (!response?.token) throw new Error('The invitation response did not include a token.')
      setInvitation(response)
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail
          || requestError.response?.data?.error
          || requestError.response?.data?.message
          || requestError.message
          || 'Could not create an invitation link.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyInvitationLink() {
    setError('')
    setCopyMessage('')
    try {
      await navigator.clipboard.writeText(registerLink)
      setCopyMessage('Registration link copied.')
    } catch (copyError) {
      setError(copyError.message || 'Could not copy the link. You can select and copy it manually.')
    }
  }

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-[#e4e4f5] bg-white p-0 text-[#292966] shadow-xl backdrop:bg-[#292966]/40"
      aria-labelledby="invitation-title"
    >
      <div className="border-b border-[#e4e4f5] px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Grow your classroom</p>
        <h2 id="invitation-title" className="mt-1 font-serif text-2xl font-semibold">Invite a student</h2>
        <p className="mt-2 text-sm leading-6 text-[#77779f]">Create a secure registration link to share with your student.</p>
      </div>

      <div className="space-y-4 px-6 py-6">
        {invitation ? (
          <>
            <div>
              <label htmlFor="invitation-token" className="mb-2 block text-sm font-semibold">Invitation token</label>
              <input
                id="invitation-token"
                readOnly
                value={invitation.token}
                onFocus={(event) => event.target.select()}
                className="w-full rounded-lg border border-[#dadaed] bg-[#fcfcff] px-3 py-2.5 font-mono text-sm text-[#292966] outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
              />
            </div>
            <div>
              <label htmlFor="invitation-link" className="mb-2 block text-sm font-semibold">Registration link</label>
              <input
                id="invitation-link"
                readOnly
                value={registerLink}
                onFocus={(event) => event.target.select()}
                className="w-full rounded-lg border border-[#dadaed] bg-[#fcfcff] px-3 py-2.5 text-sm text-[#292966] outline-none focus:border-[#5c5c99] focus:ring-2 focus:ring-[#ccccff]/50"
              />
            </div>
            {invitation.expires_at && (
              <p className="text-xs text-[#77779f]">Expires {new Date(invitation.expires_at).toLocaleString()}.</p>
            )}
          </>
        ) : (
          <p className="rounded-lg bg-[#f7f7ff] px-4 py-3 text-sm leading-6 text-[#5c5c99]">
            Each invitation creates a unique token. Generate one when you’re ready to share it.
          </p>
        )}

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {copyMessage && <p role="status" className="text-sm font-medium text-[#27734a]">{copyMessage}</p>}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-[#e4e4f5] bg-[#fcfcff] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isGenerating}
          className="rounded-lg border border-[#dadaed] px-4 py-2.5 text-sm font-semibold text-[#5c5c99] transition hover:bg-[#eeeeff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:opacity-60"
        >
          Close
        </button>
        {invitation ? (
          <button
            type="button"
            onClick={copyInvitationLink}
            className="rounded-lg bg-[#292966] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
          >
            Copy registration link
          </button>
        ) : (
          <button
            type="button"
            onClick={generateInvitation}
            disabled={isGenerating}
            className="rounded-lg bg-[#292966] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:cursor-wait disabled:opacity-70"
          >
            {isGenerating ? 'Generating...' : 'Generate invitation'}
          </button>
        )}
      </div>
    </dialog>
  )
}

export default InvitationModal
