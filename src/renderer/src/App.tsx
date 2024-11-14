import { Route, Routes } from 'react-router-dom'

import Layout from './components/Layout/Layout.js'

import AdvancedFlash from './pages/AdvancedFlash/AdvancedFlash.js'
import GuidedFlash from './pages/GuidedFlash/GuidedFlash.js'
import Welcome from './pages/Welcome/Welcome.js'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="/guided" element={<GuidedFlash />} />
        <Route path="/advanced" element={<AdvancedFlash />} />
      </Route>
    </Routes>
  )
}

export default App
