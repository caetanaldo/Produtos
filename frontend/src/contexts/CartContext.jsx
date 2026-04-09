import { createContext, useContext, useState } from 'react'

const CartCtx = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = p => {
    setItems(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) {
        return prev.map(i =>
          i.id === p.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...p, qty: 1 }]
    })
  }

  return (
    <CartCtx.Provider value={{ items, addItem }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)