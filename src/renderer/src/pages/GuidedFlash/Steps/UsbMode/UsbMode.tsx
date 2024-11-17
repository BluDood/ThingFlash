import React, { useState } from 'react'

import Loader from '@/components/Loader/Loader.js'

import styles from './UsbMode.module.css'

import flashImage from '@/assets/flash.png'

interface UsbModeProps {
  onStepComplete: () => void
}

enum State {
  Pending,
  Finding,
  InstallingDriver,
  Found,
  NotFound,
  Error
}

const UsbMode: React.FC<UsbModeProps> = ({ onStepComplete }) => {
  const [state, setState] = useState<State>(0)
  const [error, setError] = useState<string | null>(null)

  async function findCarThing() {
    if (navigator.userAgent.includes('Windows'))
      checkAndInstallDriverWindows()
    else {
      setState(State.Finding)
      const res = await window.api.findCarThing()
      setState(res ? State.Found : State.NotFound)
    }
  }

  async function checkAndInstallDriverWindows() {
    setState(State.Finding)
    const found = await window.api.findDevice()
    if (!found) return setState(State.NotFound)
    const driver = await window.api.checkDriver()
    if (!driver) {
      setState(State.InstallingDriver)
      const install = await window.api.installDriver()
      if (!install) {
        setState(State.Error)
        setError('Failed to install driver!')
        return
      }
      setState(State.Finding)
    }

    const res = await window.api.findCarThing()
    setState(res ? State.Found : State.NotFound)
  }

  return (
    <div className={styles.usbMode}>
      <p className={styles.step}>Step 1</p>
      <h1>Enter USB Mode</h1>
      <p>
        First, you have to put your CarThing into USB Mode to prepare it
        for flashing.
      </p>
      <p>
        Hold down the buttons as shown below. Then, connect CarThing to
        your computer.
      </p>
      <div className={styles.image}>
        <img src={flashImage} alt="" />
        {state === State.Finding ? (
          <div className={styles.state} key={'finding'}>
            <Loader />
            <p>Finding CarThing...</p>
          </div>
        ) : state === State.InstallingDriver ? (
          <div className={styles.state} key={'insatllingDriver'}>
            <Loader />
            <p>Installing libusbK driver...</p>
          </div>
        ) : state === State.Found ? (
          <div className={styles.state} key={'found'}>
            <span className="material-icons">check_circle</span>
            <p>Found CarThing in USB Mode!</p>
          </div>
        ) : state === State.NotFound ? (
          <div className={styles.state} key={'notfound'}>
            <span className="material-icons" data-type="error">
              error
            </span>
            <p>Could not find CarThing in USB Mode!</p>
          </div>
        ) : state === State.Error ? (
          <div className={styles.state} key={'error'}>
            <span className="material-icons" data-type={'error'}>
              error
            </span>
            <p>{error ?? 'An unexpected error occurred!'}</p>
          </div>
        ) : null}
      </div>
      <p
        className={styles.note}
        data-shown={state === State.InstallingDriver}
      >
        Installing the driver could take a few minutes. Please be patient.
      </p>
      <div className={styles.buttons}>
        {[State.Pending, State.NotFound, State.Error].includes(state) ? (
          <button onClick={findCarThing}>Find Car Thing</button>
        ) : state === State.Found ? (
          <button onClick={onStepComplete}>Continue</button>
        ) : null}
      </div>
    </div>
  )
}

export default UsbMode
