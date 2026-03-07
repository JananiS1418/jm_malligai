import { Link, useNavigate } from "react-router-dom"
import image from '../assets/images/add-to-cart.png'
import { useContext } from "react"
import CountContext from "../context/CountContext"

const NavBar = () => {
  const { count, isAuthenticated, logout, user } = useContext(CountContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-green-600 group-hover:text-green-700 transition">
                JM
              </span>
              <span className="text-2xl font-bold text-gray-800 ml-1.5 group-hover:text-gray-900 transition">
                Maligai
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-medium text-gray-500 ml-2 border-l border-gray-200 pl-2">
              Grocery Store
            </span>
          </Link>

          {/* Center nav links - visible on larger screens */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 font-medium text-sm transition"
            >
              Home
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 font-medium text-sm transition"
            >
              Products
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 font-medium text-sm transition"
            >
              Offers
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 font-medium text-sm transition"
              >
                Orders
              </Link>
            )}
          </div>

          {/* Right: Cart + Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-green-600 transition"
              aria-label="Cart"
            >
              <img src={image} className="w-6 h-6 sm:w-7 sm:h-7" alt="Cart" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm hover:shadow transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
