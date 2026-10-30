import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PaymentResultModal from '../components/PaymentResultModal.jsx'
import { createCheckoutSession, getPackages } from '../service/payment_api.js'

function formatPrice(price, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(price))
}

function PaymentPage() {
  const [packages, setPackages] = useState([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [packagesError, setPackagesError] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [checkoutError, setCheckoutError] = useState('')

  const loadPackages = useCallback(async () => {
    setIsLoadingPackages(true)
    setPackagesError('')

    try {
      const response = await getPackages()
      const packageList = Array.isArray(response)
        ? response
        : response?.results || response?.packages

      if (!Array.isArray(packageList)) {
        throw new Error('The packages response has an unexpected format.')
      }

      setPackages(packageList.filter((packageItem) => packageItem.is_active !== false))
    } catch (error) {
      setPackagesError(
        error.response?.data?.detail
          || error.response?.data?.message
          || error.message
          || 'Could not load class packages. Please try again.',
      )
    } finally {
      setIsLoadingPackages(false)
    }
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  async function handlePackageSelect(packageId) {
    setSelectedPackageId(packageId)
    setCheckoutError('')

    try {
      const checkout = await createCheckoutSession(packageId)
      if (!checkout?.url) {
        throw new Error('Checkout could not be started. Please try again.')
      }

      window.location.assign(checkout.url)
    } catch (error) {
      setCheckoutError(
        error.response?.data?.detail
          || error.response?.data?.message
          || error.message
          || 'Checkout could not be started. Please try again.',
      )
      setSelectedPackageId('')
    }
  }

  function closeErrorModal() {
    setCheckoutError('')
  }

  return (
    <main className="payment-shell min-h-screen text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-18 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#aaa8ff]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7774bd] text-lg font-semibold text-white">l</span>
            <span className="text-lg font-semibold tracking-wide">lessonly</span>
          </Link>
          <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-semibold text-[#c5c3df] transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aaa8ff]">
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#aaa8d0]">Keep your momentum</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Choose your class package</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#c5c3df]">
            Pick the package that works for you. You’ll complete your secure payment with Stripe.
          </p>
        </div>

        {isLoadingPackages ? (
          <div className="mx-auto mt-12 flex max-w-5xl items-center justify-center gap-3 rounded-2xl border border-[#45436a] bg-[#22213f] px-6 py-10 text-sm text-[#c5c3df]" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
            Loading class packages...
          </div>
        ) : packagesError ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-rose-300/30 bg-[#22213f] px-6 py-8 text-center">
            <p role="alert" className="text-sm text-rose-200">Could not load class packages: {packagesError}</p>
            <button
              type="button"
              onClick={loadPackages}
              className="mt-5 rounded-lg bg-[#7774bd] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8986d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Try again
            </button>
          </div>
        ) : packages.length === 0 ? (
          <p className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[#45436a] bg-[#22213f] px-6 py-8 text-center text-sm text-[#c5c3df]">
            No class packages are available right now. Please check back soon.
          </p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {packages.map((packageItem) => {
              const isSelected = selectedPackageId === packageItem.package_id

              return (
                <article
                  key={packageItem.package_id}
                  className="flex flex-col rounded-2xl border border-[#45436a] bg-[#22213f] p-6 shadow-[0_20px_50px_#09091440] transition hover:-translate-y-1 hover:border-[#7774bd] sm:p-7"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#c5c3df]">{packageItem.name}</p>
                    <p className="mt-5 flex items-baseline gap-2">
                      <span className="font-serif text-4xl font-semibold">{packageItem.class_count}</span>
                      <span className="text-sm text-[#aaa8d0]">classes</span>
                    </p>
                    <p className="mt-5 text-3xl font-semibold">{formatPrice(packageItem.price, packageItem.currency)}</p>
                    <p className="mt-2 text-sm text-[#aaa8d0]">One-time payment</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePackageSelect(packageItem.package_id)}
                    disabled={Boolean(selectedPackageId)}
                    aria-busy={isSelected}
                    className="mt-8 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#7774bd] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8986d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSelected ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                        <span role="status">Preparing checkout...</span>
                      </>
                    ) : (
                      <>Choose package <span aria-hidden="true">→</span></>
                    )}
                  </button>
                </article>
              )
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[#aaa8d0]">
          Secure checkout powered by Stripe · Prices are shown in the currency listed
        </p>
      </section>

      {checkoutError && (
        <PaymentResultModal
          result={{
            type: 'error',
            message: `Checkout could not be started: ${checkoutError} You have not been charged.`,
            actionLabel: 'Back to packages',
          }}
          onClose={closeErrorModal}
        />
      )}
    </main>
  )
}

export default PaymentPage
