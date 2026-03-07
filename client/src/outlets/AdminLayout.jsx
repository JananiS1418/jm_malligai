import React, { useContext } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import CountContext from "../context/CountContext"

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/categories", label: "Categories" },
  { to: "/products", label: "Products" },
  { to: "/users", label: "Users" },
  { to: "/all-orders", label: "Orders" },
]

const AdminLayout = () => {
  const { user, logout } = useContext(CountContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-semibold text-white tracking-tight">Admin</h1>
          <p className="text-xs text-slate-400 mt-0.5">Management</p>
        </div>
        <nav className="p-3 space-y-0.5">
          {navItems.map(({ to, label }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-sm font-medium text-slate-600">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-slate-700 text-sm font-medium">
              <span className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase() || "?"}
              </span>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
