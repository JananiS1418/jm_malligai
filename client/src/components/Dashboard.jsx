import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import CountContext from "../context/CountContext"
import { API_BASE } from "../utils/api"

const Dashboard = () => {
  const { user } = useContext(CountContext)
  const [counts, setCounts] = useState({ products: 0, categories: 0, users: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.token) return
    const fetchCounts = async () => {
      setLoading(true)
      try {
        const headers = { Authorization: `Bearer ${user.token}` }
        const [prodRes, catRes, usersRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/users`, { headers }),
          fetch(`${API_BASE}/orders`, { headers }),
        ])
        if (prodRes.ok) {
          const data = await prodRes.json()
          setCounts((c) => ({ ...c, products: Array.isArray(data) ? data.length : 0 }))
        }
        if (catRes.ok) {
          const data = await catRes.json()
          setCounts((c) => ({ ...c, categories: Array.isArray(data) ? data.length : 0 }))
        }
        if (usersRes.ok) {
          const data = await usersRes.json()
          setCounts((c) => ({ ...c, users: Array.isArray(data) ? data.length : 0 }))
        }
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setCounts((c) => ({ ...c, orders: Array.isArray(data) ? data.length : 0 }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [user?.token])

  const stats = [
    { label: "Total Products", value: counts.products },
    { label: "Total Categories", value: counts.categories },
    { label: "Total Users", value: counts.users },
    { label: "Total Orders", value: counts.orders },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">{loading ? "…" : card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick links</h2>
        <p className="text-slate-500 text-sm mb-4">
          Use the sidebar to manage categories, products, users and orders.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/users"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
          >
            View all users
          </Link>
          <Link
            to="/all-orders"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
          >
            View all orders
          </Link>
          <Link
            to="/categories"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
          >
            Categories
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
          >
            Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
