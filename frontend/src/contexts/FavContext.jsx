import { createContext, useContext, useState } from 'react'

const FavCtx = createContext()

export function FavProvider({ children }) {
  const [favs, setFavs] = useState([])

  const toggleFav = id => {
    setFavs(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  return (
    <FavCtx.Provider value={{ favs, toggleFav }}>
      {children}
    </FavCtx.Provider>
  )
}

export const useFav = () => useContext(FavCtx)