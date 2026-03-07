import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CountContext from '../context/CountContext'

const API_BASE = '/api'

const statusColors = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-slate-100 text-slate-600'
}

const statusMessages = {
  Pending: 'Order placed. We will confirm soon.',
  Confirmed: 'Order confirmed. Preparing for dispatch.',
  Shipped: 'Order shipped. On the way to you!',
  Delivered: 'Delivered. Thank you for your order!',
  Cancelled: 'This order was cancelled.'
}

const Orders = () => {
  const { user } = useContext(CountContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.token) return
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user?.token])

  const imageSrc = (img) => {
    if (!img) return 'https://placehold.co/80x80?text=No+Image'
    if (typeof img === 'string' && img.startsWith('/uploads/')) return img
    return img
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <p className="text-slate-500">Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">My orders</h1>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">You have no orders yet.</p>
          <Link to="/" className="inline-block mt-4 text-slate-700 font-medium hover:text-slate-900">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">My orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Order #{order._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {statusMessages[order.status] || `Status: ${order.status}`}
              </p>
            </div>
            <div className="p-5">
              <ul className="space-y-3 mb-4">
                {order.items?.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <img
                      src={imageSrc(item.image)}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80?text=No+Image' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-slate-500 text-sm">Qty: {item.quantity} × ₹{item.price}/kg{item.weight && item.weight !== 1 ? ` × ${item.weight} kg` : ''}</p>
                    </div>
                    <p className="font-medium text-slate-800 shrink-0">₹{((item.price || 0) * (item.weight || 1) * (item.quantity || 0)).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-slate-600">
                  <p>{order.shippingAddress?.fullName}, {order.shippingAddress?.phone}</p>
                  <p className="text-slate-500">
                    {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">{order.deliveryOption} delivery</p>
                </div>
                <p className="font-semibold text-slate-800">₹{order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
