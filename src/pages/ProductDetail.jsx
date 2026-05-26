import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, ArrowLeft, Plus, Minus,
  Trash2, X, ChevronLeft, ChevronRight,
  Check, Package, RefreshCw, Shield, User,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import axios from 'axios'


export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    addToCart, removeFromCart, updateQuantity,
    isInCart, getCartItemsCount, getCartTotal,
    cart, cartOpen, setCartOpen,
  } = useCart()

  const [imgIdx,    setImgIdx]    = useState(0)
  const [qty,       setQty]       = useState(1)
  const [addedAnim, setAddedAnim] = useState(false)
  const [selColor,  setSelColor]  = useState(null)

  // Fetch product from backend
  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
          // const { data: { session } } = await supabase.auth.getSession()
          // const token = session?.access_token
          
          // const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.get(`http://172.20.10.3:5000/api/users/products/product/${id}`, )
      
      // Map the API response to match your component's expected structure
      const mappedProduct = {
        id: response.data.product.id,
        name: response.data.product.product_name,
        description: response.data.product.product_description,
        brand: response.data.product.product_brand,
        price: response.data.product.product_price,
        discount: response.data.product.discount,
        discountType: response.data.product.discount_type,
        stock: response.data.product.product_stock,
        category: response.data.product.product_categories || [],
        colors: response.data.product.product_colors || [],
        images: response.data.product.product_images || [],
        status: response.data.product.status,
        sku: response.data.product.skuid,
        createdAt: response.data.product.created_at,
        updatedAt: response.data.product.updated_at
      }
      
      setProduct(mappedProduct)
      setSelColor(mappedProduct.colors?.[0] || null)
      
      // Fetch related products
      if (mappedProduct.category && mappedProduct.category.length > 0) {
        const relatedResponse = await axios.get('http://172.20.10.3:5000/api/users/products',)
        const allProducts = relatedResponse.data.products.map(p => ({
          id: p.id,
          name: p.product_name,
          description: p.product_description,
          brand: p.product_brand,
          price: p.product_price,
          discount: p.discount,
          discountType: p.discount_type,
          stock: p.product_stock,
          category: p.product_categories || [],
          colors: p.product_colors || [],
          images: p.product_images || [],
          status: p.status,
          sku: p.skuid,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }))
        
        const relatedProducts = allProducts.filter(p => 
          p.id !== mappedProduct.id && 
          p.category?.some(c => mappedProduct.category?.includes(c))
        ).slice(0, 4)
        
        setRelated(relatedProducts)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) addToCart(product)
    setAddedAnim(true)
    setTimeout(() => setAddedAnim(false), 1600)
  }

  const prevImg = () => setImgIdx(i => (i === 0 ? product.images.length - 1 : i - 1))
  const nextImg = () => setImgIdx(i => (i === product.images.length - 1 ? 0 : i + 1))

  const cartCount = getCartItemsCount()
  const inCart = product ? isInCart(product.id) : false

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', gap: 16, background: '#f5f5f5' }}>
        <div className="ap-spin" style={{ width: 40, height: 40, margin: '0 auto 20px', border: '2px solid #e4e4e4', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
        <p style={{ fontSize: 14, color: '#777' }}>Loading product...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', gap: 16, background: '#f5f5f5' }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{error || 'Product not found.'}</p>
        <Link to="/products" style={{ fontSize: 13, color: '#777', textDecoration: 'underline' }}>Back to collection</Link>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
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

        .pd { background: var(--bg); color: var(--ink); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        /* ── NAVBAR ── */
        .pd-nav {
          height: 58px; display: flex; align-items: center;
          padding: 0 32px; gap: 16px;
          background: var(--white); border-bottom: 1px solid var(--line);
          position: sticky; top: 0; z-index: 200;
        }
        @media(max-width:640px){ .pd-nav { padding: 0 14px; } }
        .pd-nav-brand {
          font-family: 'Playfair Display', serif; font-size: 19px;
          font-weight: 900; letter-spacing: -0.02em;
          color: var(--ink); text-decoration: none; flex-shrink: 0;
        }
        .pd-nav-right { margin-left: auto; display: flex; align-items: center; gap: 0; }
        .pd-icon-btn {
          width: 36px; height: 36px; border-radius: 6px;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s, color .14s;
          position: relative; text-decoration: none;
        }
        .pd-icon-btn:hover { background: var(--hover); color: var(--ink); }
        .pd-cart-badge {
          position: absolute; top: 2px; right: 2px;
          width: 15px; height: 15px; border-radius: 50%;
          background: var(--ink); color: #fff;
          font-size: 8px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; line-height: 1;
        }

        /* ── BREADCRUMB ── */
        .pd-crumb {
          padding: 14px 32px;
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: var(--soft);
          border-bottom: 1px solid var(--line);
          background: var(--white);
        }
        @media(max-width:640px){ .pd-crumb { padding: 12px 16px; } }
        .pd-crumb a { color: var(--soft); text-decoration: none; transition: color .14s; }
        .pd-crumb a:hover { color: var(--ink); }
        .pd-crumb-sep { color: var(--line); }

        /* ── MAIN LAYOUT ── */
        .pd-main {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0; max-width: 1200px; margin: 0 auto;
          padding: 40px 32px; gap: 48px;
        }
        @media(max-width:768px){
          .pd-main { grid-template-columns: 1fr; padding: 24px 16px; gap: 28px; }
        }

        /* ── IMAGE SECTION ── */
        .pd-images { position: relative; }
        .pd-main-img-wrap {
          position: relative; overflow: hidden;
          border-radius: 12px; background: var(--white);
          border: 1px solid var(--line); aspect-ratio: 1/1;
          margin-bottom: 12px;
        }
        .pd-main-img {
          width: 100%; height: 100%; object-fit: contain; padding: 24px;
          transition: opacity .25s;
        }

        .pd-img-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9); backdrop-filter: blur(6px);
          border: 1px solid var(--line); border-radius: 50%;
          width: 36px; height: 36px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s, color .14s;
          z-index: 5;
        }
        .pd-img-nav:hover { background: var(--white); color: var(--ink); }
        .pd-img-nav.prev { left: 12px; }
        .pd-img-nav.next { right: 12px; }

        .pd-thumbs {
          display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
        }
        .pd-thumbs::-webkit-scrollbar { display: none; }
        .pd-thumb {
          flex-shrink: 0; width: 64px; height: 64px; border-radius: 8px;
          background: var(--white); border: 1.5px solid transparent;
          overflow: hidden; cursor: pointer; transition: border-color .16s;
          display: flex; align-items: center; justify-content: center;
        }
        .pd-thumb.active { border-color: var(--ink); }
        .pd-thumb:not(.active):hover { border-color: var(--line); }
        .pd-thumb img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }

        /* ── INFO SECTION ── */
        .pd-info { display: flex; flex-direction: column; gap: 20px; }

        .pd-info-top { padding-bottom: 20px; border-bottom: 1px solid var(--line); }
        .pd-brand {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--soft); margin-bottom: 8px;
        }
        .pd-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3.5vw, 34px);
          font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;
          color: var(--ink); margin-bottom: 12px;
        }
        .pd-price-row { display: flex; align-items: center; gap: 12px; }
        .pd-price {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700; color: var(--ink);
        }
        .pd-stock {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
          padding: 4px 10px; border-radius: 100px;
          background: var(--hover);
        }
        .pd-stock-dot { width: 5px; height: 5px; border-radius: 50%; }
        .pd-stock-dot.in  { background: #3a3a3a; }
        .pd-stock-dot.low { background: #aaa; }

        /* desc */
        .pd-desc {
          font-size: 13.5px; line-height: 1.75; color: var(--ink2);
        }

        /* colors */
        .pd-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--soft); margin-bottom: 10px;
        }
        .pd-colors { display: flex; gap: 8px; flex-wrap: wrap; }
        .pd-color-btn {
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          border: 2.5px solid transparent;
          transition: border-color .16s, transform .16s;
          position: relative;
        }
        .pd-color-btn.selected { border-color: var(--ink); transform: scale(1.12); }
        .pd-color-btn:not(.selected):hover { transform: scale(1.08); }
        .pd-color-btn::after {
          content: ''; position: absolute; inset: -4px;
          border-radius: 50%; border: 1.5px solid transparent;
        }
        .pd-color-btn.selected::after { border-color: rgba(0,0,0,0.15); }

        /* qty */
        .pd-qty-row { display: flex; align-items: center; gap: 8px; }
        .pd-qty-btn {
          width: 32px; height: 32px; border-radius: 6px;
          background: var(--hover); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s;
        }
        .pd-qty-btn:hover { background: var(--line); }
        .pd-qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pd-qty-val {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: var(--ink);
          min-width: 28px; text-align: center;
        }

        /* add to cart */
        .pd-add-btn {
          width: 100%; background: var(--ink); color: #fff;
          border: none; padding: 15px 24px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .2s; position: relative; overflow: hidden;
        }
        .pd-add-btn:hover { background: #2c2c2a; }
        .pd-add-btn.added { background: #2c2c2a; }
        .pd-view-cart-btn {
          width: 100%; background: transparent; color: var(--ink);
          border: 1.5px solid var(--ink); padding: 13px 24px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .2s, color .2s;
        }
        .pd-view-cart-btn:hover { background: var(--ink); color: #fff; }

        /* perks */
        .pd-perks { display: flex; flex-direction: column; gap: 10px; }
        .pd-perk {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: var(--ink2);
        }
        .pd-perk svg { flex-shrink: 0; color: var(--soft); }

        /* ── CART PANEL ── */
        .cp-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 490;
        }
        .cp {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 380px; max-width: 100vw;
          background: var(--white); z-index: 491;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        @media(max-width:480px){ .cp { width: 100vw; } }
        .cp-head {
          padding: 20px 24px; border-bottom: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
        }
        .cp-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: var(--ink);
        }
        .cp-close {
          background: none; border: none; cursor: pointer;
          color: var(--ink2); padding: 6px; border-radius: 6px; transition: background .14s;
        }
        .cp-close:hover { background: var(--hover); }
        .cp-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .cp-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 40px 24px; text-align: center;
        }
        .cp-empty-txt { font-size: 13px; color: var(--soft); }
        .cp-item {
          display: flex; gap: 12px; padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .cp-item:last-child { border-bottom: none; }
        .cp-item-img {
          width: 60px; height: 60px; border-radius: 6px;
          background: #f8f8f8; overflow: hidden; flex-shrink: 0;
        }
        .cp-item-img img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
        .cp-item-info { flex: 1; min-width: 0; }
        .cp-item-name {
          font-size: 12.5px; font-weight: 600; color: var(--ink);
          margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cp-item-price {
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: var(--ink);
        }
        .cp-item-qty { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .cp-qty-btn {
          width: 22px; height: 22px; border-radius: 4px;
          background: var(--hover); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s;
        }
        .cp-qty-btn:hover { background: var(--line); }
        .cp-qty-val { font-size: 12px; font-weight: 600; color: var(--ink); min-width: 16px; text-align: center; }
        .cp-remove {
          background: none; border: none; cursor: pointer;
          color: var(--soft); padding: 4px; transition: color .14s;
          flex-shrink: 0; align-self: flex-start; margin-top: 2px;
        }
        .cp-remove:hover { color: #c0392b; }
        .cp-foot { padding: 14px 24px 24px; border-top: 1px solid var(--line); }
        .cp-total-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
        }
        .cp-total-lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--soft); }
        .cp-total-val {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: var(--ink);
        }
        .cp-pay-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--soft); margin-bottom: 8px;
        }
        .cp-pay-options { display: flex; flex-direction: column; gap: 8px; }
        .cp-pay-btn {
          width: 100%; border: none; padding: 13px 16px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: opacity .18s, transform .14s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .cp-pay-btn:hover { opacity: .88; }
        .cp-pay-btn:active { transform: scale(.98); }
        .cp-paystack { background: #011B33; color: #fff; }
        .cp-paystack-logo {
          background: #00C3F7; border-radius: 4px;
          padding: 2px 6px; font-size: 10px; font-weight: 900;
          letter-spacing: 0.02em; color: #011B33;
        }
        .cp-cod { background: var(--hover); color: var(--ink); border: 1px solid var(--line); }
        .cp-pay-divider {
          display: flex; align-items: center; gap: 8px; margin: 4px 0;
        }
        .cp-pay-divider-line { flex: 1; height: 1px; background: var(--line); }
        .cp-pay-divider-txt { font-size: 9.5px; color: #bbb; font-weight: 600; letter-spacing: 0.08em; }

        /* ── RELATED ── */
        .pd-related { padding: 48px 32px 64px; max-width: 1200px; margin: 0 auto; }
        @media(max-width:640px){ .pd-related { padding: 32px 16px 48px; } }
        .pd-related-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: var(--ink);
          margin-bottom: 20px; letter-spacing: -0.01em;
        }
        .pd-related-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
        }
        @media(max-width:900px){ .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

        .rel-card {
          background: var(--white); border-radius: 8px;
          border: 1px solid var(--line); overflow: hidden;
          text-decoration: none; color: var(--ink);
          display: flex; flex-direction: column;
          transition: box-shadow .22s, transform .22s;
        }
        .rel-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .rel-card-img {
          aspect-ratio: 1/1; background: #f8f8f8; overflow: hidden;
        }
        .rel-card-img img { width: 100%; height: 100%; object-fit: contain; padding: 10px; transition: transform .5s; }
        .rel-card:hover .rel-card-img img { transform: scale(1.05); }
        .rel-card-body { padding: 9px 10px 12px; }
        .rel-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 12.5px; font-weight: 700; color: var(--ink);
          line-height: 1.3; margin-bottom: 4px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .rel-card-price {
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: var(--soft);
        }
      `}</style>

      <div className="pd">

        {/* NAVBAR */}
        <nav className="pd-nav">
          <Link to="/products" className="pd-nav-brand">RAIJAM</Link>
          <div className="pd-nav-right">
            <Link to="/account" className="pd-icon-btn" aria-label="Account">
              <User size={17} strokeWidth={1.8} />
            </Link>
            <motion.button
              className="pd-icon-btn"
              onClick={() => setCartOpen(true)}
              whileTap={{ scale: 0.88 }}
              aria-label="Cart"
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount} className="pd-cart-badge"
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

        {/* BREADCRUMB */}
        <div className="pd-crumb">
          <Link to="/products">Collection</Link>
          <span className="pd-crumb-sep">/</span>
          <span style={{ color: '#aaa' }}>{product.category?.[0] || 'Products'}</span>
          <span className="pd-crumb-sep">/</span>
          <span style={{ color: '#111', fontWeight: 500 }}>{product.name}</span>
        </div>

        {/* MAIN */}
        <div className="pd-main">

          {/* Images */}
          <motion.div
            className="pd-images"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pd-main-img-wrap">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={product.images[imgIdx] || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="pd-main-img"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              {product.images.length > 1 && (
                <>
                  <button className="pd-img-nav prev" onClick={prevImg}><ChevronLeft size={16} /></button>
                  <button className="pd-img-nav next" onClick={nextImg}><ChevronRight size={16} /></button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="pd-thumbs">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`pd-thumb${imgIdx === i ? ' active' : ''}`}
                    onClick={() => setImgIdx(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className="pd-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pd-info-top">
              {product.brand?.trim() && <p className="pd-brand">{product.brand.trim()}</p>}
              <h1 className="pd-name">{product.name}</h1>
              <div className="pd-price-row">
                <span className="pd-price">GHC {product.price.toFixed(2)}</span>
                <span className="pd-stock">
                  <span className={`pd-stock-dot ${product.stock > 10 ? 'in' : 'low'}`} />
                  {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="pd-desc">{product.description || 'No description available.'}</p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="pd-section-label">
                  Color {selColor && <span style={{ fontWeight: 400, color: '#aaa', letterSpacing: '0.04em', textTransform: 'none' }}>— {selColor}</span>}
                </p>
                <div className="pd-colors">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      className={`pd-color-btn${selColor === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setSelColor(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="pd-section-label">Quantity</p>
              <div className="pd-qty-row">
                <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="pd-qty-val">{qty}</span>
                <button className="pd-qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <motion.button
                className={`pd-add-btn${addedAnim ? ' added' : ''}`}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
              >
                {addedAnim
                  ? <><Check size={16} strokeWidth={2.5} /> Added to Cart!</>
                  : <><ShoppingCart size={16} strokeWidth={2} /> Add to Cart — GHC {(product.price * qty).toFixed(2)}</>
                }
              </motion.button>

              {inCart && (
                <motion.button
                  className="pd-view-cart-btn"
                  onClick={() => setCartOpen(true)}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ShoppingCart size={15} strokeWidth={2} />
                  View Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
                </motion.button>
              )}
            </div>

            {/* Perks */}
            <div className="pd-perks">
              {[
                { icon: Package,   text: 'Free delivery on orders over GHC 200' },
                { icon: RefreshCw, text: '30-day hassle-free returns' },
                { icon: Shield,    text: 'Secure checkout guaranteed' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="pd-perk">
                  <Icon size={14} strokeWidth={1.8} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="pd-related">
            <div style={{ height: 1, background: 'var(--line)', marginBottom: 40 }} />
            <h2 className="pd-related-title">You may also like</h2>
            <motion.div
              className="pd-related-grid"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            >
              {related.map(p => (
                <motion.div
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                >
                  <Link to={`/product/${p.id}`} className="rel-card" onClick={() => { setImgIdx(0); window.scrollTo(0, 0) }}>
                    <div className="rel-card-img">
                      <img src={p.images[0] || 'https://via.placeholder.com/300'} alt={p.name} />
                    </div>
                    <div className="rel-card-body">
                      <p className="rel-card-name">{p.name}</p>
                      <p className="rel-card-price">GHC {p.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* CART PANEL */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div
                className="cp-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
              />
              <motion.div
                className="cp"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cp-head">
                  <span className="cp-title">Your Cart {cartCount > 0 && `(${cartCount})`}</span>
                  <button className="cp-close" onClick={() => setCartOpen(false)}><X size={18} /></button>
                </div>

                {cart.items.length === 0 ? (
                  <div className="cp-empty">
                    <ShoppingCart size={40} strokeWidth={1} color="#e4e4e4" />
                    <p className="cp-empty-txt">Your cart is empty.</p>
                  </div>
                ) : (
                  <>
                    <div className="cp-items">
                      {cart.items.map(item => (
                        <div key={item.id} className="cp-item">
                          <div className="cp-item-img">
                            <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                          </div>
                          <div className="cp-item-info">
                            <p className="cp-item-name">{item.name}</p>
                            <p className="cp-item-price">GHC {((item.price ?? item.product_price) * item.quantity).toFixed(2)}</p>
                            <div className="cp-item-qty">
                              <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus size={10} strokeWidth={2.5} />
                              </button>
                              <span className="cp-qty-val">{item.quantity}</span>
                              <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus size={10} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                          <button className="cp-remove" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={14} strokeWidth={1.8} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="cp-foot">
                      <div className="cp-total-row">
                        <span className="cp-total-lbl">Total</span>
                        <span className="cp-total-val">GHC {getCartTotal().toFixed(2)}</span>
                      </div>
                      <p className="cp-pay-label">Pay with</p>
                      <div className="cp-pay-options">
                        <button className="cp-pay-btn cp-paystack">
                          <span className="cp-paystack-logo">Pay</span>
                          Pay with Paystack
                        </button>
                        <div className="cp-pay-divider">
                          <div className="cp-pay-divider-line" />
                          <span className="cp-pay-divider-txt">OR</span>
                          <div className="cp-pay-divider-line" />
                        </div>
                        <button className="cp-pay-btn cp-cod">
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
      </div>
    </>
  )
}