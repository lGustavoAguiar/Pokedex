import { Routes, Route, useLocation } from 'react-router-dom'
import pokemonIcon from '../public/pokemon-icon.png';
import pokedexBackground from '../public/41763e61-7cc5-4c28-a7d8-1c912ad5eb49.png';
import './App.css'
import HomePage from './pages/HomePage'
import PokemonDetail from './pages/PokemonDetail'
import QuizPage from './pages/QuizPage'

function App() {
  const location = useLocation()
  const isQuizPage = location.pathname === '/quiz'

  return (
    <div className="app">
      {!isQuizPage && (
        <>
          <header className="app-header">
            <div className="app-title-container">
              <img src={pokemonIcon} alt="Pokédex" className="pokedex-icon" />
              <h1 className="app-title">
                Pokédex
              </h1>
            </div>
            <p className="app-subtitle">
              Descubra e explore o mundo dos Pokémons
            </p>
          </header>

          <div className="app-side-images">
            <img src={pokedexBackground} alt="Pokédex" className="side-image left" />
            <img src={pokedexBackground} alt="Pokédex" className="side-image right" />
          </div>
        </>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </div>
  )
}

export default App
