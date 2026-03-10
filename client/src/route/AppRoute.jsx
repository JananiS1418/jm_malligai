
import { Route, Routes } from 'react-router-dom'
import Login from '../components/Login'
import AppLayOut from '../outlets/AppLayOut'
import Banner from '../components/Banner'
import Register from '../components/Register'
import ForgotPassword from '../components/ForgotPassword'
import Dashboard from '../components/Dashboard'
import AdminLayout from '../outlets/AdminLayout'
import Products from '../components/Products'
import ShowCatogery from '../components/ShowCatogery'
import AdminUsers from '../components/AdminUsers'
import AdminOrders from '../components/AdminOrders'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import Profile from '../components/Profile'
import Cart from '../components/Cart'
import Checkout from '../components/Checkout'
import Orders from '../components/Orders'
import Shop from '../components/Shop'
import Offer from '../components/Offer'
import RequestProducts from '../components/RequestProducts'

const AppRoute = () => {
  return (
    <Routes>
      <Route element={<AppLayOut />}>
        <Route path="/" element={<Banner />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/offers" element={<Offer />} />
        <Route path="/request" element={<RequestProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<ShowCatogery />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="all-orders" element={<AdminOrders />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  )
}

export default AppRoute
