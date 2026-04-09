import { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  const login = async () => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.role)

    nav('/home')
  }

  return (
    <div>
      <input onChange={e => setEmail(e.target.value)} />
      <input type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  )
}