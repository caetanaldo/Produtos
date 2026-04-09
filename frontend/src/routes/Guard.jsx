import { Navigate } from 'react-router-dom'

export default function Guard({ children, role }) {
  const token = localStorage.getItem('token')
  const r = localStorage.getItem('role')

  if (!token) return <Navigate to="/" />
  if (role && role !== r) return <Navigate to="/home" />

  return children
}