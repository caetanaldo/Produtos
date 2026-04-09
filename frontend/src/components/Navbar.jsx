import { useNavigate } from 'react-router-dom'
import { useTheme, LIGHT, DARK } from '../contexts/ThemeContext'

export default function Navbar({ search, setSearch }) {
  const [dark, toggle] = useTheme()
  const nav = useNavigate()
  const T = dark ? DARK : LIGHT

  return (
    <nav style={{ padding: 20 }}>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar..."
      />

      <button onClick={() => nav('/admin')}>
        Admin
      </button>

      <button onClick={toggle}>
        {dark ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}