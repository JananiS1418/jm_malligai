import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_BASE } from '../utils/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!email?.trim()) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setPendingEmail(data.email || email.trim().toLowerCase())
        setStep('otp')
        setOtp('')
        setNewPassword('')
        toast.success('OTP sent to your email')
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError('Please enter the OTP.')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail,
          otp: otp.trim(),
          newPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Password reset. You can sign in now.')
        navigate('/login')
      } else {
        setError(data.message || 'Invalid OTP or failed to reset.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/50 focus:border-[#2d5016] placeholder-slate-400'

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-[#e8f0e3] py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,80,22,0.12),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-[#c5d9bc]/40 to-transparent" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#7cb342]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#2d5016]/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-[#c5d9bc]/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#2d5016] tracking-tight">Grazary Shop</h1>
            <p className="text-slate-600 text-sm mt-1">
              {step === 'otp' ? 'Enter OTP and new password' : 'Reset your password'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form className="flex flex-col gap-4" onSubmit={sendOtp}>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">Email</label>
                <input
                  className={inputBase}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d5016] hover:bg-[#234016] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={resetPassword}>
              <p className="text-slate-600 text-sm">Code sent to <strong className="text-slate-800">{pendingEmail}</strong></p>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">OTP</label>
                <input
                  className={inputBase + ' text-center text-lg tracking-[0.3em]'}
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
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">New password</label>
                <div className="relative">
                  <input
                    className={inputBase + ' pr-12'}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6 || newPassword.length < 8}
                className="w-full bg-[#2d5016] hover:bg-[#234016] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
              >
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Use different email
              </button>
            </form>
          )}

          <p className="text-center text-slate-600 text-sm mt-6">
            <Link to="/login" className="text-[#2d5016] hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
