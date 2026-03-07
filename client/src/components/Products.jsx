import { useState, useEffect, useContext } from "react"
import toast from "react-hot-toast"
import CountContext from "../context/CountContext"
import Modal from "./Modal"

const API_BASE = "/api"
const PER_PAGE = 10
const DEFAULT_WEIGHT_OPTIONS = [
  { weight: 0.25, label: "250 g", available: true },
  { weight: 0.5, label: "500 g", available: true },
  { weight: 1, label: "1 kg", available: true },
  { weight: 2, label: "2 kg", available: false },
]

const Products = () => {
  const { user } = useContext(CountContext)
  const [products, setProducts] = useState({ name: "", category: "", price: "", status: "Active", image: "" })
  const [weightOptions, setWeightOptions] = useState([...DEFAULT_WEIGHT_OPTIONS])
  const [imageFile, setImageFile] = useState(null)
  const [showproducts, setShowproducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editdata, setEditdata] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [page, setPage] = useState(1)

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setImageFile(e.target.files?.[0] || null)
      return
    }
    setProducts({ ...products, [e.target.name]: e.target.value })
  }

  const buildFormData = () => {
    const form = new FormData()
    form.append("name", products.name)
    form.append("category", products.category)
    form.append("price", String(products.price))
    form.append("status", products.status)
    form.append("weightOptions", JSON.stringify(weightOptions))
    if (imageFile) form.append("image", imageFile)
    else if (products.image && !products.image.startsWith("/uploads/")) form.append("image", products.image)
    return form
  }

  const toggleWeightAvailable = (index) => {
    setWeightOptions((prev) => prev.map((o, i) => (i === index ? { ...o, available: !o.available } : o)))
  }

  const getCategory = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data.filter((e) => e.catstatus === "Active"))
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`)
      if (res.ok) {
        const data = await res.json()
        setShowproducts(data)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  useEffect(() => {
    fetchProducts()
    getCategory()
  }, [])

  const openAdd = () => {
    setProducts({ name: "", category: "", price: "", status: "Active", image: "" })
    setWeightOptions([...DEFAULT_WEIGHT_OPTIONS])
    setImageFile(null)
    setEditdata("")
    setModalOpen(true)
  }

  const openEdit = (id) => {
    const found = showproducts.find((e) => e._id === id)
    if (found) {
      setEditdata(id)
      setImageFile(null)
      setProducts({
        name: found.name,
        category: found.category,
        price: found.price,
        status: found.status,
        image: found.image || "",
      })
      if (found.weightOptions && found.weightOptions.length > 0) {
        setWeightOptions(found.weightOptions.map((o) => ({ weight: o.weight, label: o.label, available: o.available !== false })))
      } else {
        setWeightOptions([...DEFAULT_WEIGHT_OPTIONS])
      }
      setModalOpen(true)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditdata("")
    setProducts({ name: "", category: "", price: "", status: "Active", image: "" })
    setWeightOptions([...DEFAULT_WEIGHT_OPTIONS])
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!products.name?.trim() || !products.category || !products.price || !products.status) {
      toast.error("Please fill all required fields")
      return
    }
    setLoading(true)
    try {
      if (editdata) {
        const formData = buildFormData()
        const res = await fetch(`${API_BASE}/products/${editdata}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${user?.token}` },
          body: formData,
        })
        if (res.ok) {
          fetchProducts()
          closeModal()
          toast.success("Product updated")
        } else {
          const data = await res.json().catch(() => ({}))
          toast.error(data.message || "Failed to update product")
        }
      } else {
        const formData = buildFormData()
        const res = await fetch(`${API_BASE}/products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user?.token}` },
          body: formData,
        })
        if (res.ok) {
          fetchProducts()
          closeModal()
          toast.success("Product added successfully")
        } else {
          const data = await res.json().catch(() => ({}))
          toast.error(data.message || "Failed to add product")
        }
      }
    } catch (err) {
      console.error("Error saving product:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      if (res.ok) {
        fetchProducts()
        if (editdata === id) closeModal()
        toast.success("Product deleted")
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || "Delete failed")
      }
    } catch (err) {
      console.error("Error deleting product:", err)
    }
  }

  const imageSrc = (img) => {
    if (!img) return "https://placehold.co/120x120?text=No+Image"
    if (img.startsWith("/uploads/")) return img
    return img
  }

  const searchLower = search.trim().toLowerCase()
  const filtered = showproducts.filter((row) => {
    const matchStatus = statusFilter === "All" || row.status === statusFilter
    const matchCategory = categoryFilter === "All" || row.category === categoryFilter
    if (!matchStatus || !matchCategory) return false
    if (!searchLower) return true
    const name = (row.name || "").toLowerCase()
    const cat = (row.category || "").toLowerCase()
    return name.includes(searchLower) || cat.includes(searchLower)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const categoryOptions = [...new Set(showproducts.map((p) => p.category).filter(Boolean))].sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage products and images</p>
        </div>
        <button type="button" onClick={openAdd} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800">
          Add product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-700">All products</h2>
            <span className="text-xs text-slate-500">{filtered.length} of {showproducts.length} total</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or category…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400">
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400">
              <option value="All">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {showproducts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No products yet. Add one using the button above (add categories first if needed).</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No products match your search or filter.</div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Image</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price/kg</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Weights</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginated.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <img src={imageSrc(row.image)} alt={row.name} className="h-11 w-11 rounded-lg object-cover border border-slate-200" onError={(ev) => { ev.target.onerror = null; ev.target.src = "https://placehold.co/120x120?text=No+Image" }} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-800">{row.name}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">{row.category}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-800">{row.price}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">
                        {row.weightOptions?.length > 0 ? (row.weightOptions.every((o) => !o.available) ? <span className="text-amber-600">All closed</span> : row.weightOptions.filter((o) => o.available).map((o) => o.label).join(", ")) : "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.status === "Active" ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-500"}`}>{row.status}</span>
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

      <Modal open={modalOpen} onClose={closeModal} title={editdata ? "Edit product" : "Add product"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" name="name" value={products.name} onChange={handleChange} placeholder="Product name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select name="category" value={products.category} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.catname}>{c.catname}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (per kg)</label>
              <input type="number" name="price" value={products.price} onChange={handleChange} min="0" step="0.01" placeholder="0" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" value={products.status} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm" />
            {imageFile && <p className="text-xs text-slate-600 mt-1">{imageFile.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Weight options</label>
            <div className="flex flex-wrap gap-2">
              {weightOptions.map((opt, index) => (
                <label key={index} className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer text-xs ${opt.available ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 opacity-75"}`}>
                  <input type="checkbox" checked={opt.available} onChange={() => toggleWeightAvailable(index)} className="rounded border-slate-300" />
                  <span className="font-medium text-slate-700">{opt.label}</span>
                  <span className="text-slate-500">{opt.available ? "On" : "Off"}</span>
                </label>
              ))}
            </div>
            {weightOptions.every((o) => !o.available) && <p className="text-amber-600 text-xs mt-1">All closed — disabled for sale.</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60">{loading ? "Saving…" : editdata ? "Update" : "Add product"}</button>
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Products
