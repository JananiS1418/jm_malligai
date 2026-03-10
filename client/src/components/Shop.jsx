import { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CountContext from '../context/CountContext'
import Footer from './Footer'
import { API_BASE, resolveUploadUrl } from '../utils/api'

function getAvailableWeights(product) {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const available = product.weightOptions.filter((o) => o.available !== false)
    if (available.length > 0) return available
  }
  return [{ weight: 1, label: '1 kg' }]
}

const Shop = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const { addToCart } = useContext(CountContext)
  const [selectedWeight, setSelectedWeight] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.filter((p) => p.status === 'Active'))
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`)
        if (res.ok) {
          const data = await res.json()
          setCategories(data.filter((c) => c.catstatus === 'Active'))
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  const filteredProducts = categoryFilter
    ? products.filter(
        (p) => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase()
      )
    : products

  return (
    <div className="min-h-screen pt-20 pb-0 bg-slate-50/60">
      {/* Hero strip */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                {categoryFilter ? (
                  <>
                    <span className="text-slate-500 font-medium">Shop / </span>
                    {categoryFilter}
                  </>
                ) : (
                  'All products'
                )}
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                {categoryFilter
                  ? 'Browse and add to cart'
                  : 'Browse by category or add to cart'}
              </p>
            </div>
            {!loading && (
              <p className="text-sm text-slate-500 shrink-0">
                <span className="font-semibold text-slate-700">{filteredProducts.length}</span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/shop"
                className={`inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  !categoryFilter
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700'
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${encodeURIComponent(cat.catname)}`}
                  className={`inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    categoryFilter === cat.catname
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700'
                  }`}
                >
                  {cat.catname}
                </Link>
              ))}
            </div>
            {categoryFilter && (
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                <span aria-hidden>←</span> Show all products
              </Link>
            )}
          </div>
        )}

        {/* Product grid - compact for many products */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-200/70 animate-pulse overflow-hidden"
                style={{ height: '260px' }}
              >
                <div className="h-32 bg-slate-300/50" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-300/50 rounded w-3/4" />
                  <div className="h-3 bg-slate-300/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-4">
              🛒
            </div>
            <p className="text-slate-600 font-medium">
              {categoryFilter
                ? `No products in "${categoryFilter}".`
                : 'No products yet.'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {categoryFilter ? 'Try another category or show all.' : 'Check back later.'}
            </p>
            {categoryFilter && (
              <Link
                to="/shop"
                className="inline-flex items-center mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
              >
                Show all products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredProducts.map((p) => {
              const weights = getAvailableWeights(p)
              const allClosed = weights.length === 0
              const currentWeight =
                selectedWeight[p._id] ?? (weights[0]?.weight ?? 1)
              return (
                <article
                  key={p._id}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-200"
                >
                  {/* Image block with inner padding */}
                  <div className="relative h-36 sm:h-40 flex items-center justify-center p-4 sm:p-5 bg-linear-to-b from-slate-50 to-white overflow-hidden">
                    <img
                      src={resolveUploadUrl(p.image) || 'https://placehold.co/200?text=No+Image'}
                      alt={p.name}
                      className="max-h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      onError={(ev) => {
                        ev.target.onerror = null
                        ev.target.src = 'https://placehold.co/200?text=No+Image'
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-slate-600 shadow-sm border border-slate-100/80 uppercase tracking-wide">
                      {p.category}
                    </span>
                  </div>
                  {/* Content with generous padding */}
                  <div className="flex flex-col grow p-4 sm:p-5">
                    <h2 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2">
                      {p.name}
                    </h2>
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-base font-bold text-emerald-600">
                        ₹{p.price}
                      </span>
                      <span className="text-xs text-slate-500">/kg</span>
                    </div>
                    <div className="mb-4">
                      {allClosed ? (
                        <p className="text-amber-600 text-xs font-medium py-1">
                          Out of stock
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {weights.map((w) => (
                            <button
                              key={w.weight}
                              type="button"
                              onClick={() =>
                                setSelectedWeight((prev) => ({
                                  ...prev,
                                  [p._id]: w.weight,
                                }))
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                currentWeight === w.weight
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700'
                              }`}
                            >
                              {w.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        !allClosed && addToCart(p, currentWeight)
                      }
                      disabled={allClosed}
                      className="mt-auto w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {allClosed ? 'Out of stock' : 'Add to cart'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Shop
