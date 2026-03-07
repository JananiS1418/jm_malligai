
import { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CountContext from '../context/CountContext'
import Offer from './Offer'

const API_BASE = '/api'

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
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch mb-8'>
            {filteredProducts.map((e) => {
              const weights = getAvailableWeights(e)
              const allClosed = weights.length === 0
              const currentWeight = selectedWeight[e._id] ?? (weights[0]?.weight ?? 1)
              return (
                <div
                  key={e._id}
                  className='bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[420px] group overflow-hidden border border-gray-100'
                >
                  <div className='relative h-56 flex items-center justify-center bg-gray-50 overflow-hidden'>
                    <img
                      className='w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110'
                      src={e.image || "https://placehold.co/150?text=No+Image"}
                      alt={e.name}
                      onError={(ev) => { ev.target.onerror = null; ev.target.src = "https://placehold.co/150?text=No+Image" }}
                    />
                    <div className='absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md'>
                      SALE
                    </div>
                  </div>

                  <div className='flex flex-col flex-grow p-6'>
                    <div className='mb-auto'>
                      <h2 className='text-xl font-bold text-gray-800 text-center mb-1 line-clamp-1'>
                        {e.name}
                      </h2>
                      <p className='text-gray-500 text-sm text-center mb-3'>{e.category}</p>

                      <div className='flex justify-center items-end gap-2 mb-4'>
                        <p className='text-2xl font-bold text-green-600'>
                          ₹{e.price}<span className='text-sm font-normal text-gray-500'>/kg</span>
                        </p>
                        <p className='text-sm text-gray-400 line-through mb-1'>
                          ₹{Math.round(parseFloat(e.price) * 1.2)}
                        </p>
                      </div>
                    </div>

                    <div className='flex justify-center mb-4'>
                      {allClosed ? (
                        <p className='text-amber-600 text-sm font-medium'>All weights closed</p>
                      ) : (
                        <div className='flex flex-wrap gap-2 justify-center'>
                          {weights.map((w) => (
                            <button
                              key={w.weight}
                              type='button'
                              onClick={() => setSelectedWeight((prev) => ({ ...prev, [e._id]: w.weight }))}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${currentWeight === w.weight ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                              {w.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className='mt-auto'>
                      <button
                        onClick={() => !allClosed && addToCart(e, currentWeight)}
                        disabled={allClosed}
                        className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                      >
                        {allClosed ? 'Out of stock' : 'Add to Cart'}
                      </button>
                    </div>
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