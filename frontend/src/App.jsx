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
  bg: '#f5f5f5', surface: '#ffffff', surfaceAlt: '#fafafa', border: '#e8e8e8',
  text: '#1a1a1a', textMuted: '#888', accent: '#ee4d2d', accentHover: '#d43d1f',
  accentLight: '#fff0ed', accentText: '#ee4d2d', navBg: '#ee4d2d',
  shadow: '0 2px 12px rgba(0,0,0,0.08)', shadowHover: '0 8px 28px rgba(0,0,0,0.14)',
  inputBg: '#fff',
}
const DARK = {
  bg: '#141414', surface: '#1f1f1f', surfaceAlt: '#252525', border: '#2e2e2e',
  text: '#f0f0f0', textMuted: '#777', accent: '#ee4d2d', accentHover: '#ff6040',
  accentLight: '#2a1510', accentText: '#ff6040', navBg: '#1a1a1a',
  shadow: '0 2px 12px rgba(0,0,0,0.4)', shadowHover: '0 8px 28px rgba(0,0,0,0.6)',
  inputBg: '#2a2a2a',
}

const PLACEHOLDER = [
  'https://via.placeholder.com/300x200/ee4d2d/ffffff?text=Produto',
  'https://via.placeholder.com/300x200/ff6633/ffffff?text=Item',
  'https://via.placeholder.com/300x200/ffaa88/ffffff?text=Produto',
]

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
  input,select,button { font-family: 'Nunito', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 99px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes pop { 0%,100%{transform:scale(1);} 50%{transform:scale(1.3);} }
  @keyframes shake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-7px);} 40%{transform:translateX(7px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  .fu { animation: fadeUp .4s ease both; }
  .fi { animation: fadeIn .3s ease both; }
  .sr { animation: slideRight .35s cubic-bezier(.22,.68,0,1.2) both; }
  .pop { animation: pop .3s ease both; }
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
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }
  const colors = { success: '#27ae60', error: '#e74c3c', info: '#2c3e50' }
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className="sr" style={{
            padding: '12px 18px', borderRadius: 12, background: colors[t.type] || colors.info,
            color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: 300,
          }}>{t.msg}</div>
        ))}
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

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 60,
      background: isAdmin ? T.surface : T.navBg,
      borderBottom: isAdmin ? `1px solid ${T.border}` : 'none',
      boxShadow: isAdmin ? T.shadow : '0 2px 10px rgba(238,77,45,0.35)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
    }}>
      <div onClick={() => nav(isAdmin ? '/admin' : '/home')}
        style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', flexShrink: 0 }}>
        <span style={{ fontSize: 22 }}>🛍️</span>
        <span style={{ fontWeight: 900, fontSize: 20, color: isAdmin ? T.accent : '#fff' }}>
          {isAdmin ? 'Painel Admin' : 'ShopZone'}
        </span>
      </div>

      {showSearch && (
        <div style={{ flex: 1, maxWidth: 500 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Buscar produtos..."
            style={{
              width: '100%', padding: '9px 16px', borderRadius: 99,
              border: 'none', outline: 'none', fontSize: 14, fontWeight: 600,
              background: 'rgba(255,255,255,0.22)', color: '#fff',
            }} />
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={toggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20 }}>
          {dark ? '☀️' : '🌙'}
        </button>

        {!isAdmin && (
          <button onClick={() => nav('/cart')} style={{
            position: 'relative', background: 'rgba(255,255,255,0.18)',
            border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 20,
          }}>
            🛒
            {cartCount > 0 && (
              <span className="pop" style={{
                position: 'absolute', top: -6, right: -6, background: '#fff', color: T.accent,
                borderRadius: 99, fontSize: 11, fontWeight: 900, minWidth: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
              }}>{cartCount}</span>
            )}
          </button>
        )}

        {!isAdmin && localStorage.getItem('role') === 'admin' && (
          <button onClick={() => nav('/admin')} style={{
            background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 10,
            padding: '7px 14px', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 13,
          }}>👑 Admin</button>
        )}

        {isAdmin && (
          <button onClick={() => nav('/home')} style={{
            background: T.accentLight, border: `1px solid ${T.accent}`, borderRadius: 10,
            padding: '7px 14px', color: T.accentText, cursor: 'pointer', fontWeight: 800, fontSize: 13,
          }}>🏪 Vitrine</button>
        )}

        <button onClick={logout} style={{
          background: isAdmin ? T.surfaceAlt : 'rgba(255,255,255,0.15)',
          border: isAdmin ? `1px solid ${T.border}` : 'none',
          borderRadius: 10, padding: '7px 14px',
          color: isAdmin ? T.textMuted : '#fff',
          cursor: 'pointer', fontWeight: 700, fontSize: 13,
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
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState('user')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const switchMode = m => { setMode(m); setError(''); setEmail(''); setPassword('') }

  const submit = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    setLoading(true); setError('')
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('role',  res.data.role)
        toast('Bem-vindo! 👋', 'success')
        nav(res.data.role === 'admin' ? '/admin' : '/home')
      } else {
        await api.post('/auth/register', { email, password, role })
        toast('Conta criada! Faça o login. ✅', 'success')
        switchMode('login')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Credenciais inválidas.'
      setError(msg)
      cardRef.current?.classList.remove('shake')
      void cardRef.current?.offsetWidth
      cardRef.current?.classList.add('shake')
      cardRef.current?.addEventListener('animationend', () => cardRef.current?.classList.remove('shake'), { once: true })
    } finally { setLoading(false) }
  }

  const inp = (val, set, ph, type = 'text') => ({
    type, value: val, placeholder: ph, onChange: e => set(e.target.value),
    onKeyDown: e => e.key === 'Enter' && submit(),
    style: {
      width: '100%', padding: '13px 16px', borderRadius: 12,
      border: `1.5px solid ${error ? '#e74c3c33' : T.border}`,
      background: T.inputBg, color: T.text, fontSize: 15, outline: 'none',
    }
  })

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{CSS}</style>
      {/* blobs */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(238,77,45,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(238,77,45,0.07)', pointerEvents: 'none' }} />

      <div ref={cardRef} className="fu" style={{
        width: '100%', maxWidth: 420,
        background: T.surface, borderRadius: 24,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowHover, padding: '2.5rem', position: 'relative', zIndex: 1,
      }}>
        {/* brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛍️</div>
          <span style={{ fontWeight: 900, fontSize: 24, color: T.accent }}>ShopZone</span>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', background: T.surfaceAlt, borderRadius: 12, padding: 4, marginBottom: 28, border: `1px solid ${T.border}` }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 14, transition: 'all 0.2s',
              background: mode === m ? T.accent : 'transparent',
              color: mode === m ? '#fff' : T.textMuted,
            }}>{m === 'login' ? 'Entrar' : 'Criar conta'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
            <input {...inp(email, setEmail, 'seu@email.com', 'email')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Senha</label>
            <input {...inp(password, setPassword, '••••••••', 'password')} />
          </div>

          {mode === 'register' && (
            <div className="fi">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Perfil</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{
                width: '100%', padding: '13px 16px', borderRadius: 12,
                border: `1.5px solid ${T.border}`, background: T.inputBg, color: T.text,
                fontSize: 15, outline: 'none', cursor: 'pointer',
              }}>
                <option value="user">👤 Usuário</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>
          )}

          {error && (
            <div className="fi" style={{ color: '#e74c3c', fontSize: 13, fontWeight: 700, background: '#fdf0f0', padding: '10px 14px', borderRadius: 10, border: '1px solid #fcc' }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={submit} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: loading ? '#ccc' : T.accent, color: '#fff',
            fontWeight: 900, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', marginTop: 4,
          }}>
            {loading ? '...' : mode === 'login' ? 'Entrar →' : 'Criar conta →'}
          </button>
        </div>
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
  const [products, setProducts]   = useState([])
  const [search, setSearch]       = useState('')
  const [minP, setMinP]           = useState('')
  const [maxP, setMaxP]           = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.data ?? r.data)).catch(() => {})
  }, [])

  const list = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (minP && Number(p.price) < Number(minP)) return false
    if (maxP && Number(p.price) > Number(maxP)) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar search={search} setSearch={setSearch} showSearch />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.textMuted }}>{list.length} produtos</span>
          <button onClick={() => setFilterOpen(f => !f)} style={{
            padding: '7px 16px', borderRadius: 99, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            border: `1px solid ${filterOpen ? T.accent : T.border}`,
            background: filterOpen ? T.accentLight : T.surface,
            color: filterOpen ? T.accentText : T.textMuted,
          }}>💰 Filtrar preço</button>

          {filterOpen && (
            <div className="fi" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {[['Min R$', minP, setMinP], ['Max R$', maxP, setMaxP]].map(([ph, val, set]) => (
                <input key={ph} placeholder={ph} value={val} onChange={e => set(e.target.value)} style={{
                  width: 100, padding: '7px 12px', borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, outline: 'none',
                }} />
              ))}
              <button onClick={() => { setMinP(''); setMaxP('') }} style={{
                background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted, fontWeight: 700, fontSize: 13,
              }}>✕ Limpar</button>
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: T.textMuted }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 800, fontSize: 20 }}>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {list.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} T={T}
                isFav={favs.includes(p.id)}
                onFav={() => toggleFav(p.id)}
                onAdd={() => { addItem(p); toast(`${p.name} adicionado! 🛒`, 'success') }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ p, i, T, isFav, onFav, onAdd }) {
  const [hov, setHov] = useState(false)
  const img = p.image || PLACEHOLDER[i % PLACEHOLDER.length]
  return (
    <div className="fu" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface, borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${T.border}`,
        boxShadow: hov ? T.shadowHover : T.shadow,
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        animationDelay: `${i * 0.04}s`,
        display: 'flex', flexDirection: 'column',
      }}>
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img src={img} alt={p.name} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.3s',
        }} />
        <button onClick={onFav} style={{
          position: 'absolute', top: 10, right: 10, width: 34, height: 34,
          background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 99,
          cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>{isFav ? '❤️' : '🤍'}</button>
      </div>
      <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: T.text, lineHeight: 1.3 }}>{p.name}</p>
        <p style={{ fontWeight: 900, fontSize: 20, color: T.accent }}>R$ {Number(p.price).toFixed(2)}</p>
        <button onClick={onAdd} style={{
          marginTop: 'auto', width: '100%', padding: '10px 0', borderRadius: 10,
          border: 'none', background: T.accent, color: '#fff',
          fontWeight: 800, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
          onMouseLeave={e => e.currentTarget.style.background = T.accent}
        >🛒 Adicionar ao carrinho</button>
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

  const qBtn = { width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }

  if (done) return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar />
      <div className="fu" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontWeight: 900, fontSize: 30, color: T.text, marginBottom: 10 }}>Pedido realizado!</h2>
        <p style={{ color: T.textMuted, marginBottom: 32, fontSize: 16 }}>Obrigado pela compra. Em breve você receberá uma confirmação.</p>
        <button onClick={() => { setDone(false); nav('/home') }} style={{
          background: T.accent, color: '#fff', border: 'none', borderRadius: 12,
          padding: '14px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer',
        }}>Continuar comprando</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px' }}>
        <h2 style={{ fontWeight: 900, fontSize: 26, color: T.text, marginBottom: 24 }}>🛒 Meu carrinho</h2>

        {items.length === 0 ? (
          <div className="fu" style={{ textAlign: 'center', padding: '5rem 0', color: T.textMuted }}>
            <div style={{ fontSize: 64, marginBottom: 14 }}>🛒</div>
            <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Carrinho vazio</p>
            <p style={{ marginBottom: 28, fontSize: 15 }}>Adicione produtos para continuar</p>
            <button onClick={() => nav('/home')} style={{
              background: T.accent, color: '#fff', border: 'none', borderRadius: 12,
              padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>Ver produtos</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* list */}
            <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item.id} className="fi" style={{
                  background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ fontSize: 30 }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>{item.name}</p>
                    <p style={{ color: T.accent, fontWeight: 800, fontSize: 16 }}>R$ {Number(item.price).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={qBtn}>−</button>
                    <span style={{ fontWeight: 800, fontSize: 15, color: T.text, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={qBtn}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20 }}>🗑️</button>
                </div>
              ))}
            </div>

            {/* summary */}
            <div style={{
              width: 240, background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
              padding: 20, position: 'sticky', top: 80,
            }}>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: T.text, marginBottom: 16 }}>Resumo do pedido</h3>
              {items.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: T.textMuted }}>{i.name} ×{i.qty}</span>
                  <span style={{ fontWeight: 700, color: T.text }}>R$ {(Number(i.price) * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: T.text }}>Total</span>
                <span style={{ fontWeight: 900, color: T.accent, fontSize: 20 }}>R$ {total.toFixed(2)}</span>
              </div>
              <button onClick={finalize} style={{
                marginTop: 18, width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
                background: T.accent, color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer',
              }}>🎉 Finalizar compra</button>
              <button onClick={() => nav('/home')} style={{
                marginTop: 8, width: '100%', padding: '11px 0', borderRadius: 12,
                border: `1px solid ${T.border}`, background: 'transparent', color: T.textMuted,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
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
  const [products, setProducts] = useState([])
  const [name, setName]         = useState('')
  const [price, setPrice]       = useState('')
  const [image, setImage]       = useState('')
  const [editId, setEditId]     = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImage, setEditImage] = useState('')

  const load = () => api.get('/products').then(r => setProducts(r.data.data ?? r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name || !price) { toast('Nome e preço são obrigatórios!', 'error'); return }
    try { await api.post('/products', { name, price: Number(price), image }); setName(''); setPrice(''); setImage(''); toast('Produto criado! ✅', 'success'); load() }
    catch { toast('Erro ao criar produto', 'error') }
  }

  const del = async id => {
    try { await api.delete(`/products/${id}`); toast('Produto deletado', 'info'); load() }
    catch { toast('Erro ao deletar', 'error') }
  }

  const startEdit = p => { setEditId(p.id); setEditName(p.name); setEditPrice(String(p.price)); setEditImage(p.image || '') }

  const saveEdit = async () => {
    try { await api.put(`/products/${editId}`, { name: editName, price: Number(editPrice), image: editImage }); setEditId(null); toast('Atualizado! ✅', 'success'); load() }
    catch { toast('Erro ao editar', 'error') }
  }

  const baseInp = (val, set, ph, style = {}) => ({
    value: val, onChange: e => set(e.target.value), placeholder: ph,
    style: {
      flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 10,
      border: `1px solid ${T.border}`, background: T.inputBg, color: T.text,
      fontSize: 14, outline: 'none', ...style,
    }
  })

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{CSS}</style>
      <Navbar isAdmin />
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 16px' }}>

        {/* create form */}
        <div className="fu" style={{
          background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
          padding: '22px 24px', marginBottom: 28, boxShadow: T.shadow,
        }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: T.text, marginBottom: 4 }}>➕ Novo produto</h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 18 }}>Preencha os dados e o produto aparecerá na vitrine</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input {...baseInp(name, setName, 'Nome do produto')} />
            <input {...baseInp(price, setPrice, 'Preço (ex: 49.90)', { maxWidth: 160 })} />
            <input {...baseInp(image, setImage, '🖼️ URL da imagem (opcional)')} />
            <button onClick={create} style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: T.accent, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', flexShrink: 0,
            }}>+ Criar</button>
          </div>
        </div>

        {/* list */}
        <div className="fu" style={{
          background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
          boxShadow: T.shadow, overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: T.text }}>📋 Produtos cadastrados</h2>
            <span style={{ background: T.accentLight, color: T.accentText, borderRadius: 99, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>
              {products.length} itens
            </span>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: T.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📦</div>
              <p style={{ fontWeight: 700 }}>Nenhum produto ainda. Crie um acima!</p>
            </div>
          ) : products.map((p, i) => (
            <div key={p.id} style={{
              padding: '16px 24px', borderBottom: i < products.length - 1 ? `1px solid ${T.border}` : 'none',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
              {editId === p.id ? (
                <div className="fi" style={{ display: 'flex', flex: 1, gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1, minWidth: 120, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${T.accent}`, background: T.inputBg, color: T.text, fontSize: 14, outline: 'none' }} />
                  <input value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: 120, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${T.accent}`, background: T.inputBg, color: T.text, fontSize: 14, outline: 'none' }} />
                  <input value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="URL imagem" style={{ flex: 1, minWidth: 120, padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 14, outline: 'none' }} />
                  <button onClick={saveEdit} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#27ae60', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>✓ Salvar</button>
                  <button onClick={() => setEditId(null)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', color: T.textMuted, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <>
                  <div style={{ width: 46, height: 46, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={p.image || PLACEHOLDER[i % PLACEHOLDER.length]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>{p.name}</p>
                    <p style={{ color: T.accent, fontWeight: 800 }}>R$ {Number(p.price).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>✏️ Editar</button>
                    <button onClick={() => del(p.id)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(231,76,60,0.3)', background: 'rgba(231,76,60,0.08)', color: '#e74c3c', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>🗑️ Deletar</button>
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
                <Route path="/"     element={<AuthPage />} />
                <Route path="/home" element={<Guard><Home /></Guard>} />
                <Route path="/cart" element={<Guard><Cart /></Guard>} />
                <Route path="/admin" element={<Guard role="admin"><AdminPanel /></Guard>} />
                <Route path="*"    element={<Navigate to="/" />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </FavProvider>
      </CartProvider>
    </ThemeProvider>
  )
}
