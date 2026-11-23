import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import PersonaPicker from './pages/PersonaPicker.jsx'
import { getState, getPersona, resetDemo } from './data/store.js'

const Discover = lazy(() => import('./pages/Discover.jsx'))
const EquipmentDetail = lazy(() => import('./pages/EquipmentDetail.jsx'))
const MyRequests = lazy(() => import('./pages/MyRequests.jsx'))
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'))

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
        <Nav persona={persona} onReset={handleReset} onSwitchPersona={refreshPersona} />
        <Suspense fallback={<div className="app-main" role="status">Loading...</div>}>
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
            <Route
              path="/admin"
              element={
                <AdminPanel
                  requests={storeState.requests}
                  equipment={storeState.equipment}
                  persona={persona}
                  onStateChange={refreshState}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <footer className="app-footer">
          <div className="footer-inner">
            <span>LabLink · University Shared Research & Innovation Laboratory</span>
            <span>Demo mode: Data persists in browser storage · No backend connection</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
