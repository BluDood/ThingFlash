import React from 'react'
import ReactDOM from 'react-dom/client'

import { MemoryRouter } from 'react-router-dom'

import App from './App'

import './index.css'
import '@fontsource-variable/open-sans'
import '@fontsource/material-icons'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </React.StrictMode>
)
