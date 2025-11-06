import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import InvestorView from './pages/InvestorView'
import CapTable from './pages/CapTable'
import { ADMIN_ADDRESSES } from './config/contracts'

function RouteManager() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase())

  // Redirect to appropriate dashboard when wallet changes
  useEffect(() => {
    if (isConnected && address) {
      // If admin is on /investor, redirect to /
      if (isAdmin && location.pathname === '/investor') {
        navigate('/', { replace: true })
      }
      // If investor is on /, redirect to /investor
      if (!isAdmin && location.pathname === '/') {
        navigate('/investor', { replace: true })
      }
    }
  }, [address, isAdmin, isConnected, location.pathname, navigate])

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          !isConnected ? <Dashboard /> : 
          isAdmin ? <Dashboard /> : 
          <Navigate to="/investor" replace />
        } 
      />
      <Route path="/investor" element={<InvestorView />} />
      <Route path="/captable" element={<CapTable />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <RouteManager />
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
