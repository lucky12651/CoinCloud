import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import './vortex.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#151519',
            color: '#f5f5f7',
            border: '1px solid #232329',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
