import { useState, useEffect, useContext } from "react"
import toast from "react-hot-toast"
import CountContext from "../context/CountContext"
import { API_BASE } from "../utils/api"

const statusColors = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-slate-100 text-slate-600",
}

const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
const PER_PAGE = 10

const AdminOrders = () => {
  const { user } = useContext(CountContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)

  const fetchOrders = async () => {
    if (!user?.token) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [user?.token])

  const handleStatusChange = async (orderId, newStatus) => {
    if (!user?.token) return
    setUpdatingId(orderId)
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        )
        toast.success("Order status updated")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || "Failed to update status")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const searchLower = search.trim().toLowerCase()
  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter === "All" || order.status === statusFilter
    if (!matchStatus) return false
    if (!searchLower) return true
    const orderId = (order._id || "").toLowerCase()
    const name = (order.user?.name ?? "").toLowerCase()
    const email = (order.user?.email ?? "").toLowerCase()
    const addrName = (order.shippingAddress?.fullName ?? "").toLowerCase()
    const phone = (order.shippingAddress?.phone ?? "").replace(/\s/g, "")
    const searchNoSpaces = searchLower.replace(/\s/g, "")
    return (
      orderId.includes(searchLower) ||
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      addrName.includes(searchLower) ||
      phone.includes(searchNoSpaces)
    )
  })

  const totalFiltered = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PER_PAGE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">All orders</h1>
        <p className="text-slate-500 text-sm mt-0.5">Who booked, products, address and status</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-700">Orders list</h2>
            <span className="text-xs text-slate-500">
              {loading ? "…" : `${totalFiltered} of ${orders.length} order(s)`}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by order ID, name, email, phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="All">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No orders yet.</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No orders match your search or filter.</div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => (
                <div key={order._id} className="p-5 hover:bg-slate-50/50">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-medium text-slate-500">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">
                        {order.user?.name ?? "—"} ({order.user?.email ?? "—"})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-sm font-semibold text-slate-800">₹{order.totalAmount?.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500">Update status:</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="text-sm rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-800 disabled:opacity-60"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {updatingId === order._id && <span className="text-xs text-slate-500">Saving…</span>}
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status] || "bg-slate-100 text-slate-700"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Products</p>
                      <ul className="text-slate-700">
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.name} — {item.quantity} × {(item.weight || 1)} kg @ ₹{item.price} = ₹{((item.price || 0) * (item.weight || 1) * (item.quantity || 0)).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Delivery address</p>
                      <p className="text-slate-700">
                        {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}
                        <br />
                        {order.shippingAddress?.addressLine1}
                        {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                        <br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">{order.deliveryOption} delivery</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                  {totalFiltered > 0 && (
                    <span className="ml-1">
                      (showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, totalFiltered)} of {totalFiltered})
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
