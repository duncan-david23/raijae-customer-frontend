import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import AccountPage from './pages/AccountPage'
import AuthWrapper from './components/AuthWrapper'

const App = () => {


  return (
   
      <Routes>
        <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/products' element={<Products />} />
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
   
  )
}

export default App