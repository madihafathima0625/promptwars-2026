import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import PersonaPicker from './pages/PersonaPicker.jsx'
import Discover from './pages/Discover.jsx'
import EquipmentDetail from './pages/EquipmentDetail.jsx'
import MyRequests from './pages/MyRequests.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import { getState, getPersona, resetDemo } from './data/store.js'

export default function App() {
  const [storeState, setStoreState] = useState(() => getState())
  const [persona, setPersonaState] = useState(() => getPersona())

  const refreshState = () => {
    setStoreState(getState())
  }

  const refreshPersona = () => {
    setPersonaState(getPersona())
  }

  const handleReset = () => {
    const fresh = resetDemo()
    setStoreState(fresh)
    refreshPersona()
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <header>
          <Nav persona={persona} onReset={handleReset} onSwitchPersona={refreshPersona} />
        </header>
        <Routes>
          <Route path="/" element={<PersonaPicker onPersonaChange={refreshPersona} />} />
          <Route path="/discover" element={<Discover equipment={storeState.equipment} />} />
          <Route
            path="/equipment/:id"
            element={
              <EquipmentDetail
                equipment={storeState.equipment}
                persona={persona}
                onStateChange={refreshState}
              />
            }
          />
          <Route
            path="/requests"
            element={
              <MyRequests
                requests={storeState.requests}
                equipment={storeState.equipment}
                persona={persona}
              />
            }
          />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
