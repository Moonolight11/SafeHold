import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreateDeal from './pages/CreateDeal'
import DealDetails from './pages/DealDetails'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateDeal />} />
        <Route path="/deal/:id" element={<DealDetails />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
