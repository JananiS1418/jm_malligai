import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import CountContext from '../context/CountContext'

const ProtectedRoute = () => {
    const { isAuthenticated, authChecked, user } = useContext(CountContext)

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500">Loading…</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role === 'Admin') {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
