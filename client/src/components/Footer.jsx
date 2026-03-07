import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/', label: 'Products' },
    { to: '/', label: 'Offers' },
    { to: '/profile', label: 'Account' },
  ]

  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 max-w-7xl mx-auto">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">JM</span>
              <span className="text-xl font-bold text-green-400">Maligai</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              Your trusted neighborhood grocery store for fresh vegetables, quality groceries, and daily essentials.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Freshness you can trust. Quality you can taste. Service you can rely on.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick links</h4>
            <ul className="space-y-2">
              {links.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-white transition text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Visit us</h4>
            <p className="text-sm text-gray-400">
              JM Maligai Grocery Store
              <br />
              Fresh produce & daily essentials
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <p className="text-gray-500 text-sm">© 2026 JM Maligai. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-400 transition">Privacy</Link>
            <Link to="/" className="text-gray-500 hover:text-gray-400 transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
