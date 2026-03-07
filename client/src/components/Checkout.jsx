import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import CountContext from '../context/CountContext'

const API_BASE = '/api'
const PHONE_REGEX = /^[6-9]\d{9}$/
const PINCODE_REGEX = /^\d{6}$/

const Checkout = () => {
  const { cart, user, clearCart } = useContext(CountContext)
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [deliveryOption, setDeliveryOption] = useState('Standard')
  const [loading, setLoading] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (!user?.token) {
      navigate('/login')
      return
    }
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API_BASE}/addresses`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setAddresses(data)
          if (data.length > 0 && !selectedAddressId) {
            const defaultAddr = data.find((a) => a.isDefault) || data[0]
            setSelectedAddressId(defaultAddr._id)
          }
        }
      } catch (e) {
        console.error(e)
        toast.error('Failed to load addresses')
      } finally {
        setLoadingAddresses(false)
      }
    }
    fetchAddresses()
  }, [user?.token, navigate])

  useEffect(() => {
    if (cart.length === 0 && addresses.length >= 0 && !loadingAddresses) {
      navigate('/cart')
    }
  }, [cart.length, addresses.length, loadingAddresses, navigate])

  const validateForm = () => {
    const err = {}
    if (!form.fullName?.trim()) err.fullName = 'Name is required'
    if (!form.phone?.trim()) err.phone = 'Mobile number is required'
    else if (!PHONE_REGEX.test(form.phone.trim().replace(/\s/g, ''))) {
      err.phone = 'Enter a valid 10-digit mobile number'
    }
    if (!form.addressLine1?.trim()) err.addressLine1 = 'Address is required'
    if (!form.city?.trim()) err.city = 'City is required'
    if (!form.state?.trim()) err.state = 'State is required'
    if (!form.pincode?.trim()) err.pincode = 'Pincode is required'
    else if (!PINCODE_REGEX.test(form.pincode.trim())) err.pincode = 'Pincode must be 6 digits'
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim().replace(/\s/g, ''),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          isDefault: addresses.length === 0
        })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setAddresses((prev) => [...prev, data])
        setSelectedAddressId(data._id)
        setForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' })
        setFormErrors({})
        setShowAddForm(false)
        toast.success('Address added')
      } else {
        toast.error(data.message || 'Failed to add address')
      }
    } catch (e) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId)
  const subtotal = cart.reduce((s, i) => s + (i.product?.price || 0) * (i.weight ?? 1) * (i.quantity || 0), 0)
  const deliveryCharge = deliveryOption === 'Express' ? 49 : 0
  const total = subtotal + deliveryCharge

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }
    setLoading(true)
    try {
      const payload = {
        items: cart.map((i) => ({
          productId: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          weight: i.weight ?? 1,
          image: i.product.image
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        deliveryOption,
        phone: selectedAddress.phone
      }
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        clearCart()
        toast.success('Order placed successfully')
        navigate('/orders')
      } else {
        toast.error(data.message || 'Failed to place order')
      }
    } catch (e) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0 && loadingAddresses) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-24">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Checkout</h1>

      <div className="space-y-6">
        {/* Address */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-medium text-slate-700">Delivery address</h2>
          </div>
          <div className="p-5">
            {loadingAddresses ? (
              <p className="text-slate-500 text-sm">Loading addresses...</p>
            ) : (
              <>
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer mb-2 last:mb-0 ${
                      selectedAddressId === addr._id ? 'border-slate-700 bg-slate-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-slate-800">{addr.fullName}</p>
                      <p className="text-slate-600 text-sm">{addr.phone}</p>
                      <p className="text-slate-600 text-sm">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
                {!showAddForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 text-sm font-medium text-slate-600 hover:text-slate-800"
                  >
                    + Add new address
                  </button>
                ) : (
                  <form onSubmit={handleAddAddress} className="mt-4 p-4 rounded-lg border border-slate-200 space-y-3">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.fullName ? 'border-red-500' : 'border-slate-300'}`}
                    />
                    {formErrors.fullName && <p className="text-red-500 text-xs">{formErrors.fullName}</p>}
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.phone ? 'border-red-500' : 'border-slate-300'}`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs">{formErrors.phone}</p>}
                    <input
                      type="text"
                      placeholder="Address line 1"
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.addressLine1 ? 'border-red-500' : 'border-slate-300'}`}
                    />
                    {formErrors.addressLine1 && <p className="text-red-500 text-xs">{formErrors.addressLine1}</p>}
                    <input
                      type="text"
                      placeholder="Address line 2 (optional)"
                      value={form.addressLine2}
                      onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.city ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {formErrors.city && <p className="text-red-500 text-xs">{formErrors.city}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.state ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {formErrors.state && <p className="text-red-500 text-xs">{formErrors.state}</p>}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Pincode (6 digits)"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.pincode ? 'border-red-500' : 'border-slate-300'}`}
                      />
                      {formErrors.pincode && <p className="text-red-500 text-xs">{formErrors.pincode}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium disabled:opacity-60">
                        Save address
                      </button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delivery option */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-medium text-slate-700">Delivery option</h2>
          </div>
          <div className="p-5 flex gap-4">
            <label className={`flex-1 p-3 rounded-lg border cursor-pointer ${deliveryOption === 'Standard' ? 'border-slate-700 bg-slate-50' : 'border-slate-200'}`}>
              <input type="radio" name="delivery" checked={deliveryOption === 'Standard'} onChange={() => setDeliveryOption('Standard')} className="sr-only" />
              <p className="font-medium text-slate-800">Standard</p>
              <p className="text-slate-500 text-sm">Free delivery</p>
            </label>
            <label className={`flex-1 p-3 rounded-lg border cursor-pointer ${deliveryOption === 'Express' ? 'border-slate-700 bg-slate-50' : 'border-slate-200'}`}>
              <input type="radio" name="delivery" checked={deliveryOption === 'Express'} onChange={() => setDeliveryOption('Express')} className="sr-only" />
              <p className="font-medium text-slate-800">Express</p>
              <p className="text-slate-500 text-sm">₹49</p>
            </label>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-medium text-slate-700">Order summary</h2>
          </div>
          <div className="p-5">
            <ul className="space-y-2 mb-4">
              {cart.map((i) => (
                <li key={`${i.product._id}-${i.weight ?? 1}`} className="flex justify-between text-sm">
                  <span className="text-slate-700">{i.product.name} ({i.weight === 0.25 ? '250 g' : i.weight === 0.5 ? '500 g' : i.weight === 2 ? '2 kg' : '1 kg'}) × {i.quantity}</span>
                  <span className="text-slate-800 font-medium">₹{((i.product.price || 0) * (i.weight ?? 1) * (i.quantity || 0)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery ({deliveryOption})</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="mt-4 w-full py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-60"
            >
              {loading ? 'Placing order...' : 'Place order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
