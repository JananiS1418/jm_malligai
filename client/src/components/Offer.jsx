import React from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'

const Offer = () => {
  const featuredOffers = [
    {
      title: 'Free delivery',
      subtitle: 'On first order above ₹299',
      icon: '🚚',
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      cta: 'Order now',
      highlight: true,
    },
    {
      title: 'Weekend special',
      subtitle: 'Up to 30% off on veggies',
      icon: '🏷️',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      cta: 'Shop deals',
      badge: 'Limited time',
    },
  ]

  const moreOffers = [
    {
      title: 'Buy 2 Get 1 Free',
      subtitle: 'On selected snacks & beverages',
      icon: '🎁',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100',
      cta: 'View products',
    },
    {
      title: 'First order 15% off',
      subtitle: 'Use code WELCOME15 at checkout',
      icon: '✨',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      iconBg: 'bg-violet-100',
      cta: 'Shop now',
      badge: 'New users',
    },
    {
      title: 'Refer & earn ₹100',
      subtitle: 'Give ₹100, get ₹100 off your next order',
      icon: '🤝',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      iconBg: 'bg-teal-100',
      cta: 'Refer friends',
    },
    {
      title: 'Daily essentials deal',
      subtitle: 'Up to 25% off on rice, oil & flour',
      icon: '🛒',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      iconBg: 'bg-sky-100',
      cta: 'Explore',
    },
    {
      title: 'Fresh morning combo',
      subtitle: 'Milk, bread & eggs at best price',
      icon: '🥛',
      bg: 'bg-lime-50',
      border: 'border-lime-200',
      iconBg: 'bg-lime-100',
      cta: 'Add to cart',
    },
    {
      title: 'Pay with UPI & save',
      subtitle: 'Extra 5% off on orders above ₹500',
      icon: '💳',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      cta: 'Checkout',
    },
  ]

  return (
    <div className="min-h-screen pt-20 pb-0 bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Offers & deals
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Save more on groceries and daily essentials. New offers added regularly.
          </p>
        </div>

        {/* Main promo strip */}
        <div className="mb-12">
          <div className="rounded-2xl bg-linear-to-r from-green-600 to-emerald-700 p-6 md:p-8 text-white shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-90" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-green-100 text-xs font-medium mb-3">
                  Featured
                </span>
                <h2 className="text-2xl md:text-3xl font-bold">Fresh deals every day</h2>
                <p className="text-green-100 mt-1">Start your healthy journey with JM Maligai.</p>
              </div>
              <Link
                to="/shop"
                className="shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-green-700 font-semibold hover:bg-green-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>

        {/* Why shop with us - featured 3 (Instamart-style cards) */}
        <section className="mb-14">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Why shop with us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredOffers.map((ad, i) => (
              <Link
                key={i}
                to="/shop"
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-2xl ${ad.iconBg} flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform`}>
                    {ad.icon}
                  </div>
                  {ad.badge && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 mb-3">
                      {ad.badge}
                    </span>
                  )}
                  <h4 className="font-bold text-gray-900 text-lg">{ad.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{ad.subtitle}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-green-600 group-hover:text-green-700">
                    {ad.cta}
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* More ways to save - clean white cards */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">More ways to save</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreOffers.map((ad, i) => (
              <Link
                key={i}
                to="/shop"
                className="group flex bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-6"
              >
                <span className={`shrink-0 w-14 h-14 rounded-xl ${ad.iconBg} flex items-center justify-center text-2xl group-hover:scale-105 transition-transform`}>
                  {ad.icon}
                </span>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900">{ad.title}</h4>
                    {ad.badge && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                        {ad.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{ad.subtitle}</p>
                  <span className="inline-block mt-3 text-sm font-semibold text-green-600 group-hover:text-green-700">
                    {ad.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA strip - extra space above footer */}
        <div className="mt-14 mb-20 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 text-center">
          <p className="text-gray-600 font-medium">Missing a deal? We add new offers often.</p>
          <Link
            to="/shop"
            className="inline-block mt-3 text-green-600 font-semibold hover:text-green-700"
          >
            Browse all products →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Offer
