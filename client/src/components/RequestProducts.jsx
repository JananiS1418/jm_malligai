import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import CountContext from '../context/CountContext'
import Footer from './Footer'
import { createWorker } from 'tesseract.js'
import { API_BASE, resolveUploadUrl } from '../utils/api'

function getAvailableWeights(product) {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const available = product.weightOptions.filter((o) => o.available !== false)
    if (available.length > 0) return available
  }
  return [{ weight: 1, label: '1 kg' }]
}

/** Normalize a product name for display and API (trim, collapse spaces). */
function normalizeProductName(s) {
  if (!s || typeof s !== 'string') return ''
  return s.replace(/\s+/g, ' ').trim()
}

/**
 * Parse OCR text into product names.
 * Uses only line-based extraction when lines look like "ProductName - 1kg" / "ProductName : 1kg"
 * so we get 2 items from 2 lines, not 8 from token noise.
 */
function parseProductNamesFromText(text) {
  if (!text || typeof text !== 'string') return []
  const skip = new Set([
    'total', 'subtotal', 'amount', 'rs', 'rupee', 'rupees', 'inr', 'pes', 'pes.', 'kg', 'g', 'gm', 'gms', 'gams', 'grams', 'org',
    'qty', 'quantity', 'price', 'rate', 'tax', 'gst', 'cgst', 'sgst', 'discount', 'net',
    'cash', 'card', 'date', 'bill', 'invoice', 'thank', 'you', 'welcome', 'no', 'sr', 'sno',
    'item', 'items', 'name', 'description', 'mr', 'mrp', 'sum', 'grand', 'ru', 'in', 'the', 'a', 'an',
    'have', 'fun', 'bble'
  ])
  const lineBased = new Set()

  // 1) Line-based only: "ProductName - 1kg" or "ProductName : 1kg" or "ProductName 1 kg" -> one name per line
  const lines = text.split(/[\n\r]+/).map((s) => s.trim()).filter(Boolean)
  for (const line of lines) {
    const match = line.match(/^([^:0-9\-]+?)\s*[:\-]\s*[\d.]*\s*(kg|g|gm|gms)?\s*$/i) ||
                  line.match(/^([^:0-9\-]+?)\s*[:\-]?\s*[\d.]+\s*(kg|g|gm|gms)?\s*$/i) ||
                  line.match(/^(.+?)\s+[\d.]+\s*(kg|g|gm|gms)?\s*$/i)
    if (match) {
      const name = normalizeProductName(match[1])
      if (name.length >= 2 && name.length <= 40 && !/^\d+([.]\d+)?$/.test(name) && !skip.has(name.toLowerCase())) {
        lineBased.add(name)
      }
    }
  }

  // If we got at least one clear product line, use only those (no token noise)
  if (lineBased.size > 0) return [...lineBased]

  // 2) Fallback: no clear lines – tokenize and keep only product-like words
  const raw = text.split(/[\n\r,;|\t]+/).map((s) => s.trim()).filter(Boolean)
  const out = new Set()
  for (const s of raw) {
    const cleaned = s.replace(/\s*[:\-]\s*[\d.]*\s*(kg|g|gm)?\s*$/i, '').trim()
    if (cleaned.length < 2 || cleaned.length > 40) continue
    if (/^\d+([.]\d+)?$/.test(cleaned)) continue
    if (/^[\d.,\-]+$/.test(cleaned)) continue
    if (/^\(?\s*kg\s*\d+/i.test(cleaned)) continue
    if (skip.has(cleaned.toLowerCase())) continue
    const withoutNumbers = cleaned.replace(/\d+[\d.,]*/g, '').trim().toLowerCase()
    if (withoutNumbers.length < 2 || skip.has(withoutNumbers)) continue
    if (/^[^\p{L}\p{N}]+$/u.test(cleaned)) continue
    out.add(normalizeProductName(cleaned))
  }
  return [...out]
}

const RequestProducts = () => {
  const [billFile, setBillFile] = useState(null)
  const [billPreview, setBillPreview] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrStatus, setOcrStatus] = useState('')
  const [matchedResult, setMatchedResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const { addToCart } = useContext(CountContext)
  const [selectedWeight, setSelectedWeight] = useState({})

  const processBill = async (file) => {
    if (!file) return
    setOcrLoading(true)
    setOcrStatus('Reading bill…')
    setMatchedResult(null)
    let text = ''
    try {
      const worker = await createWorker('eng+tam', 1, {
        logger: (m) => {
          if (m.status) setOcrStatus(m.status)
        },
      })
      const { data } = await worker.recognize(file)
      text = data.text || ''
      await worker.terminate()
    } catch (err) {
      console.error('OCR error:', err)
      setOcrStatus('Could not read bill. Try a clearer image.')
      setOcrLoading(false)
      return
    }
    const names = parseProductNamesFromText(text)
    setOcrLoading(false)
    if (names.length === 0) {
      setMatchedResult({ matched: [], notFound: [], extracted: [] })
      return
    }
    setMatchLoading(true)
    setOcrStatus('Matching products…')
    try {
      const res = await fetch(`${API_BASE}/products/match-by-names`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names }),
      })
      const data = res.ok ? await res.json() : { matched: [], notFound: names }
      const matched = data.matched || []
      const notFound = data.notFound || []
      setMatchedResult({ matched, notFound, extracted: names })

      // Auto-add all matched products to cart (default weight)
      matched.forEach(({ product }) => {
        const weights = getAvailableWeights(product)
        if (weights.length > 0) {
          const w = weights[0].weight
          addToCart(product, w)
          setSelectedWeight((prev) => ({ ...prev, [product._id]: w }))
        }
      })
    } catch (err) {
      console.error('Match error:', err)
      setMatchedResult({ matched: [], notFound: names, extracted: names })
    } finally {
      setMatchLoading(false)
      setOcrStatus('')
    }
  }

  const handleBillUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (billPreview) URL.revokeObjectURL(billPreview)
    setBillFile(file)
    setBillPreview(URL.createObjectURL(file))
    setMatchedResult(null)
    processBill(file)
  }

  const removeBill = () => {
    setBillFile(null)
    if (billPreview) URL.revokeObjectURL(billPreview)
    setBillPreview(null)
    setMatchedResult(null)
    setOcrStatus('')
  }

  const available = matchedResult?.matched || []
  const notAvailable = matchedResult?.notFound || []

  const addAllAvailableToCart = () => {
    available.forEach(({ product }) => {
      const weights = getAvailableWeights(product)
      if (weights.length > 0) {
        const w = selectedWeight[product._id] ?? weights[0].weight
        addToCart(product, w)
      }
    })
  }

  const loading = ocrLoading || matchLoading

  return (
    <div className="min-h-screen pt-20 pb-0 bg-slate-50/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Bill-based products
          </h1>
          <p className="text-slate-500 mt-1">
            Upload your bill. We read it and add matching products to your cart automatically. We’ll tell you what’s not available.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Upload your bill</h2>
          <p className="text-slate-500 text-sm mb-4">
            Upload a photo of your bill. We’ll read the items and add available products to your cart.
          </p>
          {!billPreview ? (
            <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition cursor-pointer">
              <span className="text-slate-500 text-sm">Click to upload bill (image)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBillUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={billPreview}
                alt="Your bill"
                className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-slate-50"
              />
              {!loading && (
                <button
                  type="button"
                  onClick={removeBill}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                >
                  Remove
                </button>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-white font-medium">
                  {ocrStatus || 'Processing…'}
                </div>
              )}
            </div>
          )}
        </div>

        {matchedResult && !loading && (
          <>
            {available.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Added to your cart
                </h2>
                <p className="text-slate-500 text-sm mb-3">
                  {available.length} item{available.length !== 1 ? 's' : ''} from your bill {available.length === 1 ? 'was' : 'were'} added to the cart. You can change quantity in the cart.
                </p>
                <div className="space-y-3">
                  {available.map(({ requested, product }) => {
                    const weights = getAvailableWeights(product)
                    const allClosed = weights.length === 0
                    const currentWeight =
                      selectedWeight[product._id] ?? (weights[0]?.weight ?? 1)
                    return (
                      <div
                        key={product._id}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={resolveUploadUrl(product.image) || 'https://placehold.co/80?text=No+Image'}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://placehold.co/80?text=No+Image'
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.category}</p>
                            <p className="text-emerald-600 font-bold">₹{product.price}/kg</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {!allClosed && (
                            <div className="flex flex-wrap gap-1.5">
                              {weights.map((w) => (
                                <button
                                  key={w.weight}
                                  type="button"
                                  onClick={() =>
                                    setSelectedWeight((prev) => ({
                                      ...prev,
                                      [product._id]: w.weight,
                                    }))
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                    currentWeight === w.weight
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300'
                                  }`}
                                >
                                  {w.label}
                                </button>
                              ))}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              !allClosed && addToCart(product, currentWeight)
                            }
                            disabled={allClosed}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                          >
                            {allClosed ? 'Out of stock' : 'Add again'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {available.length === 0 && notAvailable.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center mb-6">
                <p className="text-slate-500">No product names could be read from the bill.</p>
                <p className="text-slate-400 text-sm mt-1">Try a clearer image or upload another bill.</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/cart"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Go to cart
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}

        {!billPreview && !matchedResult && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-500">Upload a bill image to get started.</p>
            <Link to="/shop" className="inline-block mt-4 text-emerald-600 font-medium hover:text-emerald-700">
              Browse all products →
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default RequestProducts
