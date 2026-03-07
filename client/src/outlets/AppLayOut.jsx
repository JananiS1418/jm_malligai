import React, { useContext } from 'react'
import NavBar from '../components/NavBar'
import { Outlet, Navigate } from 'react-router-dom'
import CountContext from '../context/CountContext'

const AppLayOut = () => {
  const { authChecked, isAuthenticated, user } = useContext(CountContext)

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading…</div>
      </div>
    )
  }

  if (isAuthenticated && user?.role === 'Admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}

export default AppLayOut
