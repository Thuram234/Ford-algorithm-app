import { useState }   from 'react'
import LandingPage    from './components/layouts/LandingPage'
import MainLayout     from './components/layouts/MainLayout'
import './App.css'

/*
 * App — root component
 * Controls which page is displayed :
 *  'landing' | 'editor'
 */
function App() {
  const [page, setPage] = useState('landing')

  if (page === 'landing') {
    return <LandingPage onStart={() => setPage('editor')} />
  }

  return <MainLayout />
}

export default App