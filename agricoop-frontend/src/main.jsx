import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1C2B1A',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '0.82rem',
            padding: '10px 16px',
          },
          success: { iconTheme: { primary: '#4A8C3F', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#C0392B', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
