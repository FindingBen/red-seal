import { useEffect, useRef } from 'react'

function PaymentResultModal({ result, onClose }) {
  const dialogRef = useRef(null)
  const isSuccess = result.type === 'success'

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()

    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#45436a] bg-[#22213f] p-0 text-white shadow-2xl backdrop:bg-[#10101f]/75"
      aria-labelledby="payment-result-title"
      aria-describedby="payment-result-description"
    >
      <div className="p-7 text-center sm:p-9">
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${isSuccess ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`} aria-hidden="true">
          {isSuccess ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2">
              <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2">
              <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#aaa8d0]">Payment update</p>
        <h2 id="payment-result-title" className="mt-2 font-serif text-3xl font-semibold">
          {isSuccess ? 'You’re all set!' : 'Payment not completed'}
        </h2>
        <p id="payment-result-description" className="mt-3 text-sm leading-6 text-[#c5c3df]">
          {isSuccess
            ? 'Thanks for your purchase. Your classes will be ready in your account shortly.'
            : result.message || 'Checkout was cancelled or could not be completed. You have not been charged.'}
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-7 w-full rounded-lg bg-[#7774bd] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8986d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {result.actionLabel || 'Back to dashboard'}
        </button>
      </div>
    </dialog>
  )
}

export default PaymentResultModal
