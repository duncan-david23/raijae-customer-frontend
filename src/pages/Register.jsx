import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Home, User } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function Register() {
  const [form, setForm] = useState({ 
    name: '',
    email: '', 
    password: '', 
    confirm: '' 
  })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [focused, setFocused] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }))

  const validate = () => {
    const e = {}
    
    if (!form.name) {
      e.name = 'Full name is required.'
    } else if (form.name.length < 2) {
      e.name = 'Name must be at least 2 characters.'
    }
    
    if (!form.email) {
      e.email = 'Email is required.'
    } else if (!form.email.includes('@')) {
      e.email = 'Enter a valid email address.'
    }
    
    if (!form.password) {
      e.password = 'Password is required.'
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.'
    }
    
    if (!form.confirm) {
      e.confirm = 'Please confirm your password.'
    } else if (form.confirm !== form.password) {
      e.confirm = 'Passwords do not match.'
    }
    
    return e
  }


  const handleSubmit = async (e) => {
  e.preventDefault()
  
  setMsg('')
  
  const errs = validate()
  if (Object.keys(errs).length) {
    setErrors(errs)
    return
  }
  
  setErrors({})
  setIsLoading(true)
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          role: 'customer'
        },
      }
    })
    
    if (error) {
      if (error.message.includes('User already registered')) {
        setMsg('An account with this email already exists. Please sign in instead.')
      } else if (error.message.includes('Password should be')) {
        setMsg('Password is too weak. Please use a stronger password.')
      } else {
        setMsg(error.message)
      }
      setIsLoading(false)
      return
    }
    
    const userId = data.user?.id;
    
    if (!userId) {
      setMsg('Error: Could not retrieve user information.')
      setIsLoading(false)
      return;
    }

    // Get the session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Add user profile to your backend with the token in headers
    const response = await axios.post('http://172.20.10.3:5000/api/users/profile/add-profile', {
      email: form.email,
      full_name: form.name,
      role: 'customer',
      user_id: userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    setSubmitted(true)
    
    setTimeout(() => {
      navigate('/products')
    }, 3000)
    
  } catch (error) {
    console.error('Error signing up:', error)
    setMsg('An unexpected error occurred. Please try again.')
  } finally {
    setIsLoading(false)
  }
}


  

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((er) => {
        const n = { ...er }
        delete n[field]
        return n
      })
    }
    if (msg) setMsg('')
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f2f2f0; }

        .rj-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: #f2f2f0;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .rj-page { grid-template-columns: 1fr; }
          .rj-panel { display: none !important; }
        }

        /* Left decorative panel */
        .rj-panel {
          position: relative;
          background: linear-gradient(145deg, #1a1a18 0%, #2e2e2b 55%, #1c1c1a 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          overflow: hidden;
        }
        .rj-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 60%, rgba(200,185,160,0.08) 0%, transparent 65%),
                      radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%);
        }
        .rj-orb {
          position: absolute;
          right: -80px;
          top: 50%;
          transform: translateY(-50%);
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 34%, rgba(255,255,255,0.06) 0%, rgba(200,185,160,0.04) 60%, transparent 100%);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .rj-orb-inner {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 34%, rgba(255,255,255,0.1) 0%, rgba(200,185,160,0.06) 60%, transparent 100%);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Form side */
        .rj-form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          background: #f2f2f0;
          position: relative;
          overflow-y: auto;
          max-height: 100vh;
        }
        @media (max-width: 480px) {
          .rj-form-side { padding: 40px 24px; }
        }
        .rj-form-side::after {
          content: 'RAIJAM';
          position: absolute;
          bottom: -20px;
          right: -10px;
          font-size: 120px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: rgba(0,0,0,0.04);
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
        }

        /* Input group */
        .rj-field {
          position: relative;
          margin-bottom: 6px;
        }
        .rj-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(0,0,0,0.18);
          padding: 16px 44px 10px 0;
          font-size: 14px;
          font-family: inherit;
          color: #111;
          outline: none;
          transition: border-color 0.25s;
          letter-spacing: 0.02em;
        }
        .rj-input:focus {
          border-bottom-color: #111;
        }
        .rj-input.error {
          border-bottom-color: #c0392b;
        }
        .rj-label {
          position: absolute;
          left: 0;
          top: 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #999;
          text-transform: uppercase;
          pointer-events: none;
          transition: all 0.22s ease;
        }
        .rj-input:focus ~ .rj-label,
        .rj-input.filled ~ .rj-label {
          top: 0px;
          font-size: 9px;
          color: #555;
          letter-spacing: 0.16em;
        }
        .rj-eye {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .rj-eye:hover { color: #111; }
        .rj-error-msg {
          font-size: 10.5px;
          color: #c0392b;
          letter-spacing: 0.04em;
          margin-bottom: 16px;
          padding-left: 1px;
        }
        .rj-success-msg {
          font-size: 10.5px;
          color: #27ae60;
          letter-spacing: 0.04em;
          margin-bottom: 16px;
          padding-left: 1px;
          text-align: center;
        }
        .rj-error-msg-global {
          font-size: 10.5px;
          color: #c0392b;
          letter-spacing: 0.04em;
          margin-bottom: 16px;
          padding: 8px;
          background: rgba(192, 57, 43, 0.1);
          border-radius: 4px;
          text-align: center;
        }

        /* Submit button */
        .rj-submit {
          width: 100%;
          background: #111;
          color: #f2f2f0;
          border: none;
          padding: 16px 32px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
          transition: background 0.25s, transform 0.15s;
          font-family: inherit;
        }
        .rj-submit:hover:not(:disabled) { background: #2c2c2a; }
        .rj-submit:active:not(:disabled) { transform: scale(0.985); }
        .rj-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .rj-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .rj-divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.1); }
        .rj-divider-text { font-size: 10px; color: #aaa; letter-spacing: 0.1em; text-transform: uppercase; }

        /* Success screen */
        .rj-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          padding: 40px 0;
        }
        .rj-success-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid #111;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
      `}</style>

      <div className="rj-page">

        {/* ── LEFT PANEL ── */}
        <div className="rj-panel">
          <div className="rj-orb" />
          <div className="rj-orb-inner">
            <Home size={32} color="rgba(255,255,255,0.25)" strokeWidth={1} />
          </div>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.2em', color: '#f2f2f0', marginBottom: '12px' }}>
              RAIJAM
            </div>
            <div style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
              Curated Luxury for the Modern Home.
            </div>
          </motion.div>

          {/* Middle quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative', zIndex: 2, maxWidth: '280px' }}
          >
            <div style={{ width: '28px', height: '2px', background: 'rgba(200,185,160,0.6)', marginBottom: '20px' }} />
            <p style={{ fontSize: '22px', fontWeight: '300', color: 'rgba(255,255,255,0.82)', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              "Every corner of your home deserves to tell a story."
            </p>
            <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              — RAIJAM PHILOSOPHY
            </p>
          </motion.div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', lineHeight: 1.8 }}>
              JOIN THOUSANDS OF HOMEOWNERS<br />
              WHO TRUST RAIJAM.
            </p>
          </motion.div>
        </div>

        {/* ── FORM SIDE ── */}
        <div className="rj-form-side">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* Success state */
              <motion.div
                key="success"
                className="rj-success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="rj-success-ring"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                >
                  ✓
                </motion.div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: '#111' }}>
                  Welcome, {form.name.split(' ')[0]}!
                </h2>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, maxWidth: '260px' }}>
                  Your account has been created successfully. Redirecting you to the shop...
                </p>
                <motion.button
                  onClick={() => navigate('/products')}
                  style={{
                    marginTop: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.14em',
                    color: '#111',
                    borderBottom: '1.5px solid #111',
                    paddingBottom: '2px',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ gap: '14px' }}
                  transition={{ duration: 0.2 }}
                >
                  SHOP NOW <ArrowRight size={13} />
                </motion.button>
              </motion.div>
            ) : (
              /* Register form */
              <motion.div
                key="form"
                initial="hidden"
                animate="show"
                style={{ position: 'relative', zIndex: 2, maxWidth: '380px', width: '100%', margin: '0 auto' }}
              >
                {/* Header */}
                <motion.div variants={fadeUp} custom={0} style={{ marginBottom: '40px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase', marginBottom: '10px' }}>
                    New Account
                  </p>
                  <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: '900', letterSpacing: '-0.03em', color: '#111', lineHeight: 0.95 }}>
                    Create your<br />
                    <span style={{ fontWeight: '300', fontStyle: 'italic' }}>Raijam</span> account.
                  </h1>
                </motion.div>

                {/* Global error message */}
                {msg && (
                  <motion.div
                    variants={fadeUp}
                    custom={0.5}
                    className="rj-error-msg-global"
                  >
                    {msg}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                  {/* Full Name */}
                  <motion.div variants={fadeUp} custom={1}>
                    <div className="rj-field" style={{ marginBottom: errors.name ? '4px' : '28px' }}>
                      <input
                        type="text"
                        className={`rj-input${form.name ? ' filled' : ''}${errors.name ? ' error' : ''}`}
                        value={form.name}
                        onChange={handleChange('name')}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused('')}
                        autoComplete="name"
                        required
                      />
                      <label className="rj-label">Full Name</label>
                      <User size={15} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    </div>
                    {errors.name && <p className="rj-error-msg">{errors.name}</p>}
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fadeUp} custom={2}>
                    <div className="rj-field" style={{ marginBottom: errors.email ? '4px' : '28px' }}>
                      <input
                        type="email"
                        className={`rj-input${form.email ? ' filled' : ''}${errors.email ? ' error' : ''}`}
                        value={form.email}
                        onChange={handleChange('email')}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused('')}
                        autoComplete="email"
                        required
                      />
                      <label className="rj-label">Email Address</label>
                    </div>
                    {errors.email && <p className="rj-error-msg">{errors.email}</p>}
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={fadeUp} custom={3}>
                    <div className="rj-field" style={{ marginBottom: errors.password ? '4px' : '28px' }}>
                      <input
                        type={show.password ? 'text' : 'password'}
                        className={`rj-input${form.password ? ' filled' : ''}${errors.password ? ' error' : ''}`}
                        value={form.password}
                        onChange={handleChange('password')}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused('')}
                        autoComplete="new-password"
                        required
                      />
                      <label className="rj-label">Password</label>
                      <button type="button" className="rj-eye" onClick={() => toggle('password')} tabIndex={-1}>
                        {show.password ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.password && <p className="rj-error-msg">{errors.password}</p>}
                  </motion.div>

                  {/* Confirm password */}
                  <motion.div variants={fadeUp} custom={4}>
                    <div className="rj-field" style={{ marginBottom: errors.confirm ? '4px' : '32px' }}>
                      <input
                        type={show.confirm ? 'text' : 'password'}
                        className={`rj-input${form.confirm ? ' filled' : ''}${errors.confirm ? ' error' : ''}`}
                        value={form.confirm}
                        onChange={handleChange('confirm')}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused('')}
                        autoComplete="new-password"
                        required
                      />
                      <label className="rj-label">Confirm Password</label>
                      <button type="button" className="rj-eye" onClick={() => toggle('confirm')} tabIndex={-1}>
                        {show.confirm ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.confirm && <p className="rj-error-msg">{errors.confirm}</p>}
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={fadeUp} custom={5}>
                    <motion.button
                      type="submit"
                      className="rj-submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { gap: '16px' } : {}}
                      whileTap={!isLoading ? { scale: 0.985 } : {}}
                    >
                      {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                      {!isLoading && <ArrowRight size={14} strokeWidth={2} />}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div variants={fadeUp} custom={6} className="rj-divider">
                  <div className="rj-divider-line" />
                  <span className="rj-divider-text">or</span>
                  <div className="rj-divider-line" />
                </motion.div>

                {/* Sign in link */}
                <motion.p
                  variants={fadeUp}
                  custom={7}
                  style={{ fontSize: '11.5px', color: '#888', letterSpacing: '0.04em', textAlign: 'center' }}
                >
                  Already have an account?{' '}
                  <motion.a
                    href="/login"
                    style={{
                      color: '#111',
                      fontWeight: '700',
                      letterSpacing: '0.06em',
                      borderBottom: '1.5px solid #111',
                      paddingBottom: '1px',
                      textDecoration: 'none'
                    }}
                    whileHover={{ opacity: 0.55 }}
                    transition={{ duration: 0.18 }}
                  >
                    Sign in
                  </motion.a>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}