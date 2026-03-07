import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CountContext from '../context/CountContext'
import toast from 'react-hot-toast'

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, isAuthenticated } = useContext(CountContext)
  const navigate = useNavigate()

  const lineTotal = (item) => (item.product?.price || 0) * (item.weight ?? 1) * (item.quantity || 0)
  const subtotal = cart.reduce((sum, i) => sum + lineTotal(i), 0)

  const weightLabel = (w) => {
    if (w == null || w === 1) return '1 kg'
    if (w === 0.5) return '500 g'
    if (w === 0.25) return '250 g'
    if (w === 2) return '2 kg'
    return `${w} kg`
  }

  const handleProceed = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    if (!isAuthenticated) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  const imageSrc = (img) => {
    if (!img) return 'https://placehold.co/120x120?text=No+Image'
    if (typeof img === 'string' && img.startsWith('/uploads/')) return img
    return img
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-slate-800">Your cart is empty</h1>
          <p className="text-slate-500 mt-2">Add items from the shop to get started.</p>
          <Link
            to="/"
            className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Cart</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {cart.map((item) => (
            <li key={`${item.product._id}-${item.weight ?? 1}`} className="flex gap-4 p-4 sm:p-5">
              <img
                src={imageSrc(item.product.image)}
                alt={item.product.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-slate-200 shrink-0"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120?text=No+Image' }}
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-slate-800 truncate">{item.product.name}</h2>
                <p className="text-slate-500 text-sm mt-0.5">₹{item.product.price}/kg · {weightLabel(item.weight)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.product._id, item.quantity - 1, item.weight)}
                    className="w-8 h-8 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.product._id, item.quantity + 1, item.weight)}
                    className="w-8 h-8 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product._id, item.weight)}
                    className="ml-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-slate-800">₹{lineTotal(item).toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <p className="text-slate-600">
            Subtotal: <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
          </p>
          <div className="flex gap-3">
            <Link to="/" className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={handleProceed}
              className="px-5 py-2.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
