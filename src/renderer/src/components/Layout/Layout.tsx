import React from 'react'

import Titlebar from '@/components/Titlebar/Titlebar.js'

import styles from './Layout.module.css'
import { Outlet } from 'react-router-dom'

const Layout: React.FC = () => {
  return (
    <>
      <div className={styles.layout}>
        <Titlebar />
        <div className={styles.outlet}>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout
