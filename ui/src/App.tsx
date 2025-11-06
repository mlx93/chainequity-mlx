import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Toaster } from 'sonner'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import InvestorView from './pages/InvestorView'
import CapTable from './pages/CapTable'
import { ADMIN_ADDRESSES } from './config/contracts'

function RouteManager() {
  const { address, isConnected } = useAccount()
  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase())

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
