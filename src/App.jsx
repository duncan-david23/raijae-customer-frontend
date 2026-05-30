import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import AccountPage from './pages/AccountPage'
import AuthWrapper from './components/AuthWrapper'
import CartSlide from './components/CartSlide'
import { ToastContainer } from 'react-toastify'
import { CartProvider } from './context/CartContext'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'

const App = () => {
  return (
    <CartProvider>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/products' element={<Products />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path="/product/:id" element={
          <AuthWrapper>
            <ProductDetail />
          </AuthWrapper>
        } />
        <Route path="/account" element={
          <AuthWrapper>
            <AccountPage />
          </AuthWrapper>
        } />
      </Routes>
      <CartSlide />
      <ToastContainer />
    </CartProvider>
  )
}

export default App