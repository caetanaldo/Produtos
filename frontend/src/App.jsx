import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

//  API
const api = axios.create({
  baseURL: 'http://localhost:5000'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

//  Private Route
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  if (!token) return <Navigate to="/" />
  if (role && role !== userRole) return <Navigate to="/dashboard" />

  return children
}

// LOGIN
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)

      if (res.data.role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
  console.log(err.response?.data)
  alert('Erro ao fazer login')
}
  }

  return (
    <div>
      <h2>Login</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />

      <button onClick={handleLogin}>Entrar</button>

      <p style={{cursor:'pointer'}} onClick={() => navigate('/register')}>
        Criar conta
      </p>
    </div>
  )
}

// 📝 REGISTER
function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password, role })
      alert('Cadastrado!')
      navigate('/')
    } catch (err) {
  console.log(err.response?.data) 
  alert('Erro ao cadastrar')

    }
  }

  return (
    <div>
      <h2>Cadastro</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />

      <select onChange={e => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button onClick={handleRegister}>Cadastrar</button>
    </div>
  )
}

// 👤 USER
function Dashboard() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const res = await api.get('/products')
    setProducts(res.data.data)
  }

  return (
    <div>
      <h1>Produtos</h1>

      {products.map(p => (
        <div key={p.id}>
          <p>{p.name}</p>
          <p>R$ {p.price}</p>
        </div>
      ))}
    </div>
  )
}

// 👑 ADMIN
function Admin() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const res = await api.get('/products')
    setProducts(res.data)
  }

  const createProduct = async () => {
    await api.post('/products', { name, price })
    setName('')
    setPrice('')
    loadProducts()
  }

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`)
    loadProducts()
  }

  return (
    <div>
      <h1>Admin</h1>

      <h3>Criar Produto</h3>
      <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} />

      <button onClick={createProduct}>Criar</button>

      <h3>Lista</h3>
      {products.map(p => (
        <div key={p.id}>
          <p>{p.name} - R$ {p.price}</p>
          <button onClick={() => deleteProduct(p.id)}>Deletar</button>
        </div>
      ))}
    </div>
  )
}

// 🚦 APP
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}