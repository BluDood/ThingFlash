import React from 'react'

import styles from './Titlebar.module.css'

const Titlebar: React.FC = () => {
  const buttons = [
    {
      icon: 'close',
      action: () => window.close()
    }
  ]

  return (
    <div className={styles.titlebar}>
      <div className={styles.title}>{/* ThingFlash */}</div>
      <div className={styles.actions}>
        {buttons.map(({ icon, action }) => (
          <button key={icon} onClick={action}>
            <span className="material-icons">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Titlebar
