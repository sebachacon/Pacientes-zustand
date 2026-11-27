import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import './index.css'
import "react-toastify/dist/ReactToastify.css"
import App from './App.tsx'
import AuthGate from './components/AuthGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
  </StrictMode>,
)
