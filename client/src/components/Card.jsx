
import { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CountContext from '../context/CountContext'
import Offer from './Offer'
import { API_BASE, resolveUploadUrl } from '../utils/api'

function getAvailableWeights(product) {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const available = product.weightOptions.filter((o) => o.available !== false)
    if (available.length > 0) return available
  }
  return [{ weight: 1, label: '1 kg' }]
}

const Card = () => {
  const [products, setProducts] = useState([])
  const [searchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const { addToCart } = useContext(CountContext)
  const [selectedWeight, setSelectedWeight] = useState({})

  useEffect(() => {
    const fetchActiveProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/products`)
        if (response.ok) {
          const data = await response.json()
          const activeProducts = data.filter(p => p.status === "Active")
          setProducts(activeProducts)
        }
      } catch (error) {
        console.error("Error fetching active products:", error)
      }
    }
    fetchActiveProducts()
  }, [])

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase())
    : products

  return (
    <>
      <div className='mt-8 p-5 max-w-7xl mx-auto'>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              {categoryFilter ? `Products in ${categoryFilter}` : 'All products'}
            </h2>
            <p className="text-gray-500 mt-1">
              {categoryFilter ? 'Browse and add to cart' : 'Browse by category above or add to cart'}
            </p>
          </div>
          {categoryFilter && (
            <Link
              to="/"
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              Show all products →
            </Link>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10 rounded-2xl bg-gray-50 border border-gray-100">
            {categoryFilter
              ? `No products in "${categoryFilter}". Add products in this category from Admin → Products, or show all.`
              : 'No products yet. Add categories in Admin → Categories, then add products in Admin → Products.'}
            {categoryFilter && (
              <div className="mt-4">
                <Link to="/" className="text-green-600 hover:underline font-medium">Show all products</Link>
              </div>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch mb-8'>
            {filteredProducts.map((e) => {
              const weights = getAvailableWeights(e)
              const allClosed = weights.length === 0
              const currentWeight = selectedWeight[e._id] ?? (weights[0]?.weight ?? 1)
              return (
                <div
                  key={e._id}
                  className='group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden'
                >
                  <div className='relative h-44 flex items-center justify-center bg-slate-50 overflow-hidden p-4'>
                    <img
                      className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-105'
                      src={resolveUploadUrl(e.image) || "https://placehold.co/200?text=No+Image"}
                      alt={e.name}
                      onError={(ev) => { ev.target.onerror = null; ev.target.src = "https://placehold.co/200?text=No+Image" }}
                    />
                    <span className='absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm'>
                      SALE
                    </span>
                    <span className='absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur text-[10px] font-semibold text-slate-600 border border-slate-100'>
                      {e.category}
                    </span>
                  </div>

                  <div className='flex flex-col grow p-4 sm:p-5'>
                    <h2 className='text-base font-bold text-slate-900 text-center mb-0.5 line-clamp-1'>
                      {e.name}
                    </h2>
                    <div className='flex justify-center items-baseline gap-2 mb-4'>
                      <span className='text-lg font-bold text-emerald-600'>
                        ₹{e.price}
                      </span>
                      <span className='text-xs text-slate-500'>/kg</span>
                      <span className='text-xs text-slate-400 line-through'>
                        ₹{Math.round(parseFloat(e.price) * 1.2)}
                      </span>
                    </div>

                    <div className='flex justify-center mb-4'>
                      {allClosed ? (
                        <p className='text-amber-600 text-xs font-medium'>Out of stock</p>
                      ) : (
                        <div className='flex flex-wrap gap-1.5 justify-center'>
                          {weights.map((w) => (
                            <button
                              key={w.weight}
                              type='button'
                              onClick={() => setSelectedWeight((prev) => ({ ...prev, [e._id]: w.weight }))}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${currentWeight === w.weight ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'}`}
                            >
                              {w.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => !allClosed && addToCart(e, currentWeight)}
                      disabled={allClosed}
                      className='w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
                    >
                      {allClosed ? 'Out of stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Offer />
    </>
  )
}

export default Card