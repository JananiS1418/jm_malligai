import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CountContext from '../context/CountContext'
import toast from 'react-hot-toast'
import { API_BASE } from '../utils/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Register = () => {
  const navigate = useNavigate()
  const { login } = useContext(CountContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const err = {}
    if (!name?.trim()) err.name = 'Full name is required.'
    if (!email?.trim()) err.email = 'Email is required.'
    else if (!EMAIL_REGEX.test(email.trim())) err.email = 'Please enter a valid email address.'
    if (!password) err.password = 'Password is required.'
    else if (password.length < 8) err.password = 'Password must be at least 8 characters.'
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const sendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: 'Customer',
        }),
      })
      const text = await res.text()
      let data = {}
      try {
        if (text) data = JSON.parse(text)
      } catch (_) {}
      if (res.ok) {
        setPendingEmail(data.email || email.trim().toLowerCase())
        setStep('otp')
        setOtp('')
        toast.success('OTP sent to your email')
      } else {
        setError(data.message || text || 'Failed to send OTP.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError('Please enter the OTP from your email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/register/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: otp.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.token) {
        login(data)
        toast.success('Account created')
        navigate('/')
      } else {
        setError(data.message || 'Invalid or expired OTP.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full bg-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/50 focus:border-[#2d5016] placeholder-slate-400 ${fieldErrors[field] ? 'border-red-400' : 'border-slate-300'} text-slate-900`

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-[#e8f0e3] py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,80,22,0.12),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-[#c5d9bc]/40 to-transparent" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-[#7cb342]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#2d5016]/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-[#c5d9bc]/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#2d5016] tracking-tight">Grazary Shop</h1>
            <p className="text-slate-600 text-sm mt-1">
              {step === 'otp' ? 'Verify your email with OTP' : 'Create your account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'form' ? (
            <form className="flex flex-col gap-4" onSubmit={sendOtp}>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">Full name</label>
                <input
                  className={inputClass('name')}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: '' })) }}
                  disabled={loading}
                  autoComplete="name"
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">Email</label>
                <input
                  className={inputClass('email')}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })) }}
                  disabled={loading}
                  autoComplete="email"
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    className={inputClass('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })) }}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 rounded-lg"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 bg-[#2d5016] hover:bg-[#234016] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
              >
                {loading ? 'Sending OTP…' : 'Send OTP to email'}
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={verifyOtp}>
              <p className="text-slate-600 text-sm">We sent a 6-digit code to <strong className="text-slate-800">{pendingEmail}</strong></p>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">OTP</label>
                <input
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#2d5016]/50 focus:border-[#2d5016]"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#2d5016] hover:bg-[#234016] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
              >
                {loading ? 'Verifying…' : 'Verify & create account'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Change email or details
              </button>
            </form>
          )}

          <p className="text-center text-slate-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2d5016] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
