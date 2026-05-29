import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, ShoppingCart, User, ChevronDown,
  SlidersHorizontal, ArrowUpRight, Plus, Menu,
  Trash2, Minus,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import raijamLogo from '../assets/raijam_logo.png'
import axios from 'axios'


const ALL = 'all'

const SORTS = [
  { v: 'default',   l: 'Featured' },
  { v: 'az',        l: 'Name A – Z' },
  { v: 'price-lo',  l: 'Price: Low → High' },
  { v: 'price-hi',  l: 'Price: High → Low' },
]

const gridWrap = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const cardAnim = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [cat,       setCat]       = useState(ALL)
  const [brand,     setBrand]     = useState(ALL)
  const [sort,      setSort]      = useState('default')
  const [query,     setQuery]     = useState('')
  const [searching, setSearching] = useState(false)
  const [sortOpen,  setSortOpen]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [addedId,   setAddedId]   = useState(null)
  const searchRef = useRef(null)

  const { addToCart, getCartItemsCount, getCartTotal, cart, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useCart()

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true)
      // const { data: { session } } = await supabase.auth.getSession()
      // const token = session?.access_token
      
      // const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.get('https://raijae-backend.onrender.com/api/users/products',)
      
      // Map the API response to match your component's expected structure
      const mappedProducts = response.data.products.map(product => ({
        id: product.id,
        name: product.product_name,
        description: product.product_description,
        brand: product.product_brand,
        price: product.product_price,
        discount: product.discount,
        discountType: product.discount_type,
        stock: product.product_stock,
        category: product.product_categories || [],
        colors: product.product_colors || [],
        images: product.product_images || [],
        status: product.status,
        sku: product.skuid,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }))
      
      setProducts(mappedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Get categories from fetched products
  const categories = useMemo(() => {
    const s = new Set()
    products.forEach(p => p.category?.forEach(c => s.add(c)))
    return [{ id: ALL, label: 'All' }, ...[...s].map(c => ({ id: c, label: c[0].toUpperCase() + c.slice(1) }))]
  }, [products])

  // Get brands from fetched products
  const brands = useMemo(() => {
    return [...new Set(products.map(x => x.brand?.trim()).filter(Boolean))]
  }, [products])

  const filtered = useMemo(() => {
    let r = [...products]
    if (cat !== ALL)         r = r.filter(p => p.category?.includes(cat))
    if (brand !== ALL)       r = r.filter(p => p.brand?.trim() === brand)
    if (query.trim())        r = r.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    if (sort === 'az')       r.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'price-lo') r.sort((a, b) => a.price - b.price)
    if (sort === 'price-hi') r.sort((a, b) => b.price - a.price)
    return r
  }, [products, cat, brand, sort, query])

  const handleAddToCart = (e, p) => {
    e.preventDefault(); e.stopPropagation()
    addToCart(p)
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1300)
  }

  const openSearch = () => {
    setSearching(true)
    setTimeout(() => searchRef.current?.focus(), 60)
  }

  const hasFilter = cat !== ALL || brand !== ALL || query.trim()
  const cartCount = getCartItemsCount()

  if (loading) {
    return (
      <div style={{ 
        background: '#f5f5f5', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="ap-spin" style={{ width: 40, height: 40, margin: '0 auto 20px', border: '2px solid #e4e4e4', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
          <p style={{ color: '#777' }}>Loading products...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        img { display: block; }

        :root {
          --bg:    #f5f5f5;
          --white: #ffffff;
          --ink:   #111111;
          --ink2:  #444444;
          --soft:  #777777;
          --line:  #e4e4e4;
          --hover: #f0f0f0;
        }

        .rp { background: var(--bg); color: var(--ink); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        /* NAV */
        .nav {
          height: 58px; display: flex; align-items: center;
          padding: 0 32px; gap: 16px;
          background: var(--white); border-bottom: 1px solid var(--line);
          position: sticky; top: 0; z-index: 200;
        }
        @media(max-width:640px){ .nav { padding: 0 14px; } }

        .nav-brand {
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 900;
          letter-spacing: -0.02em; color: var(--ink); text-decoration: none; flex-shrink: 0;
        }
        .nav-center { display: flex; gap: 20px; margin-left: 20px; }
        @media(max-width:768px){ .nav-center { display: none; } }
        .nav-link {
          font-size: 11px; font-weight: 500; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--soft); text-decoration: none; transition: color .16s;
        }
        .nav-link:hover { color: var(--ink); }
        .nav-right { margin-left: auto; display: flex; align-items: center; gap: 0; }

        .icon-btn {
          width: 36px; height: 36px; border-radius: 6px;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s, color .14s;
          position: relative; text-decoration: none;
        }
        .icon-btn:hover { background: var(--hover); color: var(--ink); }

        .cart-badge {
          position: absolute; top: 2px; right: 2px;
          width: 15px; height: 15px; border-radius: 50%;
          background: var(--ink); color: #fff;
          font-size: 8px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; line-height: 1;
        }

        .hamburger { display: none; }
        @media(max-width:768px){ .hamburger { display: flex !important; } }

        /* DRAWER */
        .drawer {
          position: fixed; inset: 0; z-index: 400;
          background: var(--white);
          display: flex; flex-direction: column;
          padding: 64px 24px 32px; gap: 0;
        }
        .drawer-close {
          position: absolute; top: 14px; right: 14px;
          background: none; border: none; cursor: pointer;
          color: var(--ink2); padding: 6px; border-radius: 6px;
        }
        .drawer-link {
          font-size: 22px; font-weight: 600; color: var(--ink);
          text-decoration: none; padding: 14px 0;
          border-bottom: 1px solid var(--line); transition: color .16s;
        }
        .drawer-link:hover { color: var(--soft); }

        /* SEARCH OVERLAY */
        .search-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(245,245,245,0.97); backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .search-box { width: 100%; max-width: 520px; position: relative; }
        .search-big {
          width: 100%; background: none; border: none;
          border-bottom: 1.5px solid var(--ink);
          padding: 12px 44px 12px 0;
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 4vw, 32px);
          color: var(--ink); outline: none;
        }
        .search-big::placeholder { color: #ccc; }
        .search-x {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--soft); padding: 6px; transition: color .16s;
        }
        .search-x:hover { color: var(--ink); }
        .search-hint { margin-top: 8px; font-size: 11.5px; color: var(--soft); }

        /* CART PANEL */
        .cart-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 490;
        }
        .cart-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 380px; max-width: 100vw;
          background: var(--white); z-index: 491;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        @media(max-width:480px){ .cart-panel { width: 100vw; } }

        .cart-head {
          padding: 20px 24px; border-bottom: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
        }
        .cart-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: var(--ink);
        }
        .cart-close {
          background: none; border: none; cursor: pointer;
          color: var(--ink2); padding: 6px; border-radius: 6px;
          transition: background .14s;
        }
        .cart-close:hover { background: var(--hover); }

        .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .cart-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 40px 24px; text-align: center;
        }
        .cart-empty-icon { color: var(--line); }
        .cart-empty-txt { font-size: 13px; color: var(--soft); }

        .cart-item {
          display: flex; gap: 12px; padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-img {
          width: 60px; height: 60px; border-radius: 6px;
          background: #f8f8f8; overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cart-item-img img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name {
          font-size: 12.5px; font-weight: 600; color: var(--ink);
          line-height: 1.35; margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cart-item-price {
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: var(--ink);
        }
        .cart-item-qty {
          display: flex; align-items: center; gap: 8px; margin-top: 6px;
        }
        .qty-btn {
          width: 22px; height: 22px; border-radius: 4px;
          background: var(--hover); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s;
        }
        .qty-btn:hover { background: var(--line); }
        .qty-val { font-size: 12px; font-weight: 600; color: var(--ink); min-width: 16px; text-align: center; }
        .cart-remove {
          background: none; border: none; cursor: pointer;
          color: var(--soft); padding: 4px; transition: color .14s;
          flex-shrink: 0; align-self: flex-start; margin-top: 2px;
        }
        .cart-remove:hover { color: #c0392b; }

        .cart-foot {
          padding: 14px 24px 24px; border-top: 1px solid var(--line);
        }
        .cart-total-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
        }
        .cart-total-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--soft); }
        .cart-total-val {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: var(--ink);
        }
        .cart-pay-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--soft); margin-bottom: 8px;
        }
        .cart-pay-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
        .pay-btn {
          width: 100%; border: none; padding: 13px 16px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: opacity .18s, transform .14s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .pay-btn:hover { opacity: .88; }
        .pay-btn:active { transform: scale(.98); }
        .pay-paystack {
          background: #011B33; color: #fff;
        }
        .pay-paystack-logo {
          background: #00C3F7; border-radius: 4px;
          padding: 2px 6px; font-size: 10px; font-weight: 900;
          letter-spacing: 0.02em; color: #011B33;
        }
        .pay-cod {
          background: var(--hover); color: var(--ink);
          border: 1px solid var(--line);
        }
        .cart-pay-divider {
          display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
        }
        .cart-pay-divider-line { flex: 1; height: 1px; background: var(--line); }
        .cart-pay-divider-txt { font-size: 9.5px; color: #bbb; font-weight: 600; letter-spacing: 0.08em; }

        /* FILTER BAR */
        .filter-bar {
          background: var(--white); border-bottom: 1px solid var(--line);
          position: sticky; top: 58px; z-index: 100;
        }
        .cat-strip {
          display: flex; overflow-x: auto; scrollbar-width: none;
          padding: 0 32px; border-bottom: 1px solid var(--line);
        }
        .cat-strip::-webkit-scrollbar { display: none; }
        @media(max-width:640px){ .cat-strip { padding: 0 10px; } }
        .cat-btn {
          flex-shrink: 0; background: none; border: none;
          padding: 0 14px; height: 42px;
          font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 500;
          letter-spacing: 0.04em; color: var(--soft); cursor: pointer;
          white-space: nowrap; border-bottom: 2px solid transparent;
          transition: color .16s, border-color .16s;
        }
        .cat-btn.on { color: var(--ink); border-bottom-color: var(--ink); font-weight: 600; }
        .cat-btn:hover:not(.on) { color: var(--ink); }
        .tools-row {
          display: flex; align-items: center;
          padding: 0 32px; height: 42px; gap: 10px;
        }
        @media(max-width:640px){ .tools-row { padding: 0 10px; } }
        .brands-scr { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; flex: 1; align-items: center; }
        .brands-scr::-webkit-scrollbar { display: none; }
        .brand-pill {
          flex-shrink: 0; background: var(--white);
          border: 1px solid var(--line);
          border-left: 3px solid #bbb;
          border-radius: 4px;
          padding: 5px 11px 5px 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px; font-weight: 600; color: var(--ink2);
          cursor: pointer; transition: all .15s; white-space: nowrap;
          letter-spacing: 0.03em;
        }
        .brand-pill:hover { border-left-color: var(--ink); color: var(--ink); background: var(--hover); }
        .brand-pill.on { background: var(--ink); border-color: var(--ink); border-left-color: #555; color: #fff; }
        .vdivider { width: 1px; height: 18px; background: var(--line); flex-shrink: 0; }
        .sort-btn {
          background: none; border: none; font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500; color: var(--soft); cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          transition: color .15s; white-space: nowrap; flex-shrink: 0;
        }
        .sort-btn:hover { color: var(--ink); }
        .sort-menu {
          position: absolute; top: calc(100% + 4px); right: 0;
          background: var(--white); border: 1px solid var(--line);
          box-shadow: 0 10px 30px rgba(0,0,0,0.09);
          min-width: 180px; z-index: 400; border-radius: 8px; overflow: hidden;
        }
        .sort-item {
          display: block; width: 100%; background: none; border: none;
          text-align: left; padding: 10px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400;
          color: var(--ink2); cursor: pointer; transition: background .12s;
        }
        .sort-item:hover { background: var(--hover); }
        .sort-item.on { font-weight: 600; color: var(--ink); }

        /* CHIPS */
        .chips-row {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 32px; flex-wrap: wrap; border-bottom: 1px solid var(--line);
        }
        @media(max-width:640px){ .chips-row { padding: 8px 10px; } }
        .chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: var(--ink); color: #fff; border-radius: 100px;
          padding: 4px 10px; font-size: 10px; font-weight: 600;
        }
        .chip-x {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.6); display: flex; align-items: center; padding: 0;
        }
        .chip-x:hover { color: #fff; }
        .clear-btn {
          background: none; border: 1px solid var(--line); border-radius: 100px;
          padding: 4px 12px; font-family: 'DM Sans', sans-serif;
          font-size: 10px; font-weight: 500; color: var(--soft); cursor: pointer;
        }
        .clear-btn:hover { border-color: var(--ink); color: var(--ink); }

        /* RESULTS */
        .results-bar {
          padding: 14px 32px 0; font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase; color: var(--soft);
        }
        @media(max-width:640px){ .results-bar { padding: 12px 14px 0; } }

        /* GRID */
        .grid-wrap { padding: 16px 32px 72px; }
        @media(max-width:640px){ .grid-wrap { padding: 12px 10px 56px; } }
        .grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;
        }
        @media(max-width:1400px){ .grid { grid-template-columns: repeat(5, 1fr); } }
        @media(max-width:1100px){ .grid { grid-template-columns: repeat(4, 1fr); } }
        @media(max-width:800px)  { .grid { grid-template-columns: repeat(3, 1fr); gap: 8px; } }
        @media(max-width:640px)  { .grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

        /* CARD */
        .card {
          background: var(--white); border-radius: 8px;
          border: 1px solid var(--line); overflow: hidden;
          display: flex; flex-direction: column;
          transition: box-shadow .24s, transform .24s;
        }
        .card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .card-img-box {
          position: relative; overflow: hidden; aspect-ratio: 1/1; background: #f8f8f8;
        }
        .card-img {
          width: 100%; height: 100%; object-fit: contain; padding: 10px;
          transition: transform .55s cubic-bezier(.22,1,.36,1);
        }
        .card:hover .card-img { transform: scale(1.06); }
        .card-tag {
          position: absolute; top: 8px; left: 8px;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(4px);
          border-radius: 4px; padding: 2px 7px;
          font-size: 8.5px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink2);
        }
        .float-add {
          position: absolute; bottom: 8px; right: 8px;
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--ink); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; color: #fff;
          opacity: 0; transform: translateY(6px) scale(0.85);
          transition: opacity .2s, transform .2s, background .15s;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .card:hover .float-add { opacity: 1; transform: translateY(0) scale(1); }
        .float-add.added { background: #222; }
        .float-add:hover { background: #333; }
        .card-body {
          padding: 9px 10px 11px; display: flex; flex-direction: column; gap: 4px; flex: 1;
        }
        .card-brand {
          font-size: 8.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--soft);
        }
        .card-name {
          font-family: 'Playfair Display', serif; font-size: 12.5px; font-weight: 700;
          color: var(--ink); line-height: 1.3; text-decoration: none; display: block;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; transition: color .16s;
        }
        .card-name:hover { color: var(--soft); }
        .card-swatches { display: flex; gap: 3px; align-items: center; }
        .swatch {
          width: 7px; height: 7px; border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.12); flex-shrink: 0;
        }
        .swatch-more { font-size: 8.5px; color: var(--soft); font-weight: 600; }
        .card-footer {
          margin-top: auto; padding-top: 8px; border-top: 1px solid var(--line);
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .card-price {
          font-family: 'Playfair Display', serif; font-size: 13.5px; font-weight: 700;
          letter-spacing: -0.01em; color: var(--ink); line-height: 1;
        }
        .card-stock {
          display: flex; align-items: center; gap: 3px;
          font-size: 8.5px; font-weight: 600; color: var(--soft); margin-top: 2px;
        }
        .stock-dot { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; }
        .stock-dot.in  { background: #3a3a3a; }
        .stock-dot.low { background: #aaa; }
        .view-link {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 9px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--soft); text-decoration: none; transition: color .14s;
        }
        .view-link:hover { color: var(--ink); }

        /* EMPTY */
        .empty { grid-column: 1/-1; padding: 72px 20px; text-align: center; }
        .empty-icon { font-size: 36px; margin-bottom: 12px; opacity: .2; }
        .empty-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .empty-sub { font-size: 12.5px; color: var(--soft); margin-bottom: 20px; }
        .empty-btn {
          background: var(--ink); color: #fff; border: none;
          padding: 10px 24px; border-radius: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
        }
        .empty-btn:hover { background: #333; }
      `}</style>

      <div className="rp">

        {/* ══ NAVBAR ══ */}
        <nav className="nav">

          <div className='flex items-center gap-2'>
            <img src={raijamLogo} alt="RAIJAM" style={{ height: 30 }} />
            <Link to="/products" className="nav-brand">RAIJAM</Link>
          </div>

          <div className="nav-right">
            <motion.button className="icon-btn" onClick={openSearch} whileTap={{ scale: 0.88 }} aria-label="Search">
              <Search size={17} strokeWidth={1.8} />
            </motion.button>
            <Link to="/account" className="icon-btn" aria-label="Account">
              <User size={17} strokeWidth={1.8} />
            </Link>
            <motion.button className="icon-btn" onClick={() => setCartOpen(true)} whileTap={{ scale: 0.88 }} aria-label="Cart">
              <ShoppingCart size={17} strokeWidth={1.8} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount} className="cart-badge"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 399 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                className="drawer"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <button className="drawer-close" onClick={() => setMenuOpen(false)}><X size={19} /></button>
                <Link to="/" className="nav-brand" style={{ fontSize: 22, marginBottom: 20 }} onClick={() => setMenuOpen(false)}>RAIJAM</Link>
                {['Home', 'Collection', 'About', 'Contact'].map(l => (
                  <Link key={l} to={`/${l.toLowerCase()}`} className="drawer-link" onClick={() => setMenuOpen(false)}>{l}</Link>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search overlay */}
        <AnimatePresence>
          {searching && (
            <motion.div
              className="search-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={e => { if (e.target === e.currentTarget) setSearching(false) }}
            >
              <div className="search-box">
                <input
                  ref={searchRef} className="search-big"
                  placeholder="Search products…" value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <button className="search-x" onClick={() => setSearching(false)}><X size={19} /></button>
                {query && <p className="search-hint">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ CART PANEL ══ */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div
                className="cart-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
              />
              <motion.div
                className="cart-panel"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cart-head">
                  <span className="cart-title">Your Cart {cartCount > 0 && `(${cartCount})`}</span>
                  <button className="cart-close" onClick={() => setCartOpen(false)}><X size={18} /></button>
                </div>

                {cart.items.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingCart size={40} strokeWidth={1} className="cart-empty-icon" color="#e4e4e4" />
                    <p className="cart-empty-txt">Your cart is empty.<br />Add something beautiful.</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.items.map(item => (
                        <div key={item.id} className="cart-item">
                          <div className="cart-item-img">
                            <img src={item.images?.[0] || item.image} alt={item.name} />
                          </div>
                          <div className="cart-item-info">
                            <p className="cart-item-name">{item.name}</p>
                            <p className="cart-item-price">GHC {((item.price ?? item.product_price) * item.quantity).toFixed(2)}</p>
                            <div className="cart-item-qty">
                              <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus size={10} strokeWidth={2.5} />
                              </button>
                              <span className="qty-val">{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus size={10} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                          <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={14} strokeWidth={1.8} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="cart-foot">
                      <div className="cart-total-row">
                        <span className="cart-total-label">Total</span>
                        <span className="cart-total-val">GHC {getCartTotal().toFixed(2)}</span>
                      </div>
                      <p className="cart-pay-label">Pay with</p>
                      <div className="cart-pay-options">
                        <button className="pay-btn pay-paystack">
                          <span className="pay-paystack-logo">Pay</span>
                          Pay with Paystack
                        </button>
                        <div className="cart-pay-divider">
                          <div className="cart-pay-divider-line" />
                          <span className="cart-pay-divider-txt">OR</span>
                          <div className="cart-pay-divider-line" />
                        </div>
                        <button className="pay-btn pay-cod">
                          🏠 Cash on Delivery
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ══ FILTER BAR ══ */}
        <div className="filter-bar">
          <div className="cat-strip">
            {categories.map(c => (
              <button key={c.id} className={`cat-btn${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="tools-row">
            <div className="brands-scr">
              {brands.map(b => (
                <button key={b} className={`brand-pill${brand === b ? ' on' : ''}`} onClick={() => setBrand(brand === b ? ALL : b)}>
                  {b}
                </button>
              ))}
            </div>
            <div className="vdivider" />
            <div style={{ position: 'relative' }}>
              <button className="sort-btn" onClick={() => setSortOpen(v => !v)}>
                <SlidersHorizontal size={11} strokeWidth={2} />
                {SORTS.find(s => s.v === sort)?.l}
                <ChevronDown size={10} style={{ transition: 'transform .18s', transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 399 }} onClick={() => setSortOpen(false)} />
                    <motion.div
                      className="sort-menu"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                    >
                      {SORTS.map(s => (
                        <button key={s.v} className={`sort-item${sort === s.v ? ' on' : ''}`} onClick={() => { setSort(s.v); setSortOpen(false) }}>
                          {s.l}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active chips */}
        <AnimatePresence>
          {hasFilter && (
            <motion.div
              className="chips-row"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}
            >
              {cat !== ALL && (
                <span className="chip">
                  {categories.find(c => c.id === cat)?.label}
                  <button className="chip-x" onClick={() => setCat(ALL)}><X size={8} /></button>
                </span>
              )}
              {brand !== ALL && (
                <span className="chip">
                  {brand}
                  <button className="chip-x" onClick={() => setBrand(ALL)}><X size={8} /></button>
                </span>
              )}
              {query.trim() && (
                <span className="chip">
                  "{query}"
                  <button className="chip-x" onClick={() => setQuery('')}><X size={8} /></button>
                </span>
              )}
              <button className="clear-btn" onClick={() => { setCat(ALL); setBrand(ALL); setQuery('') }}>Clear all</button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="results-bar">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {cat !== ALL && ` · ${categories.find(c => c.id === cat)?.label}`}
        </p>

        {/* ══ GRID ══ */}
        <div className="grid-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cat}-${brand}-${sort}-${query}`}
              className="grid" variants={gridWrap} initial="hidden" animate="show"
            >
              {filtered.length === 0 ? (
                <motion.div className="empty" variants={cardAnim}>
                  <div className="empty-icon">∅</div>
                  <p className="empty-title">Nothing found</p>
                  <p className="empty-sub">Try adjusting your filters or search.</p>
                  <button className="empty-btn" onClick={() => { setCat(ALL); setBrand(ALL); setQuery('') }}>Reset</button>
                </motion.div>
              ) : filtered.map(p => (
                <motion.div key={p.id} variants={cardAnim} className="card">
                  <div className="card-img-box">
                    <Link to={`/product/${p.id}`}>
                      <img src={p.images?.[0] || 'https://via.placeholder.com/300'} alt={p.name} className="card-img" />
                    </Link>
                    <span className="card-tag">{p.category?.[0] || 'Product'}</span>
                    <button
                      className={`float-add${addedId === p.id ? ' added' : ''}`}
                      onClick={e => handleAddToCart(e, p)}
                      aria-label="Add to cart"
                    >
                      {addedId === p.id
                        ? <span style={{ fontSize: 11, fontWeight: 700 }}>✓</span>
                        : <Plus size={14} strokeWidth={2.5} />
                      }
                    </button>
                  </div>
                  <div className="card-body">
                    {p.brand?.trim() && <p className="card-brand">{p.brand.trim()}</p>}
                    <Link to={`/product/${p.id}`} className="card-name">{p.name}</Link>
                    {p.colors?.length > 0 && (
                      <div className="card-swatches">
                        {p.colors.slice(0, 5).map((c, i) => <span key={i} className="swatch" style={{ background: c }} />)}
                        {p.colors.length > 5 && <span className="swatch-more">+{p.colors.length - 5}</span>}
                      </div>
                    )}
                    <div className="card-footer">
                      <div>
                        <div className="card-price">GHC {p.price?.toFixed(2)}</div>
                        <div className="card-stock">
                          <span className={`stock-dot ${p.stock > 10 ? 'in' : 'low'}`} />
                          {p.stock > 10 ? 'In stock' : p.stock > 0 ? 'Low stock' : 'Out of stock'}
                        </div>
                      </div>
                      <Link to={`/product/${p.id}`} className="view-link">
                        View <ArrowUpRight size={9} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}