import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import UseProvider from './provider/UseProvider.jsx'

createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
    <UseProvider>

        <App />
    </UseProvider>
    
    </BrowserRouter>
    
  
)
