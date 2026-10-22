import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { api } from './api'
import type { Team } from './types'
import { Header } from './components/Header'
import { HistoricalPlayerDetailView } from './components/HistoricalPlayerDetailView'
import { HistoricalPlayersView } from './components/HistoricalPlayersView'
import { HomeView } from './components/HomeView'
import { PlayerDetailView } from './components/PlayerDetailView'
import { PlayersView } from './components/PlayersView'
import { RecordsView } from './components/RecordsView'
import { TeamsView } from './components/TeamsView'

export function App() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    api
      .getTeams({ page: 1, limit: 30 })
      .then((r) => setTeams(r.data))
      .catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-neutral-950 font-poppins">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomeView teams={teams} />} />
            <Route path="/players" element={<PlayersView />} />
            <Route path="/players/:id" element={<PlayerDetailView teams={teams} />} />
            <Route path="/teams" element={<TeamsView initialTeams={teams} />} />
            <Route path="/historical-players" element={<HistoricalPlayersView />} />
            <Route path="/historical-players/:id" element={<HistoricalPlayerDetailView />} />
            <Route path="/records" element={<RecordsView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
