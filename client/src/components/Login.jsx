import React, { useContext, useState } from 'react'
import CountContext from '../context/CountContext'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_BASE } from '../utils/api'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useContext(CountContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = (e) => {
    e.preventDefault()
    navigate('/register')
  }

  const clickLogin = async (e) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email?.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })
      const text = await response.text()
      let data = {}
      try {
        if (text) data = JSON.parse(text)
      } catch (_) {}
      if (response.ok && data.token) {
        login(data)
        toast.success('Signed in')
        navigate(data.role === 'Admin' ? '/dashboard' : '/')
      } else {
        setError(data.message || 'Invalid email or password.')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-[#e8f0e3]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,80,22,0.12),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-[#c5d9bc]/40 to-transparent" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#7cb342]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#2d5016]/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md px-6 py-8">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-[#c5d9bc]/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#2d5016] tracking-tight">Grazary Shop</h1>
            <p className="text-slate-600 text-sm mt-1">Sign in with your email</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={clickLogin}>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Email</label>
              <input
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/50 focus:border-[#2d5016] placeholder-slate-400"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/50 focus:border-[#2d5016] placeholder-slate-400"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 rounded-lg"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#2d5016] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-[#2d5016] hover:bg-[#234016] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            New here?{' '}
            <button type="button" onClick={handleClick} className="text-[#2d5016] hover:underline font-medium">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
