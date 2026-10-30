import { useState } from 'react'
import { login } from '../service/auth.js'
import { tokenService } from '../service/token/tokenService.js'
import { useNavigate, Link } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

   const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await login(email, password)

      // Store tokens using tokenService
      if (data.access && data.refresh) {
        tokenService.setTokens({
          access: data.access,
          refresh: data.refresh,
        })
      }

      setSuccess('Login successful! Redirecting...')
      setEmail('')
      setPassword('')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)

      console.log('Login successful:', data)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout grid min-h-screen">
      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
        <div className="auth-content w-full max-w-md">
          <a href="#" className="mb-14 inline-flex items-center gap-3 no-underline sm:mb-20" aria-label="Lessonly home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292966] text-lg font-semibold text-white">l</span>
            <span className="text-lg font-semibold tracking-wide text-[#292966]">lessonly</span>
          </a>

          <div className="mb-9">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5c5c99]">Your classroom, anywhere</p>
            <h1 className="mb-3 font-serif text-4xl font-semibold leading-tight text-[#292966] sm:text-5xl">Welcome back</h1>
            <p className="text-base leading-7 text-[#77779f]">Sign in to pick up right where your learning journey paused.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#292966]">Email address</label>
              <input
                id="email"
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
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#292966]">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[#dadaed] bg-white px-4 py-3.5 text-base text-[#292966] outline-none transition placeholder:text-[#a3a3cc] focus:border-[#5c5c99] focus:ring-4 focus:ring-[#ccccff]/50"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center cursor-pointer gap-3 rounded-lg bg-[#292966] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#5c5c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c5c99] disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="mt-8 text-sm leading-6 text-[#77779f]">Having trouble signing in? Reach out to your course administrator.</p>
          <p className="mt-14 text-xs text-[#a3a3cc]">© 2026 Lessonly Learning</p>
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

          <div className="relative mt-14 h-56 max-w-md">
            <div className="book-stack absolute left-5 top-5 h-40 w-64 rounded-2xl border border-white/50 bg-[#ccccff] p-5 text-[#292966]">
              <div className="flex h-full flex-col justify-between rounded-xl border border-[#a3a3cc] bg-white/70 p-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#5c5c99]">Field notes · 04</span>
                <span className="font-serif text-2xl font-semibold leading-tight">The art of<br />understanding</span>
                <span className="h-1 w-12 rounded-full bg-[#5c5c99]" />
              </div>
            </div>
            <div className="absolute right-0 top-0 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-3xl text-[#ccccff]">✳</div>
            <div className="absolute bottom-0 right-7 rounded-xl border border-white/25 bg-[#292966]/70 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-[#ccccff]">Today</p>
              <p className="mt-1 text-sm font-medium">One lesson closer</p>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-[#d8d8f5]">
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

export default LoginPage