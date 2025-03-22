import './lib/reset-css/reset.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './lib/router'
import AuthProvider from './lib/context/AuthProvider'
import { ConfigProvider } from '@douyinfe/semi-ui'

// Create root element
const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

// Render app
root.render(
    <StrictMode>
        <AuthProvider>
            <ConfigProvider timeZone={'GMT+08:00'}>
                <RouterProvider router={router} />
            </ConfigProvider>
        </AuthProvider>
    </StrictMode>
)
