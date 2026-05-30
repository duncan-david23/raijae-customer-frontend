import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react'
import { feature_products, about_images } from '../data/products'
// Better social icons from react-icons (not lucide-react)
import { FaInstagram,FaFacebookF,} from 'react-icons/fa'
import raijamLogo from '../assets/raijam_logo.png'
import { RiTwitterXFill } from "react-icons/ri";
import { SiTiktok } from "react-icons/si";


/* ─── responsive hook ─── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13 } },
}
const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? 130 : -130, opacity: 0, scale: 0.82 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   (dir) => ({ x: dir > 0 ? -130 : 130, opacity: 0, scale: 0.82, transition: { duration: 0.32 } }),
}

const SOCIALS = [
  { Icon: FaInstagram, label: 'IG', link: 'https://www.instagram.com/raijam_home_must_haves?igsh=a3hvenF2bWNndWp3' },
  // { Icon: RiTwitterXFill,   label: 'X', link: 'https://twitter.com/' },
  { Icon: FaFacebookF,  label: 'FB', link: 'https://www.facebook.com/share/1NhjeWzQJ2/' },
  { Icon: SiTiktok,     label: 'TT', link: 'https://www.tiktok.com/@raijam_home_must_haves' },

]

export default function Home() {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection]     = useState(1)
  // State for about carousel
  const [aboutSlideIndex, setAboutSlideIndex] = useState(0)

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((p) => (p === 0 ? feature_products.length - 1 : p - 1))
  }
  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((p) => (p === feature_products.length - 1 ? 0 : p + 1))
  }
  const getProduct = (offset) =>
    feature_products[(currentSlide + offset + feature_products.length) % feature_products.length]

  // About carousel controls
  const prevAboutSlide = () => {
    setAboutSlideIndex((prev) => (prev === 0 ? about_images.length - 1 : prev - 1))
  }
  const nextAboutSlide = () => {
    setAboutSlideIndex((prev) => (prev === about_images.length - 1 ? 0 : prev + 1))
  }

  /* ── inline responsive helpers ── */
  const px = isMobile ? '20px' : '48px'


const navigate = useNavigate()


  const handleProductsPage = () => {
    navigate('/products')
  }

  return (
    <>
      {/* global CSS for media queries & resets */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f2f2f0; }
        img { display: block; max-width: 100%; }
        a { text-decoration: none; }

        /* Hide scrollbar but keep scrollable */
        .gallery-scroll {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          gap: 16px;
          padding: 8px 0 16px;
          max-width: 860px;
          margin: 0 auto;
        }
        .gallery-scroll::-webkit-scrollbar {
          display: none;
        }
        .gallery-item {
          flex: 0 0 calc(50% - 8px);
          min-width: calc(50% - 8px);
        }
        @media (max-width: 640px) {
          .gallery-item {
            flex: 0 0 calc(100% - 8px);
            min-width: calc(100% - 8px);
          }
        }

        /* About carousel styles */
        .about-carousel-container {
          max-width: 860px;
          margin: 0 auto;
          position: relative;
        }
        .about-carousel-track {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
        }
        .about-carousel-image {
          flex: 1;
          border-radius: 6px;
          overflow: hidden;
          aspect-ratio: 4/3;
          background: #ccc;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .about-carousel-image:hover {
          transform: scale(1.02);
        }
        .about-carousel-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(10%);
          display: block;
        }
        .about-carousel-nav {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
        }
        .about-carousel-nav button {
          background: transparent;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .about-carousel-nav button:hover {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .about-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }
        .about-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #bbb;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .about-dot.active {
          background: #333;
          width: 18px;
          border-radius: 3px;
        }

        /* Desktop: show 3 images */
        @media (min-width: 641px) {
          .about-carousel-track {
            gap: 24px;
          }
          .about-carousel-image {
            flex: 0 0 calc(33.333% - 16px);
            max-width: calc(33.333% - 16px);
          }
        }
        /* Mobile: show 2 images */
        @media (max-width: 640px) {
          .about-carousel-track {
            gap: 16px;
            padding: 0 10px;
          }
          .about-carousel-image {
            flex: 0 0 calc(50% - 8px);
            max-width: calc(50% - 8px);
          }
        }

        .about-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          max-width: 860px;
          margin: 0 auto 48px;
        }
        @media (max-width: 640px) {
          .about-cols { grid-template-columns: 1fr; gap: 20px; }
        }

        .collection-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 48px;
          margin-bottom: 28px;
        }
        @media (max-width: 640px) {
          .collection-footer { flex-direction: column; align-items: flex-start; gap: 16px; padding: 0 20px; }
        }

        .footer-socials {
          display: flex;
          justify-content: flex-end;
          gap: 18px;
          padding: 0 48px;
          align-items: center;
        }
        @media (max-width: 640px) {
          .footer-socials { justify-content: flex-start; padding: 0 20px; }
        }

        /* hide ghost orbs on small screens */
        .ghost-hide-mobile {
          display: flex;
        }
        @media (max-width: 500px) {
          .ghost-hide-mobile { display: none; }
        }

        /* hero layout */
        .hero-inner {
          position: relative;
          min-height: 92vh;
          background: linear-gradient(145deg, #e4e4e2 0%, #f4f4f2 42%, #d8d8d6 100%);
          overflow: hidden;
          padding-bottom: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 767px) {
          .hero-inner {
            min-height: unset;
            display: flex;
            flex-direction: column;
            padding: 40px 20px 60px;
          }
        }

        /* hero title block — desktop: absolute top-left */
        .hero-title-wrap {
          position: absolute;
          top: 9%;
          left: 40px;
          z-index: 2;
          max-width: 55%;
        }
        @media (max-width: 767px) {
          .hero-title-wrap {
            position: static;
            max-width: 100%;
            margin-bottom: 24px;
            text-align: center;
          }
        }

        /* hero welcome + cta — centered on all devices */
        .hero-mid {
          position: relative;
          z-index: 5;
          max-width: 600px;
          width: 90%;
          margin: 0 auto;
          text-align: center;
          margin-top: 100px;
        }

        /* orb — desktop: absolute right */
        .hero-orb-wrap {
          position: absolute;
          right: 8%;
          top: 50%;
          transform: translateY(-52%);
          z-index: 4;
        }
        @media (max-width: 767px) {
          .hero-orb-wrap {
            position: static;
            transform: none;
            display: flex;
            justify-content: center;
            margin: 0 auto 32px;
          }
        }

        /* bottom strip — desktop: absolute bottom */
        .hero-bottom {
          position: absolute;
          bottom: 32px;
          left: 40px;
          right: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          z-index: 5;
        }
        @media (max-width: 767px) {
          .hero-bottom {
            position: static;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            margin-top: 40px;
          }
        }

        .nav-links-desktop {
          display: flex;
          gap: 32px;
        }
        @media (max-width: 640px) {
          .nav-links-desktop { display: none; }
        }

        /* Hamburger menu - hidden on lg and md screens (screens wider than 768px), visible only on mobile (768px and below) */
        .mobile-menu {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-menu {
            display: block !important;
          }
        }

        .buy-btn-desktop {
          display: block;
        }
        @media (max-width: 640px) {
          .buy-btn-desktop { display: none; }
        }
      `}</style>

      <div style={s.page}>

        {/* ══════════ NAV ══════════ */}
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={s.nav}
        >
        <div className="flex items-center gap-2">
          <img src={raijamLogo} alt="RAIJAM Logo" className="w-[50px] h-[40px]" />
          <span style={s.navBrand}>RAIJAM</span>
        </div>

          {/* Desktop links */}
          <div className="nav-links-desktop">
            {['HOME', 'ABOUT', 'COLLECTION'].map((l) => (
              <motion.a
                key={l}
                href={`#${l.toLowerCase()}`}
                style={s.navLink}
                whileHover={{ opacity: 0.4 }}
                transition={{ duration: 0.18 }}
              >
                {l}
              </motion.a>
            ))}
          </div>

          {/* Desktop buy button */}
          <motion.button
            className="buy-btn-desktop"
            style={s.buyBtn}
            whileHover={{ background: '#111', color: '#fff' }}
            transition={{ duration: 0.22 }}
            onClick={handleProductsPage}
          >
            SHOP NOW
          </motion.button>

          {/* Mobile hamburger - hidden on lg/md screens, visible on mobile only */}
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            style={s.hamburger}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={s.mobileDrawer}
            >
              {['HOME', 'ABOUT', 'COLLECTION'].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  style={s.mobileNavLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              ))}

                

            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ HERO ══════════ */}
        <section className="hero-inner">

          {/* Brand title */}
          <motion.div
            className="hero-title-wrap"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 style={s.heroTitle}>RAIJAM</h1>
            <p style={s.heroTagline}>Curated Luxury for the Modern Home.</p>
          </motion.div>

          {/* Product orb */}
          <motion.div
            className="hero-orb-wrap"
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              style={s.heroOrb}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={feature_products[0]?.image}
                alt={feature_products[0]?.name || 'Raijam Home Item'}
                style={s.heroOrbImg}
              />
            </motion.div>
          </motion.div>

          {/* Welcome text + CTA — centered and bolded */}
          <motion.div
            className="hero-mid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <p style={{ fontWeight: 'bold', fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: '16px' }}>Welcome to Raijam Home Must Haves.</p>
            <p style={{ ...s.heroDesc, maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
              Discover timeless pieces that transform your living space — from statement furniture
              to artisanal décor, each item chosen for its beauty and craft.
            </p>
            <motion.button
              style={{ ...s.shopBtn, display: 'inline-block', marginTop: '20px' }}
              whileHover={{ background: '#111', color: '#fff', borderColor: '#111' }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.22 }}
               onClick={handleProductsPage}
            >
              SHOP WITH US
            </motion.button>
          </motion.div>

          {/* Bottom bar */}
          <motion.div
            className="hero-bottom"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <p style={s.heroSubtext}>
              Where Timeless Elegance Meets Everyday Living.<br />
              Every corner tells a story.
            </p>
            <div style={s.heroSocials}>
              {SOCIALS.map(({ Icon }, i) => (
                <motion.a
                  key={i}
                  href={SOCIALS[i].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.socialLink}
                  whileHover={{ scale: 1.3, color: '#000' }}
                  transition={{ duration: 0.18 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Scroll cue */}
          <motion.button
            style={s.scrollCue}
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.12 }}
          >
            <ChevronDown size={18} strokeWidth={1.5} />
          </motion.button>
        </section>

        {/* ══════════ ABOUT ══════════ */}
        <section id="about" style={{ ...s.about, padding: `80px ${px}` }}>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2 variants={fadeUp} style={s.sectionTitle}>ABOUT US</motion.h2>
            <motion.p variants={fadeUp} style={s.sectionSubtitle}>
              Home, in its most beautiful form.
            </motion.p>

            <motion.div variants={stagger} className="about-cols">
              <motion.p variants={fadeUp} style={s.aboutText}>
                Raijam was founded with a singular vision — to bring luxury home goods within reach
                of those who believe their living space deserves the finest. From hand-crafted vases
                to designer lighting, every item in our collection is sourced for quality and beauty.
              </motion.p>
              <motion.p variants={fadeUp} style={s.aboutText}>
                We partner with artisans and independent designers from around the world to offer
                pieces that are truly one-of-a-kind. Whether you're redecorating or gifting, Raijam
                is your trusted destination for elevated home must-haves.
              </motion.p>
            </motion.div>

            {/* About Carousel - Shows 3 images on desktop, 2 on mobile */}
            <motion.div 
              variants={fadeUp}
              className="about-carousel-container"
            >
              <div className="about-carousel-track">
                {about_images.slice(aboutSlideIndex, aboutSlideIndex + (isMobile ? 2 : 3)).map((product, idx) => (
                  <motion.div
                    key={idx}
                    className="about-carousel-image"
                    whileHover={{ scale: 1.03, boxShadow: '0 16px 40px rgba(0,0,0,0.14)' }}
                    transition={{ duration: 0.28 }}
                  >
                    <img src={product.image} alt={product.name} />
                  </motion.div>
                ))}
                {/* Handle wrap-around for last slides */}
                {(aboutSlideIndex + (isMobile ? 2 : 3)) > about_images.length && 
                  about_images.slice(0, (aboutSlideIndex + (isMobile ? 2 : 3)) - about_images.length).map((product, idx) => (
                    <motion.div
                      key={`wrap-${idx}`}
                      className="about-carousel-image"
                      whileHover={{ scale: 1.03, boxShadow: '0 16px 40px rgba(0,0,0,0.14)' }}
                      transition={{ duration: 0.28 }}
                    >
                      <img src={product.image} alt={product.name} />
                    </motion.div>
                  ))
                }
              </div>
              <div className="about-carousel-nav">
                <motion.button
                  onClick={prevAboutSlide}
                  whileHover={{ background: '#111', color: '#fff', borderColor: '#111' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={14} /> PREV
                </motion.button>
                <motion.button
                  onClick={nextAboutSlide}
                  whileHover={{ background: '#111', color: '#fff', borderColor: '#111' }}
                  whileTap={{ scale: 0.95 }}
                >
                  NEXT <ChevronRight size={14} />
                </motion.button>
              </div>
              <div className="about-dots">
                {Array.from({ length: Math.ceil(about_images.length / (isMobile ? 2 : 3)) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`about-dot ${Math.floor(aboutSlideIndex / (isMobile ? 2 : 3)) === idx ? 'active' : ''}`}
                    onClick={() => setAboutSlideIndex(idx * (isMobile ? 2 : 3))}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════ COLLECTION ══════════ */}
        <section id="collection" style={s.collection}>

          <div style={s.carouselRow}>

            {/* Left ghost */}
            <motion.div
              key={`left-${currentSlide}`}
              className="ghost-hide-mobile"
              style={s.ghostCircle}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <img src={getProduct(-1)?.image} alt={getProduct(-1)?.name} style={s.ghostImg} />
            </motion.div>

            {/* Prev */}
            <motion.button
              onClick={prevSlide}
              style={s.carouselBtn}
              whileHover={{ background: '#111', color: '#fff', borderColor: '#111' }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={15} strokeWidth={2} />
              
            </motion.button>

            {/* Center orb */}
            <div style={s.centerOrbWrap}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={s.centerOrb}
                >
                  <img
                    src={getProduct(0)?.image}
                    alt={getProduct(0)?.name}
                    style={s.centerOrbImg}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next */}
            <motion.button
              onClick={nextSlide}
              style={s.carouselBtn}
              whileHover={{ background: '#111', color: '#fff', borderColor: '#111' }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              
            >
           
              <ChevronRight size={15} strokeWidth={2} />
            </motion.button>

            {/* Right ghost */}
            <motion.div
              key={`right-${currentSlide}`}
              className="ghost-hide-mobile"
              style={s.ghostCircle}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <img src={getProduct(1)?.image} alt={getProduct(1)?.name} style={s.ghostImg} />
            </motion.div>
          </div>

          {/* Product name beneath */}
          <motion.p
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={s.productName}
          >
            {getProduct(0)?.name}
          </motion.p>

          {/* Footer row */}
          <motion.div
            className="collection-footer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={s.collectionTitle}>RAIJAM<br />COLLECTION</h2>

            <div style={s.pagination}>
              {feature_products.map((_, i) => (
                <React.Fragment key={i}>
                  {i === 1 && <span style={s.pageLine}>────────</span>}
                  <motion.span
                    onClick={() => {
                      setDirection(i > currentSlide ? 1 : -1)
                      setCurrentSlide(i)
                    }}
                    style={{
                      ...s.pageNum,
                      fontWeight: i === currentSlide ? '800' : '400',
                      fontSize: i === currentSlide ? '14px' : '12px',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.25 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Social footer */}
          <div className="footer-socials">
            {SOCIALS.map(({ Icon, label }) => (
              <motion.a
                key={label}
                href={SOCIALS.find((s) => s.label === label)?.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={s.footerSocial}
                whileHover={{ scale: 1.2, color: '#000' }}
                transition={{ duration: 0.18 }}
              >
                <Icon size={13} />
                <span style={{ marginLeft: 3 }}>{label}</span>
              </motion.a>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

/* ═══════════════════════════ STYLES ═══════════════════════════ */
const s = {
  page: {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: '#111',
    background: '#f2f2f0',
    minHeight: '100vh',
    overflowX: 'hidden',
  },

  /* NAV */
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 48px',
    background: 'rgba(242,242,240,0.94)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 200,
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  navBrand: {
    fontWeight: '800',
    fontSize: '15px',
    letterSpacing: '0.18em',
    color: '#111',
  },
  navLink: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    color: '#111',
    fontWeight: '500',
  },
  buyBtn: {
    border: '1.5px solid #111',
    background: 'transparent',
    padding: '7px 24px',
    fontSize: '11px',
    letterSpacing: '0.12em',
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '20px',
    color: '#111',
  },
  hamburger: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#111',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  mobileDrawer: {
    position: 'sticky',
    top: '57px',
    zIndex: 190,
    background: '#f2f2f0',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 20px',
    gap: '14px',
    overflow: 'hidden',
  },
  mobileNavLink: {
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    color: '#111',
  },
  mobileShopBtn: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '10px 24px',
    border: '1.5px solid #111',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#111',
    textAlign: 'center',
  },

  /* HERO */
  heroTitle: {
    fontSize: 'clamp(58px, 13vw, 148px)',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    lineHeight: 0.88,
    marginBottom: '12px',
    color: '#111',
  },
  heroTagline: {
    fontSize: '13px',
    letterSpacing: '0.04em',
    color: '#777',
    fontStyle: 'italic',
  },

  /* Welcome + CTA block */
  heroWelcome: {
    fontSize: 'clamp(16px, 2.2vw, 22px)',
    fontWeight: '600',
    color: '#222',
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    marginBottom: '10px',
  },
  heroDesc: {
    fontSize: '12.5px',
    lineHeight: '1.75',
    color: '#666',
    marginBottom: '20px',
  },
  shopBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: '1.5px solid #333',
    background: 'transparent',
    padding: '11px 28px',
    fontSize: '12px',
    letterSpacing: '0.1em',
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '24px',
    color: '#222',
  },

  /* Orb */
  heroOrb: {
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 38% 34%, #ffffff 0%, #e8e8e6 58%, #d2d2d0 100%)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroOrbImg: { width: '230px', height: '230px', objectFit: 'contain' },

  heroSubtext: { fontSize: '12px', lineHeight: '1.75', color: '#777', maxWidth: '220px' },
  heroSocials: { display: 'flex', gap: '16px', alignItems: 'center' },
  socialLink: { color: '#666', display: 'flex', alignItems: 'center' },

  scrollCue: {
    position: 'absolute',
    bottom: '28px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255,255,255,0.55)',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 6,
    color: '#666',
  },

  /* ABOUT */
  about: { background: '#f2f2f0' },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '0.14em',
    marginBottom: '8px',
  },
  sectionSubtitle: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#888',
    marginBottom: '44px',
    letterSpacing: '0.04em',
  },
  aboutText: { fontSize: '12.5px', lineHeight: '1.9', color: '#555', textAlign: 'center' },

  galleryItem: {
    borderRadius: '6px',
    overflow: 'hidden',
    aspectRatio: '4/3',
    background: '#ccc',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  galleryImg: { width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(10%)', display: 'block' },

  /* COLLECTION */
  collection: { background: '#ebebea', padding: '60px 0 40px', overflow: 'hidden' },

  carouselRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '12px',
    padding: '0 16px',
  },

  ghostCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.38)',
    border: '1px solid rgba(255,255,255,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  },
  ghostImg: { width: '88px', height: '88px', objectFit: 'contain', opacity: 0.55 },

  carouselBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.18)',
    borderRadius: '20px',
    padding: '8px 14px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    color: '#333',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },

  centerOrbWrap: {
    position: 'relative',
    width: '230px',
    height: '230px',
    flexShrink: 0,
  },
  centerOrb: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ffffff 0%, #eeeeec 100%)',
    boxShadow: '0 24px 72px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerOrbImg: { width: '175px', height: '175px', objectFit: 'contain' },

  productName: {
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.06em',
    color: '#444',
    marginBottom: '36px',
  },

  collectionTitle: { fontSize: '28px', fontWeight: '900', letterSpacing: '-0.01em', lineHeight: 1.1 },
  pagination: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' },
  pageLine: { color: '#bbb', letterSpacing: '-3px', fontSize: '10px' },
  pageNum: { transition: 'all 0.2s', userSelect: 'none', color: '#444' },

  footerSocial: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  },
}