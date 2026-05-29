import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight,
  Check, Package, RefreshCw, Shield, User
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE_URL = 'http://172.20.10.3:5000/api/users'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const {
    addToCart,
    isInCart,
    getCartItemsCount,
    cartOpen,
    setCartOpen,
  } = useCart()

  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [addedAnim, setAddedAnim] = useState(false)
  const [selColor, setSelColor] = useState(null)

  // Fetch product from backend
  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(`${API_BASE_URL}/products/product/${id}`)
      
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
        const relatedResponse = await axios.get(`${API_BASE_URL}/products`)
        const allProducts = relatedResponse.data.products.map(p => ({
          id: p.id,
          name: p.product_name,
          price: p.product_price,
          images: p.product_images || [],
          category: p.product_categories || []
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

  // ✅ FIXED: Add selected color to cart item
  const handleAddToCart = () => {
    if (!product) return;
    
    // Create a copy of the product with the selected color
    const productWithColor = {
      ...product,
      selectedColor: selColor,  // Store selected color
      color: selColor           // Also store as 'color' for compatibility
    };
    
    for (let i = 0; i < qty; i++) addToCart(productWithColor);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1600);
    
  }

  const prevImg = () => setImgIdx(i => (i === 0 ? product.images.length - 1 : i - 1))
  const nextImg = () => setImgIdx(i => (i === product.images.length - 1 ? 0 : i + 1))

  const cartCount = getCartItemsCount()
  const inCart = product ? isInCart(product.id) : false

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-900">{error || 'Product not found.'}</p>
        <Link to="/products" className="text-sm text-gray-500 underline mt-2">Back to collection</Link>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        
        .pd { background: #f5f5f5; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        
        .pd-nav {
          height: 58px; display: flex; align-items: center;
          padding: 0 32px; gap: 16px;
          background: white; border-bottom: 1px solid #e4e4e4;
          position: sticky; top: 0; z-index: 200;
        }
        @media(max-width:640px){ .pd-nav { padding: 0 14px; } }
        
        .pd-nav-brand {
          font-family: 'Playfair Display', serif; font-size: 19px;
          font-weight: 900; letter-spacing: -0.02em;
          color: #111; text-decoration: none;
        }
        
        .pd-nav-right { margin-left: auto; display: flex; align-items: center; gap: 0; }
        
        .pd-icon-btn {
          width: 36px; height: 36px; border-radius: 6px;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #444; transition: background .14s;
          position: relative;
        }
        .pd-icon-btn:hover { background: #f0f0f0; color: #111; }
        
        .pd-cart-badge {
          position: absolute; top: 2px; right: 2px;
          width: 15px; height: 15px; border-radius: 50%;
          background: #111; color: #fff;
          font-size: 8px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        
        .pd-crumb {
          padding: 14px 32px;
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #777;
          border-bottom: 1px solid #e4e4e4;
          background: white;
        }
        @media(max-width:640px){ .pd-crumb { padding: 12px 16px; } }
        
        .pd-crumb a { color: #777; text-decoration: none; }
        .pd-crumb a:hover { color: #111; }
        .pd-crumb-sep { color: #e4e4e4; }
        
        .pd-main {
          display: grid; grid-template-columns: 1fr 1fr;
          max-width: 1200px; margin: 0 auto;
          padding: 40px 32px; gap: 48px;
        }
        @media(max-width:768px){
          .pd-main { grid-template-columns: 1fr; padding: 24px 16px; gap: 28px; }
        }
        
        .pd-main-img-wrap {
          position: relative; overflow: hidden;
          border-radius: 12px; background: white;
          border: 1px solid #e4e4e4; aspect-ratio: 1/1;
          margin-bottom: 12px;
        }
        
        .pd-main-img {
          width: 100%; height: 100%; object-fit: contain; padding: 24px;
        }
        
        .pd-img-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border: 1px solid #e4e4e4; border-radius: 50%;
          width: 36px; height: 36px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #444;
        }
        .pd-img-nav:hover { background: white; color: #111; }
        .pd-img-nav.prev { left: 12px; }
        .pd-img-nav.next { right: 12px; }
        
        .pd-thumbs {
          display: flex; gap: 8px; overflow-x: auto;
        }
        .pd-thumbs::-webkit-scrollbar { display: none; }
        
        .pd-thumb {
          flex-shrink: 0; width: 64px; height: 64px; border-radius: 8px;
          background: white; border: 1.5px solid transparent;
          overflow: hidden; cursor: pointer;
        }
        .pd-thumb.active { border-color: #111; }
        .pd-thumb img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
        
        .pd-info { display: flex; flex-direction: column; gap: 20px; }
        
        .pd-info-top { padding-bottom: 20px; border-bottom: 1px solid #e4e4e4; }
        .pd-brand {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #777; margin-bottom: 8px;
        }
        .pd-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3.5vw, 34px);
          font-weight: 900; line-height: 1.1; color: #111;
        }
        .pd-price-row { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
        .pd-price {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700; color: #111;
        }
        .pd-stock {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
          background: #f0f0f0;
        }
        .pd-stock-dot { width: 5px; height: 5px; border-radius: 50%; }
        .pd-stock-dot.in { background: #3a3a3a; }
        .pd-stock-dot.low { background: #aaa; }
        
        .pd-desc { font-size: 13.5px; line-height: 1.75; color: #444; }
        
        .pd-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: #777; margin-bottom: 10px;
        }
        
        .pd-colors { display: flex; gap: 8px; flex-wrap: wrap; }
        .pd-color-btn {
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          border: 2.5px solid transparent;
        }
        .pd-color-btn.selected { border-color: #111; transform: scale(1.12); }
        
        .pd-qty-row { display: flex; align-items: center; gap: 8px; }
        .pd-qty-btn {
          width: 32px; height: 32px; border-radius: 6px;
          background: #f0f0f0; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #444;
        }
        .pd-qty-btn:hover { background: #e4e4e4; }
        .pd-qty-val {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #111;
          min-width: 28px; text-align: center;
        }
        
        .pd-add-btn {
          width: 100%; background: #111; color: #fff;
          border: none; padding: 15px 24px; border-radius: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .pd-add-btn:hover { background: #2c2c2a; }
        .pd-add-btn.added { background: #2c2c2a; }
        
        .pd-view-cart-btn {
          width: 100%; background: transparent; color: #111;
          border: 1.5px solid #111; padding: 13px 24px; border-radius: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
        }
        .pd-view-cart-btn:hover { background: #111; color: #fff; }
        
        .pd-perks { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        .pd-perk { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #444; }
        
        .pd-related { padding: 48px 32px 64px; max-width: 1200px; margin: 0 auto; }
        .pd-related-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #111;
          margin-bottom: 20px;
        }
        .pd-related-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
        }
        @media(max-width:900px){ .pd-related-grid { grid-template-columns: repeat(2, 1fr); } }
        
        .rel-card {
          background: white; border-radius: 8px;
          border: 1px solid #e4e4e4; overflow: hidden;
          text-decoration: none; color: #111;
          display: flex; flex-direction: column;
        }
        .rel-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .rel-card-img { aspect-ratio: 1/1; background: #f8f8f8; overflow: hidden; }
        .rel-card-img img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
        .rel-card-body { padding: 9px 10px 12px; }
        .rel-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 12.5px; font-weight: 700; color: #111;
          line-height: 1.3;
        }
        .rel-card-price {
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: #777;
          margin-top: 4px;
        }
      `}</style>

      <div className="pd">
        <nav className="pd-nav">
          <Link to="/products" className="pd-nav-brand">RAIJAM</Link>
          <div className="pd-nav-right">
            <Link to="/account" className="pd-icon-btn" aria-label="Account">
              <User size={17} strokeWidth={1.8} />
            </Link>
            <button
              className="pd-icon-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="pd-cart-badge">{cartCount}</span>
              )}
            </button>
          </div>
        </nav>

        <div className="pd-crumb">
          <Link to="/products">Collection</Link>
          <span className="pd-crumb-sep">/</span>
          <span style={{ color: '#aaa' }}>{product.category?.[0] || 'Products'}</span>
          <span className="pd-crumb-sep">/</span>
          <span style={{ color: '#111', fontWeight: 500 }}>{product.name}</span>
        </div>

        <div className="pd-main">
          <div className="pd-images">
            <div className="pd-main-img-wrap">
              <img
                src={product.images[imgIdx] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="pd-main-img"
              />
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
                    className={`pd-thumb ${imgIdx === i ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
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

            <p className="pd-desc">{product.description || 'No description available.'}</p>

            {product.colors?.length > 0 && (
              <div>
                <p className="pd-section-label">
                  Color {selColor && <span style={{ fontWeight: 400, color: '#aaa' }}>— {selColor}</span>}
                </p>
                <div className="pd-colors">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      className={`pd-color-btn ${selColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setSelColor(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className={`pd-add-btn ${addedAnim ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {addedAnim
                  ? <><Check size={16} /> Added to Cart!</>
                  : <><ShoppingCart size={16} /> Add to Cart — GHC {(product.price * qty).toFixed(2)}</>
                }
              </button>

              {inCart && (
                <button
                  className="pd-view-cart-btn"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart size={15} />
                  View Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
                </button>
              )}
            </div>

            <div className="pd-perks">
              <div className="pd-perk"><Package size={14} /><span>Free delivery on orders over GHC 200</span></div>
              <div className="pd-perk"><RefreshCw size={14} /><span>30-day hassle-free returns</span></div>
              <div className="pd-perk"><Shield size={14} /><span>Secure checkout guaranteed</span></div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="pd-related">
            <div style={{ height: 1, background: '#e4e4e4', marginBottom: 40 }} />
            <h2 className="pd-related-title">You may also like</h2>
            <div className="pd-related-grid">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="rel-card" onClick={() => { setImgIdx(0); window.scrollTo(0, 0) }}>
                  <div className="rel-card-img">
                    <img src={p.images[0] || 'https://via.placeholder.com/300'} alt={p.name} />
                  </div>
                  <div className="rel-card-body">
                    <p className="rel-card-name">{p.name}</p>
                    <p className="rel-card-price">GHC {p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}