import React from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'

const Offer = () => {
  const ads = [
    {
      title: 'Free delivery',
      subtitle: 'On first order above ₹299',
      icon: '🚚',
      bg: 'bg-green-50 border border-green-100',
      cta: 'Order now',
    },
    {
      title: 'Weekend special',
      subtitle: 'Up to 30% off on veggies',
      icon: '🥬',
      bg: 'bg-amber-50 border border-amber-100',
      cta: 'Shop deals',
    },
    {
      title: 'Get the app',
      subtitle: 'Exclusive app-only offers',
      icon: '📱',
      bg: 'bg-blue-50 border border-blue-100',
      cta: 'Download',
    },
  ]

  return (
    <div className="mt-16 mb-4">
      {/* Main promo strip */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="rounded-2xl bg-linear-to-r from-green-600 to-emerald-700 p-6 md:p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Fresh deals every day</h2>
              <p className="text-green-100 mt-1">Start your healthy journey with JM Maligai.</p>
            </div>
            <Link
              to="/"
              className="shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-green-700 font-semibold hover:bg-green-50 transition shadow"
            >
              Shop now
            </Link>
          </div>
        </div>
      </div>

      {/* Ad cards */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Why shop with us</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ads.map((ad, i) => (
            <div
              key={i}
              className={`rounded-xl ${ad.bg} p-5 flex items-start gap-4 hover:shadow-md transition`}
            >
              <span className="text-3xl shrink-0">{ad.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-800">{ad.title}</h4>
                <p className="text-sm text-gray-600 mt-0.5">{ad.subtitle}</p>
                <Link
                  to="/"
                  className="inline-block mt-3 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  {ad.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Offer
