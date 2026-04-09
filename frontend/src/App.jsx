import { useState, useEffect, useRef, createContext, useContext } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// ─── API ──────────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: 'http://localhost:5000' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#f7f3ef',
  surface: '#ffffff',
  surfaceAlt: '#faf8f5',
  border: '#ede9e3',
  text: '#1c1410',
  textMuted: '#9a8f85',
  accent: '#ee4d2d',
  accentHover: '#d43d1f',
  accentLight: '#fff2ef',
  accentText: '#c73a1e',
  navBg: 'linear-gradient(135deg, #ee4d2d 0%, #e63a18 100%)',
  shadow: '0 1px 8px rgba(28,20,16,0.06)',
  shadowHover: '0 12px 32px rgba(28,20,16,0.14)',
  shadowCard: '0 2px 16px rgba(238,77,45,0.08)',
  inputBg: '#fff',
  tag: '#fff2ef',
  tagText: '#c73a1e',
}
const DARK = {
  bg: '#0f0d0c',
  surface: '#1c1916',
  surfaceAlt: '#221f1b',
  border: '#2e2924',
  text: '#f2ede8',
  textMuted: '#6b6158',
  accent: '#ee4d2d',
  accentHover: '#ff6040',
  accentLight: '#271410',
  accentText: '#ff7054',
  navBg: '#1a1512',
  shadow: '0 1px 8px rgba(0,0,0,0.4)',
  shadowHover: '0 12px 32px rgba(0,0,0,0.6)',
  shadowCard: '0 2px 16px rgba(238,77,45,0.12)',
  inputBg: '#221f1b',
  tag: '#271410',
  tagText: '#ff7054',
}

const PLACEHOLDER = [
  'https://via.placeholder.com/400x300/ee4d2d/ffffff?text=Produto',
  'https://via.placeholder.com/400x300/e63a18/ffffff?text=Item',
  'https://via.placeholder.com/400x300/c73a1e/ffffff?text=Produto',
]

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }
  input, select, button, textarea { font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 99px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { transform:translateX(110%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes pop { 0%,100%{transform:scale(1);} 40%{transform:scale(1.35);} }
  @keyframes shake { 0%,100%{transform:translateX(0);} 15%{transform:translateX(-8px);} 30%{transform:translateX(8px);} 45%{transform:translateX(-5px);} 60%{transform:translateX(5px);} }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
  .fu { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .fi { animation: fadeIn .3s ease both; }
  .sr { animation: slideRight .4s cubic-bezier(.16,1,.3,1) both; }
  .pop { animation: pop .35s cubic-bezier(.16,1,.3,1) both; }
  .shake { animation: shake .45s ease both; }
  .skeleton {
    background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.06) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  .card-hover { transition: all 0.28s cubic-bezier(.16,1,.3,1); }
  .card-hover:hover { transform: translateY(-6px); }
  .btn-press:active { transform: scale(0.97); }
`

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
const ThemeCtx = createContext(null)
const CartCtx  = createContext(null)
const FavCtx   = createContext(null)
const ToastCtx = createContext(null)
const useTheme = () => useContext(ThemeCtx)
const useCart  = () => useContext(CartCtx)
const useFav   = () => useContext(FavCtx)
const useToast = () => useContext(ToastCtx)

// ─── TOAST ────────────────────────────────────────────────────────────────────
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }
  const cfg = {
    success: { bg: '#1a7a4a', icon: '✓' },
    error:   { bg: '#c0392b', icon: '✕' },
    info:    { bg: '#1c1410', icon: 'ℹ' },
  }
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((t, idx) => {
          const c = cfg[t.type] || cfg.info
          return (
            <div key={t.id} className="sr" style={{
              padding: '13px 18px', borderRadius: 14, background: c.bg,
              color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: '0 8px 28px rgba(0,0,0,0.3)', maxWidth: 320,
              display: 'flex', alignItems: 'center', gap: 10,
              animationDelay: `${idx * 0.05}s`,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 99, background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0,
              }}>{c.icon}</span>
              {t.msg}
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

// ─── PROVIDERS ────────────────────────────────────────────────────────────────
function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const toggle = () => setDark(d => { localStorage.setItem('theme', d ? 'light' : 'dark'); return !d })
  return <ThemeCtx.Provider value={[dark, toggle]}>{children}</ThemeCtx.Provider>
}

function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] } })
  const save = next => { setItems(next); localStorage.setItem('cart', JSON.stringify(next)) }
  const addItem    = p => { const ex = items.find(i => i.id === p.id); ex ? save(items.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : save([...items, { ...p, qty: 1 }]) }
  const removeItem = id => save(items.filter(i => i.id !== id))
  const updateQty  = (id, qty) => qty <= 0 ? removeItem(id) : save(items.map(i => i.id === id ? { ...i, qty } : i))
  const clearCart  = () => save([])
  return <CartCtx.Provider value={{ items, addItem, removeItem, updateQty, clearCart }}>{children}</CartCtx.Provider>
}

function FavProvider({ children }) {
  const [favs, setFavs] = useState(() => { try { return JSON.parse(localStorage.getItem('favs') || '[]') } catch { return [] } })
  const toggleFav = id => { const n = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]; setFavs(n); localStorage.setItem('favs', JSON.stringify(n)) }
  return <FavCtx.Provider value={{ favs, toggleFav }}>{children}</FavCtx.Provider>
}

// ─── GUARD ────────────────────────────────────────────────────────────────────
function Guard({ children, role }) {
  const token = localStorage.getItem('token')
  const r     = localStorage.getItem('role')
  if (!token) return <Navigate to="/" />
  if (role && role !== r) return <Navigate to="/home" />
  return children
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ search, setSearch, showSearch, isAdmin }) {
  const [dark, toggle] = useTheme()
  const T = dark ? DARK : LIGHT
  const { items } = useCart()
  const nav = useNavigate()
  const cartCount = items.reduce((s, i) => s + i.qty, 0)
  const logout = () => { localStorage.clear(); nav('/') }
  const role = localStorage.getItem('role')

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 64,
      background: isAdmin ? T.surface : (dark ? T.navBg : 'linear-gradient(135deg, #ee4d2d 0%, #e63a18 100%)'),
      borderBottom: isAdmin ? `1px solid ${T.border}` : 'none',
      boxShadow: isAdmin ? T.shadow : '0 4px 20px rgba(238,77,45,0.3)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
    }}>
      {/* Logo */}
      <div onClick={() => nav(isAdmin ? '/admin' : '/home')}
        style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isAdmin ? T.accent : 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>🛍️</div>
        <span style={{ fontWeight: 900, fontSize: 19, color: isAdmin ? T.text : '#fff', letterSpacing: '-0.3px' }}>
          {isAdmin ? 'Admin' : 'ShopZone'}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div style={{ flex: 1, maxWidth: 520, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.5 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            style={{
              width: '100%', padding: '9px 16px 9px 38px', borderRadius: 10,
              border: 'none', outline: 'none', fontSize: 14, fontWeight: 500,
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              '::placeholder': { color: 'rgba(255,255,255,0.6)' },
            }} />
        </div>
      )}

      {/* Right actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Theme toggle */}
        <button onClick={toggle} className="btn-press" style={{
          width: 38, height: 38, background: isAdmin ? T.surfaceAlt : 'rgba(255,255,255,0.15)',
          border: isAdmin ? `1px solid ${T.border}` : 'none',
          borderRadius: 10, cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{dark ? '☀️' : '🌙'}</button>

        {/* Favorites */}
        {!isAdmin && (
          <button onClick={() => nav('/favorites')} className="btn-press" style={{
            width: 38, height: 38, background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 17,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>❤️</button>
        )}

        {/* Cart */}
        {!isAdmin && (
          <button onClick={() => nav('/cart')} className="btn-press" style={{
            position: 'relative', width: 38, height: 38,
            background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 17,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            🛒
            {cartCount > 0 && (
              <span className="pop" style={{
                position: 'absolute', top: -6, right: -6, background: '#fff', color: '#ee4d2d',
                borderRadius: 99, fontSize: 10, fontWeight: 900, minWidth: 19, height: 19,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>{cartCount}</span>
            )}
          </button>
        )}

        {/* Admin switch */}
        {!isAdmin && role === 'admin' && (
          <button onClick={() => nav('/admin')} className="btn-press" style={{
            padding: '0 14px', height: 38, background: 'rgba(255,255,255,0.18)',
            border: 'none', borderRadius: 10, color: '#fff',
            cursor: 'pointer', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>👑 Admin</button>
        )}

        {isAdmin && (
          <button onClick={() => nav('/home')} className="btn-press" style={{
            padding: '0 14px', height: 38, background: T.accentLight,
            border: `1px solid rgba(238,77,45,0.2)`, borderRadius: 10,
            color: T.accentText, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>🏪 Vitrine</button>
        )}

        {/* Logout */}
        <button onClick={logout} className="btn-press" style={{
          padding: '0 14px', height: 38,
          background: isAdmin ? T.surfaceAlt : 'rgba(255,255,255,0.12)',
          border: isAdmin ? `1px solid ${T.border}` : 'none',
          borderRadius: 10, color: isAdmin ? T.textMuted : 'rgba(255,255,255,0.8)',
          cursor: 'pointer', fontWeight: 600, fontSize: 13,
        }}>Sair</button>
      </div>
    </nav>
  )
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthPage() {
  const [dark]    = useTheme()
  const T         = dark ? DARK : LIGHT
  const nav       = useNavigate()
  const toast     = useToast()
  const cardRef   = useRef()
  const [mode, setMode]         = useState('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const switchMode = m => { setMode(m); setError(''); setName(''); setEmail(''); setPassword('') }

  const triggerShake = () => {
    cardRef.current?.classList.remove('shake')
    void cardRef.current?.offsetWidth
    cardRef.current?.classList.add('shake')
    cardRef.current?.addEventListener('animationend', () => cardRef.current?.classList.remove('shake'), { once: true })
  }

  const submit = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); triggerShake(); return }
    if (mode === 'register' && !name) { setError('Informe seu nome.'); triggerShake(); return }
    setLoading(true); setError('')
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('role',  res.data.role)
        toast('Bem-vindo de volta! 👋', 'success')
        nav(res.data.role === 'admin' ? '/admin' : '/home')
      } else {
        await api.post('/auth/register', { name, email, password, role: 'user' })
        toast('Conta criada com sucesso! ✅', 'success')
        switchMode('login')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Credenciais inválidas.'
      setError(msg)
      triggerShake()
    } finally { setLoading(false) }
  }

  const goAdmin = async () => {
    if (!email || !password) { setError('Preencha email e senha de admin.'); triggerShake(); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.role !== 'admin') { setError('Esta conta não tem permissão de admin.'); triggerShake(); return }
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', 'admin')
      toast('Bem-vindo, Admin! 👑', 'success')
      nav('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.')
      triggerShake()
    } finally { setLoading(false) }
  }

  const inp = (val, set, ph, type = 'text') => (
    <input
      type={type} value={val} placeholder={ph}
      onChange={e => set(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && submit()}
      style={{
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: `1.5px solid ${error ? 'rgba(231,76,60,0.3)' : T.border}`,
        background: T.inputBg, color: T.text, fontSize: 15, outline: 'none',
        transition: 'border-color 0.2s',
      }}
    />
  )

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 700, color: T.textMuted,
    marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{CSS}</style>

      {/* Decorative bg shapes */}
      <div style={{ position: 'fixed', top: -120, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,77,45,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,77,45,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div ref={cardRef} className="fu" style={{
        width: '100%', maxWidth: 440,
        background: T.surface, borderRadius: 24,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowHover, padding: '2.5rem 2.5rem 2rem',
        position: 'relative', zIndex: 1,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 16px rgba(238,77,45,0.35)' }}>🛍️</div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 22, color: T.accent, letterSpacing: '-0.5px', lineHeight: 1 }}>ShopZone</p>
            <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, marginTop: 2 }}>Sua loja favorita online</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: T.surfaceAlt, borderRadius: 13, padding: 4, marginBottom: 26, border: `1px solid ${T.border}` }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => switchMode(m)} className="btn-press" style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
              background: mode === m ? T.accent : 'transparent',
              color: mode === m ? '#fff' : T.textMuted,
              boxShadow: mode === m ? '0 2px 10px rgba(238,77,45,0.3)' : 'none',
            }}>{m === 'login' ? '→ Entrar' : '+ Criar conta'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div className="fi">
              <label style={labelStyle}>Nome</label>
              {inp(name, setName, 'Seu nome completo')}
            </div>
          )}
          <div>
            <label style={labelStyle}>Email</label>
            {inp(email, setEmail, 'seu@email.com', 'email')}
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            {inp(password, setPassword, '••••••••', 'password')}
          </div>

          {error && (
            <div className="fi" style={{
              color: '#c0392b', fontSize: 13, fontWeight: 600,
              background: '#fdf4f4', padding: '11px 14px', borderRadius: 10,
              border: '1px solid rgba(192,57,43,0.2)', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span> {error}
            </div>
          )}

          <button onClick={submit} disabled={loading} className="btn-press" style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: loading ? '#ccc' : `linear-gradient(135deg, #ee4d2d 0%, #e63a18 100%)`,
            color: '#fff', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(238,77,45,0.35)',
            transition: 'all 0.2s', marginTop: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? (
              <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              mode === 'login' ? 'Entrar na conta' : 'Criar conta grátis'
            )}
          </button>

          {/* Admin access */}
          {mode === 'login' && (
            <button onClick={goAdmin} className="btn-press" style={{
              width: '100%', padding: '12px', borderRadius: 12,
              border: `1.5px solid ${T.border}`, background: 'transparent',
              color: T.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accentText }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted }}
            >
              👑 Entrar como Admin
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard({ T }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 18, overflow: 'hidden',
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
    }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: '14px 14px 18px' }}>
        <div className="skeleton" style={{ height: 16, marginBottom: 10, width: '70%' }} />
        <div className="skeleton" style={{ height: 22, marginBottom: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 38, borderRadius: 10 }} />
      </div>
    </div>
  )
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home() {
  const [dark]    = useTheme()
  const T         = dark ? DARK : LIGHT
  const { addItem } = useCart()
  const { favs, toggleFav } = useFav()
  const toast     = useToast()
  const [products, setProducts]     = useState([])
  const [search, setSearch]         = useState('')
  const [minP, setMinP]             = useState('')
  const [maxP, setMaxP]             = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [addedId, setAddedId]       = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/products')
      .then(r => setProducts(r.data.data ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const list = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (minP && Number(p.price) < Number(minP)) return false
    if (maxP && Number(p.price) > Number(maxP)) return false
    return true
  })

  const handleAdd = (p) => {
    addItem(p)
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1500)
    toast(`${p.name} adicionado! 🛒`, 'success')
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar search={search} setSearch={setSearch} showSearch />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.textMuted }}>
            {loading ? '...' : `${list.length} produto${list.length !== 1 ? 's' : ''}`}
          </span>

          <button onClick={() => setFilterOpen(f => !f)} className="btn-press" style={{
            padding: '8px 16px', borderRadius: 99, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            border: `1.5px solid ${filterOpen ? T.accent : T.border}`,
            background: filterOpen ? T.accentLight : T.surface,
            color: filterOpen ? T.accentText : T.textMuted,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            💰 Filtrar preço {filterOpen ? '▲' : '▼'}
          </button>

          {filterOpen && (
            <div className="fi" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {[['Mín R$', minP, setMinP], ['Máx R$', maxP, setMaxP]].map(([ph, val, set]) => (
                <input key={ph} placeholder={ph} value={val} onChange={e => set(e.target.value)} style={{
                  width: 110, padding: '8px 12px', borderRadius: 9,
                  border: `1.5px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, outline: 'none',
                }} />
              ))}
              {(minP || maxP) && (
                <button onClick={() => { setMinP(''); setMaxP('') }} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.textMuted, fontWeight: 600, fontSize: 13,
                }}>✕ Limpar</button>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} T={T} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="fu" style={{ textAlign: 'center', padding: '6rem 0', color: T.textMuted }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🔍</div>
            <p style={{ fontWeight: 800, fontSize: 22, marginBottom: 6, color: T.text }}>Nenhum produto encontrado</p>
            <p style={{ fontSize: 15 }}>Tente outros termos ou remova os filtros</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {list.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} T={T}
                isFav={favs.includes(p.id)}
                isAdded={addedId === p.id}
                onFav={() => { toggleFav(p.id); toast(favs.includes(p.id) ? 'Removido dos favoritos' : '❤️ Adicionado aos favoritos!', favs.includes(p.id) ? 'info' : 'success') }}
                onAdd={() => handleAdd(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ p, i, T, isFav, onFav, onAdd, isAdded }) {
  const [hov, setHov] = useState(false)
  const img = p.image || PLACEHOLDER[i % PLACEHOLDER.length]

  return (
    <div className="fu card-hover" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface, borderRadius: 18, overflow: 'hidden',
        border: `1px solid ${hov ? 'rgba(238,77,45,0.3)' : T.border}`,
        boxShadow: hov ? T.shadowCard : T.shadow,
        animationDelay: `${Math.min(i, 12) * 0.05}s`,
        display: 'flex', flexDirection: 'column',
      }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: T.surfaceAlt }}>
        <img src={img} alt={p.name} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: hov ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)',
        }} onError={e => { e.target.src = PLACEHOLDER[i % PLACEHOLDER.length] }} />

        {/* Fav button */}
        <button onClick={e => { e.stopPropagation(); onFav() }} className="btn-press" style={{
          position: 'absolute', top: 10, right: 10, width: 36, height: 36,
          background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 99,
          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'transform 0.2s',
        }}>{isFav ? '❤️' : '🤍'}</button>

        {/* Stock badge */}
        {p.stock !== undefined && p.stock <= 5 && p.stock > 0 && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#ee4d2d', color: '#fff',
            borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '4px 10px',
          }}>Últimas unidades!</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: T.text, lineHeight: 1.3, minHeight: 38 }}>{p.name}</p>
        <p style={{ fontWeight: 900, fontSize: 22, color: T.accent, letterSpacing: '-0.5px' }}>
          R$ {Number(p.price).toFixed(2)}
        </p>

        <button onClick={onAdd} className="btn-press" style={{
          marginTop: 'auto', width: '100%', padding: '11px 0', borderRadius: 11,
          border: 'none',
          background: isAdded ? '#1a7a4a' : (hov ? T.accentHover : T.accent),
          color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          transition: 'all 0.25s',
          boxShadow: `0 3px 12px rgba(238,77,45,0.25)`,
        }}>
          {isAdded ? '✓ Adicionado!' : '🛒 Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  )
}

// ─── FAVORITES ────────────────────────────────────────────────────────────────
function Favorites() {
  const [dark]    = useTheme()
  const T         = dark ? DARK : LIGHT
  const { favs, toggleFav } = useFav()
  const { addItem } = useCart()
  const toast     = useToast()
  const nav       = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/products')
      .then(r => setProducts(r.data.data ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const favProducts = products.filter(p => favs.includes(p.id))

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>
        <h2 style={{ fontWeight: 900, fontSize: 26, color: T.text, marginBottom: 24, letterSpacing: '-0.5px' }}>❤️ Meus favoritos</h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} T={T} />)}
          </div>
        ) : favProducts.length === 0 ? (
          <div className="fu" style={{ textAlign: 'center', padding: '6rem 0', color: T.textMuted }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>💔</div>
            <p style={{ fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 8 }}>Nenhum favorito ainda</p>
            <p style={{ marginBottom: 28 }}>Clique no ❤️ nos produtos que você gosta!</p>
            <button onClick={() => nav('/home')} style={{
              background: T.accent, color: '#fff', border: 'none', borderRadius: 12,
              padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>Ver produtos</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {favProducts.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} T={T}
                isFav={true}
                onFav={() => { toggleFav(p.id); toast('Removido dos favoritos', 'info') }}
                onAdd={() => { addItem(p); toast(`${p.name} adicionado! 🛒`, 'success') }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CART ─────────────────────────────────────────────────────────────────────
function Cart() {
  const [dark]   = useTheme()
  const T        = dark ? DARK : LIGHT
  const { items, removeItem, updateQty, clearCart } = useCart()
  const nav      = useNavigate()
  const toast    = useToast()
  const [done, setDone] = useState(false)
  const total = items.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  const finalize = () => { clearCart(); setDone(true); toast('Pedido realizado! 🎉', 'success') }

  const qBtnStyle = (T) => ({
    width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${T.border}`,
    background: T.surfaceAlt, color: T.text, fontWeight: 800, fontSize: 18,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  })

  if (done) return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar />
      <div className="fu" style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: 24 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: 'rgba(26,122,74,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, margin: '0 auto 24px',
        }}>🎉</div>
        <h2 style={{ fontWeight: 900, fontSize: 30, color: T.text, marginBottom: 10, letterSpacing: '-0.5px' }}>Pedido confirmado!</h2>
        <p style={{ color: T.textMuted, marginBottom: 36, fontSize: 16 }}>Obrigado pela compra! Em breve você receberá a confirmação por email.</p>
        <button onClick={() => { setDone(false); nav('/home') }} className="btn-press" style={{
          background: T.accent, color: '#fff', border: 'none', borderRadius: 13,
          padding: '15px 36px', fontWeight: 800, fontSize: 16, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(238,77,45,0.35)',
        }}>Continuar comprando</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <h2 style={{ fontWeight: 900, fontSize: 26, color: T.text, marginBottom: 26, letterSpacing: '-0.5px' }}>🛒 Meu carrinho</h2>

        {items.length === 0 ? (
          <div className="fu" style={{ textAlign: 'center', padding: '6rem 0', color: T.textMuted }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, color: T.text }}>Carrinho vazio</p>
            <p style={{ marginBottom: 32, fontSize: 15 }}>Adicione produtos para continuar comprando</p>
            <button onClick={() => nav('/home')} className="btn-press" style={{
              background: T.accent, color: '#fff', border: 'none', borderRadius: 13,
              padding: '14px 30px', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>Ver produtos</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Item list */}
            <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, idx) => (
                <div key={item.id} className="fi" style={{
                  background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
                  padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  animationDelay: `${idx * 0.05}s`,
                }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 12, overflow: 'hidden',
                    background: T.surfaceAlt, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>
                    {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: T.text, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                    <p style={{ color: T.accent, fontWeight: 800, fontSize: 17, marginTop: 2 }}>R$ {Number(item.price).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="btn-press" style={qBtnStyle(T)}>−</button>
                    <span style={{ fontWeight: 800, fontSize: 16, color: T.text, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="btn-press" style={qBtnStyle(T)}>+</button>
                  </div>
                  <button onClick={() => { removeItem(item.id); toast('Item removido', 'info') }} className="btn-press" style={{
                    background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
                    borderRadius: 9, cursor: 'pointer', fontSize: 15, padding: '6px 10px', color: '#e74c3c',
                  }}>🗑️</button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              width: 260, background: T.surface, borderRadius: 18,
              border: `1px solid ${T.border}`, padding: '22px',
              position: 'sticky', top: 80, boxShadow: T.shadow,
            }}>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: T.text, marginBottom: 16 }}>Resumo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: T.textMuted, flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name} ×{i.qty}</span>
                    <span style={{ fontWeight: 700, color: T.text, flexShrink: 0 }}>R$ {(Number(i.price) * i.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Total</span>
                <span style={{ fontWeight: 900, color: T.accent, fontSize: 24, letterSpacing: '-0.5px' }}>R$ {total.toFixed(2)}</span>
              </div>
              <button onClick={finalize} className="btn-press" style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: T.accent, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(238,77,45,0.35)',
              }}>🎉 Finalizar compra</button>
              <button onClick={() => nav('/home')} className="btn-press" style={{
                marginTop: 10, width: '100%', padding: '12px 0', borderRadius: 12,
                border: `1px solid ${T.border}`, background: 'transparent', color: T.textMuted,
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>← Continuar comprando</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPanel() {
  const [dark]  = useTheme()
  const T       = dark ? DARK : LIGHT
  const toast   = useToast()
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [name, setName]           = useState('')
  const [price, setPrice]         = useState('')
  const [image, setImage]         = useState('')
  const [creating, setCreating]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [editName, setEditName]   = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImage, setEditImage] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/products').then(r => setProducts(r.data.data ?? r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name || !price) { toast('Nome e preço são obrigatórios!', 'error'); return }
    setCreating(true)
    try { await api.post('/products', { name, price: Number(price), image }); setName(''); setPrice(''); setImage(''); toast('Produto criado! ✅', 'success'); load() }
    catch { toast('Erro ao criar produto', 'error') }
    finally { setCreating(false) }
  }

  const del = async id => {
    try { await api.delete(`/products/${id}`); toast('Produto deletado', 'info'); load(); setConfirmDel(null) }
    catch { toast('Erro ao deletar', 'error') }
  }

  const startEdit = p => { setEditId(p.id); setEditName(p.name); setEditPrice(String(p.price)); setEditImage(p.image || '') }

  const saveEdit = async () => {
    try { await api.put(`/products/${editId}`, { name: editName, price: Number(editPrice), image: editImage }); setEditId(null); toast('Atualizado! ✅', 'success'); load() }
    catch { toast('Erro ao editar', 'error') }
  }

  const inputStyle = (extra = {}) => ({
    flex: 1, minWidth: 120, padding: '11px 14px', borderRadius: 11,
    border: `1px solid ${T.border}`, background: T.inputBg, color: T.text,
    fontSize: 14, outline: 'none', ...extra,
  })

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar isAdmin />

      {/* Confirm delete modal */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="fu" style={{
            background: T.surface, borderRadius: 20, padding: '28px 28px 24px',
            maxWidth: 360, width: '100%', border: `1px solid ${T.border}`,
          }}>
            <p style={{ fontSize: 36, marginBottom: 14 }}>🗑️</p>
            <h3 style={{ fontWeight: 800, fontSize: 20, color: T.text, marginBottom: 8 }}>Deletar produto?</h3>
            <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 22 }}>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{
                flex: 1, padding: '12px', borderRadius: 11, border: `1px solid ${T.border}`,
                background: 'transparent', color: T.textMuted, fontWeight: 700, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={() => del(confirmDel)} style={{
                flex: 1, padding: '12px', borderRadius: 11, border: 'none',
                background: '#e74c3c', color: '#fff', fontWeight: 800, cursor: 'pointer',
              }}>Sim, deletar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total de produtos', value: products.length, icon: '📦' },
            { label: 'Preço médio', value: products.length ? `R$ ${(products.reduce((s, p) => s + Number(p.price), 0) / products.length).toFixed(2)}` : 'R$ 0', icon: '💰' },
            { label: 'Produto mais caro', value: products.length ? `R$ ${Math.max(...products.map(p => Number(p.price))).toFixed(2)}` : 'R$ 0', icon: '⭐' },
          ].map((stat, i) => (
            <div key={i} className="fu" style={{
              background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
              padding: '18px 20px', boxShadow: T.shadow, animationDelay: `${i * 0.08}s`,
            }}>
              <p style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: T.accent, letterSpacing: '-0.5px' }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Create form */}
        <div className="fu" style={{
          background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
          padding: '22px 24px', marginBottom: 22, boxShadow: T.shadow,
          animationDelay: '0.1s',
        }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: T.text, marginBottom: 4 }}>➕ Novo produto</h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 18 }}>Preencha os dados para adicionar à vitrine</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto" style={inputStyle()} />
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço (ex: 49.90)" style={inputStyle({ maxWidth: 160 })} />
            <input value={image} onChange={e => setImage(e.target.value)} placeholder="🖼️ URL da imagem (opcional)" style={inputStyle()} />
            <button onClick={create} disabled={creating} className="btn-press" style={{
              padding: '11px 24px', borderRadius: 11, border: 'none',
              background: creating ? '#ccc' : T.accent, color: '#fff',
              fontWeight: 800, fontSize: 14, cursor: creating ? 'not-allowed' : 'pointer', flexShrink: 0,
              boxShadow: creating ? 'none' : '0 3px 10px rgba(238,77,45,0.3)',
            }}>
              {creating ? '...' : '+ Criar'}
            </button>
          </div>
        </div>

        {/* Product list */}
        <div className="fu" style={{
          background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
          boxShadow: T.shadow, overflow: 'hidden', animationDelay: '0.15s',
        }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: T.text }}>📋 Produtos cadastrados</h2>
            <span style={{
              background: T.accentLight, color: T.accentText,
              borderRadius: 99, padding: '5px 14px', fontSize: 13, fontWeight: 700,
            }}>{products.length} itens</span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 58, borderRadius: 10 }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: T.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Nenhum produto ainda. Crie um acima!</p>
            </div>
          ) : products.map((p, i) => (
            <div key={p.id} style={{
              padding: '16px 24px',
              borderBottom: i < products.length - 1 ? `1px solid ${T.border}` : 'none',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {editId === p.id ? (
                <div className="fi" style={{ display: 'flex', flex: 1, gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    style={{ flex: 1, minWidth: 120, padding: '9px 12px', borderRadius: 9, border: `2px solid ${T.accent}`, background: T.inputBg, color: T.text, fontSize: 14, outline: 'none' }} />
                  <input value={editPrice} onChange={e => setEditPrice(e.target.value)}
                    style={{ width: 120, padding: '9px 12px', borderRadius: 9, border: `2px solid ${T.accent}`, background: T.inputBg, color: T.text, fontSize: 14, outline: 'none' }} />
                  <input value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="URL imagem"
                    style={{ flex: 1, minWidth: 120, padding: '9px 12px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 14, outline: 'none' }} />
                  <button onClick={saveEdit} className="btn-press" style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: '#1a7a4a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>✓ Salvar</button>
                  <button onClick={() => setEditId(null)} className="btn-press" style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: 'transparent', color: T.textMuted, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <>
                  <div style={{ width: 50, height: 50, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: T.surfaceAlt }}>
                    <img src={p.image || PLACEHOLDER[i % PLACEHOLDER.length]} alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = PLACEHOLDER[i % PLACEHOLDER.length] }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: T.text, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ color: T.accent, fontWeight: 800, fontSize: 16, marginTop: 1 }}>R$ {Number(p.price).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => startEdit(p)} className="btn-press" style={{
                      padding: '8px 16px', borderRadius: 9,
                      border: `1px solid ${T.border}`, background: T.surfaceAlt,
                      color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    }}>✏️ Editar</button>
                    <button onClick={() => setConfirmDel(p.id)} className="btn-press" style={{
                      padding: '8px 16px', borderRadius: 9,
                      border: '1px solid rgba(231,76,60,0.3)', background: 'rgba(231,76,60,0.07)',
                      color: '#e74c3c', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    }}>🗑️ Deletar</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <FavProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/"          element={<AuthPage />} />
                <Route path="/home"      element={<Guard><Home /></Guard>} />
                <Route path="/favorites" element={<Guard><Favorites /></Guard>} />
                <Route path="/cart"      element={<Guard><Cart /></Guard>} />
                <Route path="/admin"     element={<Guard role="admin"><AdminPanel /></Guard>} />
                <Route path="*"          element={<Navigate to="/" />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </FavProvider>
      </CartProvider>
    </ThemeProvider>
  )
}
