import { useEffect, useState } from 'react'
import api from '../api/api'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { useCart } from '../contexts/CartContext'
import { useTheme, LIGHT, DARK } from '../contexts/ThemeContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const { addItem } = useCart()
  const [dark] = useTheme()
  const T = dark ? DARK : LIGHT

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data.data || res.data)
    })
  }, [])

  return (
    <>
      <Navbar search={search} setSearch={setSearch} />

      {products.map(p => (
        <ProductCard
          key={p.id}
          p={p}
          onAdd={() => addItem(p)}
        />
      ))}
    </>
  )
}