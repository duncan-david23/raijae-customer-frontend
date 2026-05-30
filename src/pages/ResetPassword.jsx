import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Sparkles, Key, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [sessionValid, setSessionValid] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState('')
  const navigate = useNavigate()

  // Check if session is valid (user came from reset link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSessionValid(false)
        setMsg('Session expired or invalid reset link. Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }
    checkSession()
  }, [navigate])

  const validate = () => {
    const e = {}
    
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

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return ''
    if (pwd.length < 6) return 'weak'
    if (pwd.length < 8) return 'medium'
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 'strong'
    return 'medium'
  }

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 'weak': return '#c0392b'
      case 'medium': return '#f59e0b'
      case 'strong': return '#27ae60'
      default: return '#999'
    }
  }

  const getStrengthText = () => {
    switch(passwordStrength) {
      case 'weak': return 'Weak'
      case 'medium': return 'Medium'
      case 'strong': return 'Strong'
      default: return ''
    }
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    
    setMsg('')
    
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    
    setErrors({})
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: form.password,
      })
      
      if (error) {
        if (error.message.includes('Password should be')) {
          setMsg('Password is too weak. Please use a stronger password.')
        } else {
          setMsg(error.message)
        }
        setIsLoading(false)
        return
      }
      
      setSubmitted(true)
      
      setTimeout(() => {
        navigate('/login')
      }, 3000)
      
    } catch (error) {
      console.error('Error resetting password:', error)
      setMsg('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleChange = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }))
    if (errors[field]) {
      setErrors((er) => {
        const n = { ...er }
        delete n[field]
        return n
      })
    }
    if (msg) setMsg('')
  }

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(form.password))
  }, [form.password])

  const passwordRequirements = [
    { text: "At least 8 characters", met: form.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(form.password) },
    { text: "Contains number", met: /[0-9]/.test(form.password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(form.password) },
  ]

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

        .rj-form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          background: #f2f2f0;
          position: relative;
          overflow: hidden;
          order: 1;
        }
        @media (max-width: 768px) { .rj-form-side { order: 0; } }
        @media (max-width: 480px) { .rj-form-side { padding: 40px 24px; } }

        .rj-form-side::after {
          content: 'RAIJAM';
          position: absolute;
          bottom: -20px;
          left: -10px;
          font-size: 120px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: rgba(0,0,0,0.04);
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
        }

        .rj-panel {
          position: relative;
          background: linear-gradient(145deg, #1a1a18 0%, #2e2e2b 55%, #1c1c1a 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          overflow: hidden;
          order: 2;
        }
        @media (max-width: 768px) { .rj-panel { order: 1; } }

        .rj-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 70% 60%, rgba(200,185,160,0.09) 0%, transparent 65%),
            radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.04) 0%, transparent 50%);
        }
        .rj-orb {
          position: absolute;
          left: -80px;
          top: 50%;
          transform: translateY(-50%);
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle at 62% 34%, rgba(255,255,255,0.06) 0%, rgba(200,185,160,0.04) 60%, transparent 100%);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .rj-orb-inner {
          position: absolute;
          left: 40px;
          top: 50%;
          transform: translateY(-50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle at 62% 34%, rgba(255,255,255,0.1) 0%, rgba(200,185,160,0.06) 60%, transparent 100%);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rj-dot {
          position: absolute;
          border-radius: 50%;
          background: rgba(200,185,160,0.15);
          pointer-events: none;
        }

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
        .rj-input:focus { border-bottom-color: #111; }
        .rj-input.error { border-bottom-color: #c0392b; }

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
          top: 0;
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
          font-family: inherit;
          transition: background 0.25s;
        }
        .rj-submit:hover:not(:disabled) { background: #2c2c2a; }
        .rj-submit:active:not(:disabled) { transform: scale(0.985); }
        .rj-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .rj-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .rj-divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.1); }
        .rj-divider-text { font-size: 10px; color: #aaa; letter-spacing: 0.1em; text-transform: uppercase; }

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
          font-size: 26px;
        }

        .rj-strength-bar {
          height: 2px;
          border-radius: 2px;
          transition: width 0.3s ease;
          margin-top: 8px;
        }
        .rj-req-item {
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
      `}</style>

      <div className="rj-page">

        {/* ══════════ FORM SIDE ══════════ */}
        <div className="rj-form-side">
          <AnimatePresence mode="wait">

            {submitted ? (

              /* ── Success state ── */
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
                  <CheckCircle size={32} strokeWidth={1.5} />
                </motion.div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: '#111' }}>
                  Password Reset!
                </h2>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, maxWidth: '280px' }}>
                  Your password has been successfully reset. Redirecting you to sign in...
                </p>
                <motion.button
                  onClick={() => navigate('/login')}
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
                  SIGN IN NOW <ArrowRight size={13} />
                </motion.button>
              </motion.div>

            ) : (

              /* ── Reset Password form ── */
              <motion.div
                key="form"
                initial="hidden"
                animate="show"
                style={{ position: 'relative', zIndex: 2, maxWidth: '380px', width: '100%' }}
              >

                {/* Header */}
                <motion.div variants={fadeUp} custom={0} style={{ marginBottom: '44px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: '700', letterSpacing: '0.2em',
                    color: '#aaa', textTransform: 'uppercase', marginBottom: '10px',
                  }}>
                    Create New Password
                  </p>
                  <h1 style={{
                    fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: '900',
                    letterSpacing: '-0.03em', color: '#111', lineHeight: 0.95,
                  }}>
                    Reset your<br />
                    <span style={{ fontWeight: '300', fontStyle: 'italic' }}>password</span>
                  </h1>
                </motion.div>

                {/* Session Expired Warning */}
                {!sessionValid && (
                  <motion.div
                    variants={fadeUp}
                    custom={0.5}
                    className="rj-error-msg-global"
                    style={{ background: 'rgba(192,57,43,0.1)', color: '#c0392b' }}
                  >
                    <AlertCircle size={12} style={{ display: 'inline', marginRight: '6px' }} />
                    {msg}
                  </motion.div>
                )}

                {/* Global error message */}
                {msg && sessionValid && (
                  <motion.div
                    variants={fadeUp}
                    custom={0.5}
                    className="rj-error-msg-global"
                  >
                    {msg}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                  {/* New Password */}
                  <motion.div variants={fadeUp} custom={1} style={{ marginBottom: errors.password ? '4px' : '28px' }}>
                    <div className="rj-field">
                      <Key size={15} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input
                        type={show.password ? 'text' : 'password'}
                        className={`rj-input${form.password ? ' filled' : ''}${errors.password ? ' error' : ''}`}
                        value={form.password}
                        onChange={handleChange('password')}
                        autoComplete="new-password"
                        required
                        disabled={!sessionValid}
                      />
                      <label className="rj-label">New Password</label>
                      <button
                        type="button"
                        className="rj-eye"
                        onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                        tabIndex={-1}
                        disabled={!sessionValid}
                      >
                        {show.password ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.password && <p className="rj-error-msg">{errors.password}</p>}
                    
                    {/* Password strength indicator */}
                    {form.password && (
                      <div style={{ marginTop: '12px' }}>
                        <div className="rj-strength-bar" style={{ width: form.password.length < 6 ? '33%' : form.password.length < 8 ? '66%' : '100%', background: getStrengthColor() }} />
                        <p style={{ fontSize: '9px', color: getStrengthColor(), marginTop: '6px', letterSpacing: '0.05em' }}>
                          {getStrengthText()} password
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={fadeUp} custom={2} style={{ marginBottom: errors.confirm ? '4px' : '28px' }}>
                    <div className="rj-field">
                      <Shield size={15} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input
                        type={show.confirm ? 'text' : 'password'}
                        className={`rj-input${form.confirm ? ' filled' : ''}${errors.confirm ? ' error' : ''}`}
                        value={form.confirm}
                        onChange={handleChange('confirm')}
                        autoComplete="new-password"
                        required
                        disabled={!sessionValid}
                      />
                      <label className="rj-label">Confirm Password</label>
                      <button
                        type="button"
                        className="rj-eye"
                        onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                        tabIndex={-1}
                        disabled={!sessionValid}
                      >
                        {show.confirm ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.confirm && <p className="rj-error-msg">{errors.confirm}</p>}
                  </motion.div>

                  {/* Password Requirements */}
                  {form.password && (
                    <motion.div variants={fadeUp} custom={3} style={{ marginBottom: '28px' }}>
                      <p style={{ fontSize: '9px', color: '#aaa', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Password requirements
                      </p>
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="rj-req-item">
                          <span style={{ color: req.met ? '#27ae60' : '#bbb' }}>{req.met ? '✓' : '○'}</span>
                          <span style={{ fontSize: '9px', color: req.met ? '#27ae60' : '#999' }}>{req.text}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <motion.div variants={fadeUp} custom={4}>
                    <motion.button
                      type="submit"
                      className="rj-submit"
                      disabled={isLoading || !sessionValid}
                      whileHover={!isLoading ? { gap: '16px' } : {}}
                      whileTap={!isLoading ? { scale: 0.985 } : {}}
                    >
                      {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                      {!isLoading && <ArrowRight size={14} strokeWidth={2} />}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div variants={fadeUp} custom={5} className="rj-divider">
                  <div className="rj-divider-line" />
                  <span className="rj-divider-text">or</span>
                  <div className="rj-divider-line" />
                </motion.div>

                {/* Back to login link */}
                <motion.p
                  variants={fadeUp}
                  custom={6}
                  style={{ fontSize: '11.5px', color: '#888', letterSpacing: '0.04em', textAlign: 'center' }}
                >
                  Remember your password?{' '}
                  <motion.a
                    href="/login"
                    style={{
                      color: '#111',
                      fontWeight: '700',
                      letterSpacing: '0.06em',
                      borderBottom: '1.5px solid #111',
                      paddingBottom: '1px',
                    }}
                    whileHover={{ opacity: 0.5 }}
                    transition={{ duration: 0.18 }}
                  >
                    Sign in
                  </motion.a>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ══════════ RIGHT PANEL (decorative) ══════════ */}
        <div className="rj-panel">
          <div className="rj-orb" />
          <div className="rj-orb-inner">
            <Sparkles size={30} color="rgba(255,255,255,0.22)" strokeWidth={1} />
          </div>

          {/* Floating accent dots */}
          {[
            { w: 6,  h: 6,  top: '18%', right: '22%' },
            { w: 10, h: 10, top: '72%', right: '38%' },
            { w: 4,  h: 4,  top: '44%', right: '14%' },
          ].map((d, i) => (
            <motion.div
              key={i}
              className="rj-dot"
              style={{ width: d.w, height: d.h, top: d.top, right: d.right }}
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
            />
          ))}

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <div style={{
              fontSize: '15px', fontWeight: '800', letterSpacing: '0.2em',
              color: '#f2f2f0', marginBottom: '12px',
            }}>
              RAIJAM
            </div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.35)', fontStyle: 'italic',
            }}>
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
            <p style={{
              fontSize: '22px', fontWeight: '300',
              color: 'rgba(255,255,255,0.82)', lineHeight: 1.5, letterSpacing: '-0.01em',
            }}>
              "Security and elegance — protect what matters most."
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
            <p style={{
              fontSize: '10.5px', color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.1em', lineHeight: 1.8,
            }}>
              YOUR HOME. YOUR STATEMENT.<br />
              SHOP THE RAIJAM COLLECTION.
            </p>
          </motion.div>
        </div>

      </div>
    </>
  )
}