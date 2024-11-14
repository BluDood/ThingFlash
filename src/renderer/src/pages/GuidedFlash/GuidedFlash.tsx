import React, { useState } from 'react'

import UsbMode from './Steps/UsbMode/UsbMode.js'
import SelectImage from './Steps/SelectImage/SelectImage.js'
import Flash from './Steps/Flash/Flash.js'
import Done from './Steps/Done/Done.js'

import styles from './GuidedFlash.module.css'

enum Steps {
  UsbMode,
  SelectImage,
  Flash,
  Done
}

const GuidedFlash: React.FC = () => {
  const [step, setStep] = useState<Steps>(0)

  return (
    <div className={styles.guidedFlash}>
      {step === Steps.UsbMode ? (
        <UsbMode onStepComplete={() => setStep(Steps.SelectImage)} />
      ) : step === Steps.SelectImage ? (
        <SelectImage onStepComplete={() => setStep(Steps.Flash)} />
      ) : step === Steps.Flash ? (
        <Flash onStepComplete={() => setStep(Steps.Done)} />
      ) : step === Steps.Done ? (
        <Done />
      ) : null}
    </div>
  )
}

export default GuidedFlash
