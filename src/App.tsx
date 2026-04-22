import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import RunCatalog from './pages/RunCatalog'
import RunDetail from './pages/RunDetail'
import SaveStateCatalog from './pages/SaveStateCatalog'
import Comparison from './pages/Comparison'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Skills from './pages/Skills'
import Play from './pages/Play'

export default function App() {
  return (
    <Routes>
      {/* Chrome-less popout route — must sit OUTSIDE the Layout wrapper */}
      <Route path="/play/:runId" element={<Play />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:gameId" element={<GameDetail />} />
        <Route path="/games/:gameId/skills" element={<Skills />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/runs" element={<RunCatalog />} />
        <Route path="/runs/:runId" element={<RunDetail />} />
        <Route path="/save-states" element={<SaveStateCatalog />} />
        <Route path="/compare" element={<Comparison />} />
      </Route>
    </Routes>
  )
}
