import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import ArchetypeView from './pages/ArchetypeView'
import Methodology from './pages/Methodology'
import PainPoints from './pages/PainPoints'
import NextSteps from './pages/NextSteps'
import OrganizationView from './pages/OrganizationView'
import ProductIdeas from './pages/ProductIdeas'
import Appendix from './pages/Appendix'
import PipelineMethodology from './pages/PipelineMethodology'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/organizations/cspd" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/archetypes/:archetypeId" element={<ArchetypeView />} />
        <Route path="/organizations/:orgId" element={<OrganizationView />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/pain-points" element={<PainPoints />} />
        <Route path="/next-steps" element={<NextSteps />} />
        <Route path="/product-ideas" element={<ProductIdeas />} />
        <Route path="/how-it-works" element={<PipelineMethodology />} />
        <Route path="/appendix" element={<Appendix />} />
      </Routes>
    </Layout>
  )
}

export default App
