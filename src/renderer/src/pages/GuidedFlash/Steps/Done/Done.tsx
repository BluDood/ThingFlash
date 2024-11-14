import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import party from 'party-js'

import styles from './Done.module.css'

import icon from '@/assets/icon.png'

const Done: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    celebrate()
  }, [])

  function celebrate() {
    party.confetti(document.body, {
      count: 30,
      spread: 40,
      size: 1
    })
  }

  return (
    <div className={styles.done}>
      <img src={icon} alt="" onClick={() => celebrate()} />
      <h1>Flash Complete!</h1>
      <p>
        Congratulations! Your CarThing has been flashed with custom
        firmware. Enjoy!
      </p>
      <div className={styles.buttons}>
        <button onClick={() => navigate('/')}>Start Over</button>
        <button onClick={() => window.close()}>Close</button>
      </div>
    </div>
  )
}

export default Done
