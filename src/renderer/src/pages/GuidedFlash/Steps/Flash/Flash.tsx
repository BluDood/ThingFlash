import React, { useEffect, useRef, useState } from 'react'

import Loader from '@/components/Loader/Loader.js'

import styles from './Flash.module.css'

interface FlashProps {
  onStepComplete: () => void
}

enum State {
  Pending,
  Flashing,
  Done,
  Error
}

interface Log {
  id: string
  text: string
  status: 'pending' | 'success' | 'error'
  progress?: number
}

const Flash: React.FC<FlashProps> = ({ onStepComplete }) => {
  const [state, setState] = useState<State>(0)
  const [logs, setLogs] = useState<Log[]>([])
  const logsRef = useRef<HTMLDivElement>(null)

  function addLog(log: Log) {
    setLogs(l => {
      const index = l.findIndex(l => l.id === log.id)
      if (index === -1) {
        return [...l, log]
      } else {
        return l.map((l, i) => (i === index ? log : l))
      }
    })
    if (logsRef.current) {
      if (
        logsRef.current.scrollHeight - logsRef.current.clientHeight <=
        logsRef.current.scrollTop
      )
        setTimeout(() => {
          logsRef.current!.scroll({
            top: logsRef.current!.scrollHeight,
            behavior: 'smooth'
          })
        }, 0)
    }
  }

  useEffect(() => {
    const removeListener = window.api.on('flashStatus', status => {
      const data = status as { type: string; data: unknown }
      if (data.type === 'status') {
        if (data.data === 'flashing') {
          setState(State.Flashing)
        } else if (data.data === 'done') {
          setState(State.Done)
        } else if (data.data === 'error') {
          setState(State.Error)
        }
      } else if (data.type === 'log') {
        const log = data.data as Log
        addLog(log)
      }
    })

    return removeListener
  }, [])

  function retry() {
    setLogs([])
    window.api.startFlash()
  }

  return (
    <div className={styles.flash}>
      <p className={styles.step}>Step 3</p>
      <h1>Flash your device</h1>
      <p>
        You can now start flashing your CarThing. Please leave it connected
        during the entire process.
      </p>
      <div className={styles.logs} ref={logsRef}>
        {logs.map(log => (
          <div className={styles.log} key={`${log.id + log.status}`}>
            <div className={styles.logStatus} data-status={log.status}>
              {log.status === 'pending' ? (
                <Loader size={26} />
              ) : log.status === 'success' ? (
                <span className="material-icons">check_circle</span>
              ) : (
                <span className="material-icons">error_outline</span>
              )}
            </div>
            <p>{log.text}</p>
            {log.progress && log.status !== 'success' ? (
              <div className={styles.progress}>
                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${log.progress}%` }}
                  />
                </div>
                <p>{log.progress}%</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        {state === State.Flashing ? (
          <div className={styles.state} key={'finding'}>
            <Loader />
            <p>Flashing CarThing...</p>
          </div>
        ) : state === State.Done ? (
          <div className={styles.state} key={'found'}>
            <span className="material-icons">check_circle</span>
            <p>Completed flashing!</p>
          </div>
        ) : state === State.Error ? (
          <div className={styles.state} key={'error'}>
            <span className="material-icons" data-type="error">
              error_outline
            </span>
            <p>An error occurred while flashing.</p>
          </div>
        ) : (
          <div />
        )}
        <div className={styles.buttons}>
          {state === State.Pending ? (
            <button onClick={() => window.api.startFlash()}>
              Start Flashing
            </button>
          ) : state === State.Done ? (
            <button onClick={onStepComplete}>Complete</button>
          ) : state === State.Error ? (
            <button onClick={() => retry()}>Retry</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Flash
