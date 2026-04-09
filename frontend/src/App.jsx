import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ThemeProvider } from './contexts/ThemeContext'
import { CartProvider } from './contexts/CartContext'
import { FavProvider } from './contexts/FavContext'
import { ToastProvider } from './contexts/ToastContext'

import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import Guard from './routes/Guard'

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <FavProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/home" element={<Guard><Home /></Guard>} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </FavProvider>
      </CartProvider>
    </ThemeProvider>
  )
}