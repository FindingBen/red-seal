import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function PaymentReturnPage({ result }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentResult = result || (searchParams.get('success') === 'true' ? 'success' : 'cancel')

  useEffect(() => {
    navigate('/dashboard', {
      replace: true,
      state: { paymentResult },
    })
  }, [navigate, paymentResult])

  return (
    <main className="payment-shell flex min-h-screen items-center justify-center text-white">
      <p role="status" className="flex items-center gap-3 text-sm text-[#c5c3df]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
        Returning to your dashboard...
      </p>
    </main>
  )
}

export default PaymentReturnPage
