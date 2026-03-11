import React, { useState, useEffect, useMemo } from 'react'
import CountContext from '../context/CountContext'

function getStoredUser() {
  try {
    const s = localStorage.getItem("user")
    if (!s) return null
    const p = JSON.parse(s)
    return (p && p.token) ? p : null
  } catch {
    return null
  }
}

function normalizeCartItem(item) {
  if (item && item.product && typeof item.quantity === 'number') {
    return { ...item, weight: item.weight != null ? Number(item.weight) : 1 }
  }
  if (item && item._id) return { product: item, quantity: 1, weight: 1 }
  return null
}

function normalizeCart(stored) {
  if (!Array.isArray(stored)) return []
  return stored.map(normalizeCartItem).filter(Boolean)
}

const UseProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart')) || []
    setCart(normalizeCart(stored))
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
      setIsAuthenticated(true)
    }
    setAuthChecked(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, weight = 1) => {
    // Require login for adding to cart (applies across the whole app)
    if (!isAuthenticated) {
      try {
        const next = `${window.location.pathname}${window.location.search || ''}`
        sessionStorage.setItem('jm_next_after_login', next)
      } catch {}
      window.alert('Please login first to add items to cart.')
      // Use client-side route path. With Vercel rewrites this works in production too.
      window.location.href = '/login'
      return
    }
    const id = product?._id
    if (!id) return
    const w = weight != null ? Number(weight) : 1
    setCart((prev) => {
      const found = prev.find((i) => i.product._id === id && (i.weight ?? 1) === w)
      if (found) {
        return prev.map((i) =>
          i.product._id === id && (i.weight ?? 1) === w ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        product: { _id: product._id, name: product.name, price: product.price, image: product.image, category: product.category },
        quantity: 1,
        weight: w
      }]
    })
  }

  const removeFromCart = (productId, weight) => {
    const w = weight != null ? Number(weight) : 1
    setCart((prev) => prev.filter((i) => !(i.product._id === productId && (i.weight ?? 1) === w)))
  }

  const updateCartQuantity = (productId, quantity, weight) => {
    const q = Math.max(0, parseInt(quantity, 10) || 0)
    const w = weight != null ? Number(weight) : 1
    if (q <= 0) {
      removeFromCart(productId, w)
      return
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === productId && (i.weight ?? 1) === w ? { ...i, quantity: q } : i
      )
    )
  }

  const clearCart = () => setCart([])

  const login = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("user")
  }

  const count = useMemo(() => cart.reduce((sum, i) => sum + (i.quantity || 0), 0), [cart])

  return (
    <CountContext.Provider
      value={{
        addToCart,
        cart,
        count,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        login,
        logout,
        isAuthenticated,
        user,
        authChecked,
      }}
    >
      {children}
    </CountContext.Provider>
  )
}

export default UseProvider
