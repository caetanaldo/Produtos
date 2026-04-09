import { createContext, useContext, useState } from 'react'

// 🎨 TEMA CLARO
export const LIGHT = {
  bg: '#f5f5f5',
  surface: '#ffffff',
  surfaceAlt: '#fafafa',
  border: '#e8e8e8',

  text: '#1a1a1a',
  textMuted: '#888',

  accent: '#ee4d2d',
  accentHover: '#d43d1f',
  accentLight: '#fff0ed',
  accentText: '#ee4d2d',

  navBg: '#ee4d2d',

  shadow: '0 2px 12px rgba(0,0,0,0.08)',
  shadowHover: '0 8px 28px rgba(0,0,0,0.14)',

  inputBg: '#ffffff',
}

// 🌙 TEMA ESCURO
export const DARK = {
  bg: '#141414',
  surface: '#1f1f1f',
  surfaceAlt: '#252525',
  border: '#2e2e2e',

  text: '#f0f0f0',
  textMuted: '#777',

  accent: '#ee4d2d',
  accentHover: '#ff6040',
  accentLight: '#2a1510',
  accentText: '#ff6040',

  navBg: '#1a1a1a',

  shadow: '0 2px 12px rgba(0,0,0,0.4)',
  shadowHover: '0 8px 28px rgba(0,0,0,0.6)',

  inputBg: '#2a2a2a',
}

// 🖼️ IMAGENS PADRÃO (caso produto não tenha imagem)
export const PLACEHOLDER = [
  'https://via.placeholder.com/300x200/ee4d2d/ffffff?text=Produto',
  'https://via.placeholder.com/300x200/ff6633/ffffff?text=Item',
  'https://via.placeholder.com/300x200/ffaa88/ffffff?text=Produto',
]

// 🌐 CONTEXT
const ThemeCtx = createContext()

// 🚀 PROVIDER
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(
    localStorage.getItem('theme') === 'dark'
  )

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <ThemeCtx.Provider value={[dark, toggle]}>
      {children}
    </ThemeCtx.Provider>
  )
}

// 🎯 HOOK
export const useTheme = () => useContext(ThemeCtx)