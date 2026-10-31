import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { userRegister } from '../service/account_api.js'

function getRegistrationError(error) {
  const data = error.response?.data
  if (typeof data === 'string') return data

  const message = data?.detail || data?.error || data?.message
  if (message) return message

  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join(' ')
  }

  return error.message || 'Could not create your account.'
}

function RegistrationPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await userRegister({
        email,
        password,
        name: name.trim(),
        user_type: 'regular',
        invitation_token: token,
      })
      setIsRegistered(true)
    } catch (registrationError) {
      setError(getRegistrationError(registrationError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-layout grid min-h-screen">
      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
        <div className="auth-content w-full max-w-md">
          <Link to="/login" className="mb-14 inline-flex items-center gap-3 no-underline sm:mb-20" aria-label="Lektion ubq home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292966] text-lg font-semibold text-white">l</span>
            <span className="text-lg font-semibold tracking-wide text-[#292966]">Lektion ubq</span>
          </Link>

          <div className="mb-9">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Your classroom, anywhere</p>
            <h1 className="mb-3 font-serif text-4xl font-semibold leading-tight text-[#292966] sm:text-5xl">
              {isRegistered ? 'You’re all set' : 'Join your classroom'}
            </h1>
            <p className="text-base leading-7 text-[#77779f]">
              {isRegistered
                ? 'Your account has been created. Sign in to get started.'
                : 'Create your student account using the invitation from your tutor.'}
            </p>
          </div>

          {isRegistered ? (
            <div className="space-y-5">
              <p role="status" className="rounded-lg border border-[#b8dec5] bg-[#eff8f1] px-4 py-3 text-sm text-[#245343]">
                Registration successful.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#292966] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99]"
              >
                Continue to sign in <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-[#292966]">Full name</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={150}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[#dadaed] bg-white px-4 py-3.5 text-base text-[#292966] outline-none transition placeholder:text-[#a3a3cc] focus:border-[#5c5c99] focus:ring-4 focus:ring-[#ccccff]/50"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-[#292966]">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[#dadaed] bg-white px-4 py-3.5 text-base text-[#292966] outline-none transition placeholder:text-[#a3a3cc] focus:border-[#5c5c99] focus:ring-4 focus:ring-[#ccccff]/50"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-[#292966]">Password</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-lg border border-[#dadaed] bg-white px-4 py-3.5 text-base text-[#292966] outline-none transition placeholder:text-[#a3a3cc] focus:border-[#5c5c99] focus:ring-4 focus:ring-[#ccccff]/50"
                />
                <p className="mt-2 text-xs text-[#77779f]">Use at least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="register-invitation-token" className="mb-2 block text-sm font-semibold text-[#292966]">Invitation token</label>
                <input
                  id="register-invitation-token"
                  type="text"
                  readOnly
                  value={token || ''}
                  className="w-full rounded-lg border border-[#dadaed] bg-[#fcfcff] px-4 py-3.5 font-mono text-sm text-[#5c5c99] outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#292966] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? 'Creating account...' : 'Create student account'}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>
          )}

          <p className="mt-8 text-sm leading-6 text-[#77779f]">
            Already have an account? <Link to="/login" className="font-semibold text-[#5c5c99] hover:text-[#292966]">Sign in</Link>
          </p>
          <p className="mt-14 text-xs text-[#a3a3cc]">© 2026 Lektion ubq Learning</p>
        </div>
      </section>

      <aside className="auth-art relative hidden min-h-[640px] items-center justify-center overflow-hidden px-12 py-16 text-white md:flex lg:px-20">
        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-14 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-[#eeeeff]">
            <span className="h-2 w-2 rounded-full bg-[#ccccff]" />
            A little progress, every day
          </div>
          <h2 className="max-w-lg font-serif text-5xl font-medium leading-[1.12] text-white lg:text-6xl">Make room for your next big idea.</h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#e0e0ff]">Learn at your pace, meet inspiring teachers, and turn curiosity into confidence.</p>
          <div className="mt-14 flex items-center gap-3 text-sm text-[#d8d8f5]">
            <span className="flex -space-x-2" aria-hidden="true">
              <span className="h-8 w-8 rounded-full border-2 border-[#5c5c99] bg-[#ccccff]" />
              <span className="h-8 w-8 rounded-full border-2 border-[#5c5c99] bg-[#a3a3cc]" />
              <span className="h-8 w-8 rounded-full border-2 border-[#5c5c99] bg-white" />
            </span>
            A place for curious minds
          </div>
        </div>
      </aside>
    </main>
  )
}

export default RegistrationPage
