import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/reset-css/reset.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './lib/router'
import AuthProvider from './lib/context/AuthProvider'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>
)
