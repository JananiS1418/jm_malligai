import { useEffect, useState, useContext } from "react"
import toast from "react-hot-toast"
import CountContext from "../context/CountContext"
import Modal from "./Modal"

const API_BASE = "/api"
const PER_PAGE = 10

const ShowCatogery = () => {
  const { user } = useContext(CountContext)
  const [cat, setCat] = useState({ catname: "", catstatus: "Active" })
  const [showcat, setShowCat] = useState([])
  const [editdata, setEditData] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`)
      if (response.ok) {
        const data = await response.json()
        setShowCat(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    setCat({ ...cat, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cat.catname?.trim() || !cat.catstatus) {
      toast.error("Please fill all fields")
      return
    }
    setLoading(true)
    try {
      const url = editdata ? `${API_BASE}/categories/${editdata}` : `${API_BASE}/categories`
      const method = editdata ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ catname: cat.catname.trim(), catstatus: cat.catstatus }),
      })
      if (response.ok) {
        setCat({ catname: "", catstatus: "Active" })
        setEditData("")
        setModalOpen(false)
        fetchCategories()
        toast.success(editdata ? "Category updated" : "Category added successfully")
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.message || "Operation failed")
      }
    } catch (error) {
      toast.error("Network error: Could not connect to the server")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setCat({ catname: "", catstatus: "Active" })
    setEditData("")
    setModalOpen(true)
  }

  const openEdit = (id) => {
    const found = showcat.find((e) => e._id === id)
    if (found) {
      setCat({ catname: found.catname, catstatus: found.catstatus })
      setEditData(id)
      setModalOpen(true)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    try {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      if (response.ok) {
        fetchCategories()
        if (editdata === id) {
          setEditData("")
          setModalOpen(false)
        }
        toast.success("Category deleted")
      } else {
        const err = await response.json().catch(() => ({}))
        toast.error(err.message || "Delete failed")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const searchLower = search.trim().toLowerCase()
  const filtered = showcat.filter((row) => {
    const matchStatus = statusFilter === "All" || row.catstatus === statusFilter
    if (!matchStatus) return false
    if (!searchLower) return true
    return (row.catname || "").toLowerCase().includes(searchLower)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage categories used by products</p>
        </div>
        <button type="button" onClick={openAdd} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800">
          Add category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-700">All categories</h2>
            <span className="text-xs text-slate-500">{filtered.length} of {showcat.length} total</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {showcat.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No categories yet. Add one using the button above.</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No categories match your search or filter.</div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginated.map((row, idx) => (
                    <tr key={row._id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500">{(currentPage - 1) * PER_PAGE + idx + 1}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-800">{row.catname}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.catstatus === "Active" ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-500"}`}>
                          {row.catstatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm">
                        <button type="button" onClick={() => openEdit(row._id)} className="text-slate-600 hover:text-slate-900 font-medium mr-3">Edit</button>
                        <button type="button" onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditData(""); setCat({ catname: "", catstatus: "Active" }) }} title={editdata ? "Edit category" : "Add category"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" name="catname" value={cat.catname} onChange={handleChange} placeholder="e.g. Vegetables" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select name="catstatus" value={cat.catstatus} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60">{loading ? "Saving…" : editdata ? "Update" : "Add category"}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ShowCatogery
