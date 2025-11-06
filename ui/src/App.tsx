import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import InvestorView from './pages/InvestorView'
import CapTable from './pages/CapTable'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investor" element={<InvestorView />} />
          <Route path="/captable" element={<CapTable />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
