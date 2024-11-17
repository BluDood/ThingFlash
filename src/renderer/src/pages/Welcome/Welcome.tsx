import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Loader from '@/components/Loader/Loader.js'

import icon from '@/assets/icon.png'

import styles from './Welcome.module.css'

const Welcome: React.FC = () => {
  const navigate = useNavigate()

  const [toolStatus, setToolStatus] = useState<
    'found' | 'notFound' | 'loading' | 'downloading'
  >('loading')

  useEffect(() => {
    window.api.checkSuperbirdTool().then((found: boolean) => {
      setToolStatus(found ? 'found' : 'notFound')
    })
  }, [])

  async function downloadTool() {
    setToolStatus('downloading')
    await window.api.downloadSuperbirdTool()
    setToolStatus('found')
  }

  return (
    <div className={styles.welcome}>
      <img src={icon} />
      <h1>Welcome to ThingFlash!</h1>
      <p>The easiest way to flash your CarThing.</p>
      <div className={styles.tool} key={toolStatus}>
        <div className={styles.status} data-type={toolStatus}>
          {['loading', 'downloading'].includes(toolStatus) ? (
            <Loader size={26} />
          ) : toolStatus === 'found' ? (
            <span className="material-icons">check_circle</span>
          ) : (
            <span className="material-icons">error_outline</span>
          )}
          <p>
            {toolStatus === 'found'
              ? 'superbird-tool is downloaded'
              : toolStatus === 'loading'
                ? 'Looking for superbird-tool...'
                : toolStatus === 'downloading'
                  ? 'Downloading superbird-tool...'
                  : 'superbird-tool is not downloaded'}
          </p>
        </div>
        {toolStatus === 'notFound' ? (
          <button onClick={downloadTool}>Download</button>
        ) : null}
      </div>
      <div className={styles.buttons}>
        {toolStatus === 'found' ? (
          <button onClick={() => navigate('/guided')}>Get Started</button>
        ) : null}
      </div>
    </div>
  )
}

export default Welcome
