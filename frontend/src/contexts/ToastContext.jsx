import { createContext, useContext, useState } from 'react'

const ToastCtx = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = msg => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id))
    }, 3000)
  }

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        {toasts.map(t => (
          <div key={t.id}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)