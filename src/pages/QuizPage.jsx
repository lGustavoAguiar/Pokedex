import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PokemonService from '../data/pokemonService'
import './QuizPage.css'

// Função para criar silhueta usando Canvas
const createSilhouette = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Desenha a imagem original
      ctx.drawImage(img, 0, 0);
      
      // Pega os dados da imagem
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Converte para silhueta (pixels não transparentes ficam pretos)
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3]; // Canal alpha
        
        if (alpha > 0) { // Se não é transparente
          data[i] = 0;     // Red = 0
          data[i + 1] = 0; // Green = 0  
          data[i + 2] = 0; // Blue = 0
          data[i + 3] = 255; // Alpha = 255 (opaco)
        }
      }
      
      // Aplica os dados modificados
      ctx.putImageData(imageData, 0, 0);
      
      // Converte para data URL
      resolve(canvas.toDataURL());
    };
    
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = imageUrl;
  });
};

// Função para formatar dados do Pokémon (mesma usada no resto do projeto)
const formatPokemonData = (pokemonData) => {
  // Usa sempre o sprite padrão para melhor compatibilidade com silhuetas
  let imageUrl = pokemonData.sprites.front_default ||
                 `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`

  // Fallback adicional se a URL estiver vazia ou nula
  if (!imageUrl) {
    imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`
  }

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    types: pokemonData.types.map(type => type.type.name),
    image: imageUrl
  };
};

// Definição das gerações Pokémon
const POKEMON_GENERATIONS = {
  1: { name: 'Kanto (Gen I)', range: [1, 151], emoji: '🔴' },
  2: { name: 'Johto (Gen II)', range: [152, 251], emoji: '🟡' },
  3: { name: 'Hoenn (Gen III)', range: [252, 386], emoji: '🟢' },
  4: { name: 'Sinnoh (Gen IV)', range: [387, 493], emoji: '🔵' },
  5: { name: 'Unova (Gen V)', range: [494, 649], emoji: '⚫' },
  6: { name: 'Kalos (Gen VI)', range: [650, 721], emoji: '🟣' },
  7: { name: 'Alola (Gen VII)', range: [722, 809], emoji: '🟠' },
  8: { name: 'Galar (Gen VIII)', range: [810, 905], emoji: '⚪' },
  9: { name: 'Paldea (Gen IX)', range: [906, 1010], emoji: '🔶' }
}

const QuizPage = () => {
  const navigate = useNavigate()
  const [currentPokemon, setCurrentPokemon] = useState(null)
  const [silhouetteImage, setSilhouetteImage] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [selectedGeneration, setSelectedGeneration] = useState('all')
  const [showGenerationSelect, setShowGenerationSelect] = useState(false)

  // Gera um número aleatório baseado na geração selecionada
  const getRandomPokemonId = () => {
    if (selectedGeneration === 'all') {
      return Math.floor(Math.random() * 1010) + 1
    }
    
    const generation = POKEMON_GENERATIONS[selectedGeneration]
    if (generation) {
      const [min, max] = generation.range
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    
    return Math.floor(Math.random() * 1010) + 1
  }

  // Formata o nome do Pokémon para exibição
  const formatPokemonName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Lida com erro de carregamento da imagem
  const handleImageError = () => {
    console.log('Quiz: Erro ao carregar imagem, usando fallback...')
    setImageError(true)
  }

  // Lida com sucesso no carregamento da imagem
  const handleImageLoad = () => {
    setImageError(false)
  }

  // Carrega um novo Pokémon para o quiz
  const loadNewQuestion = async () => {
    setLoading(true)
    setSelectedAnswer(null)
    setShowResult(false)
    setImageError(false)
    setSilhouetteImage(null)

    try {
      // Gera o Pokémon correto
      const correctPokemonId = getRandomPokemonId()
      const correctPokemonData = await PokemonService.getPokemon(correctPokemonId.toString())
      
      // Verifica se os dados foram carregados corretamente
      if (!correctPokemonData || !correctPokemonData.name || !correctPokemonData.sprites) {
        console.error('Dados do Pokémon incompletos:', correctPokemonData)
        throw new Error('Dados do Pokémon incompletos')
      }
      
      const correctPokemon = formatPokemonData(correctPokemonData)
      
      // Log para debug (pode ser removido depois)
      console.log('Quiz: Pokémon carregado -', correctPokemon.name, '(ID:', correctPokemon.id, ')')
      
      // Cria a silhueta
      try {
        const silhouette = await createSilhouette(correctPokemon.image)
        setSilhouetteImage(silhouette)
        console.log('Quiz: Silhueta criada com sucesso')
      } catch (silhouetteError) {
        console.error('Erro ao criar silhueta:', silhouetteError)
        setSilhouetteImage(null)
      }
      
      setCurrentPokemon(correctPokemon)

      // Gera 3 opções incorretas aleatórias
      const wrongOptions = []
      const usedIds = new Set([correctPokemonId])

              while (wrongOptions.length < 3) {
        const randomId = getRandomPokemonId()
        if (!usedIds.has(randomId)) {
          usedIds.add(randomId)
          try {
            const wrongPokemonData = await PokemonService.getPokemon(randomId.toString())
            const wrongPokemon = formatPokemonData(wrongPokemonData)
            wrongOptions.push({
              id: wrongPokemon.id,
              name: wrongPokemon.name
            })
          } catch (error) {
            console.log(`Erro ao carregar Pokémon ${randomId}, tentando outro...`)
            continue
          }
        }
      }

      // Combina a resposta correta com as incorretas e embaralha
      const allOptions = [
        { id: correctPokemon.id, name: correctPokemon.name, isCorrect: true },
        ...wrongOptions.map(pokemon => ({ ...pokemon, isCorrect: false }))
      ]

      // Embaralha as opções
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)
      setOptions(shuffledOptions)

    } catch (error) {
      console.error('Erro ao carregar pergunta:', error)
      // Tenta novamente com outro Pokémon
      setTimeout(loadNewQuestion, 1000)
    } finally {
      setLoading(false)
    }
  }

  // Inicia o jogo
  const startGame = (generation = 'all') => {
    setSelectedGeneration(generation)
    setGameStarted(true)
    setScore(0)
    setQuestionsAnswered(0)
    setShowGenerationSelect(false)
    loadNewQuestion()
  }

  // Reinicia o jogo
  const restartGame = () => {
    setGameStarted(false)
    setScore(0)
    setQuestionsAnswered(0)
    setCurrentPokemon(null)
    setOptions([])
    setSelectedAnswer(null)
    setShowResult(false)
    setShowGenerationSelect(false)
    setSelectedGeneration('all')
  }

  // Lida com a seleção de uma resposta
  const handleAnswerSelect = (option) => {
    if (showResult) return

    setSelectedAnswer(option)
    setShowResult(true)
    setIsCorrect(option.isCorrect)
    
    if (option.isCorrect) {
      setScore(score + 1)
    }
    
    setQuestionsAnswered(questionsAnswered + 1)

    // Scroll automático para mostrar os botões de ação após responder
    setTimeout(() => {
      const actionsElement = document.querySelector('.quiz-actions')
      if (actionsElement) {
        actionsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }, 500) // Aguarda um pouco para a animação da resposta aparecer
  }

  // Avança para a próxima pergunta
  const nextQuestion = () => {
    loadNewQuestion()
  }

  // Volta para a página inicial
  const goHome = () => {
    navigate('/')
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-button" onClick={goHome}>
            ← Voltar ao Pokédex
          </button>
          <h1 className="quiz-title">
            <span className="pokeball-icon"></span>
            Quiz Pokémon
          </h1>
          <p className="quiz-subtitle">Quem é esse Pokémon?</p>
        </div>

        {!gameStarted ? (
          <div className="game-start">
            {!showGenerationSelect ? (
              <>
                <div className="start-info">
                  <h2>Bem-vindo ao Quiz Pokémon!</h2>
                  <p>
                    Teste seus conhecimentos sobre Pokémon! Você verá uma silhueta ou imagem 
                    de um Pokémon e terá que escolher o nome correto entre 4 opções.
                  </p>
                  <ul>
                    <li>🎮 Pokémons de diferentes gerações</li>
                    <li>🏆 Acompanhe sua pontuação</li>
                    <li>⚡ Desafie-se e divirta-se!</li>
                  </ul>
                </div>
                <button 
                  className="start-button" 
                  onClick={() => setShowGenerationSelect(true)}
                >
                  Escolher Geração
                </button>
              </>
            ) : (
              <div className="generation-selection">
                <h2>Escolha uma Geração</h2>
                <p>Selecione qual geração de Pokémon você quer no seu quiz:</p>
                
                <div className="generation-grid">
                  <button 
                    className="generation-button all-generations"
                    onClick={() => startGame('all')}
                  >
                    <span className="generation-emoji">🌟</span>
                    <span className="generation-name">Todas as Gerações</span>
                    <span className="generation-count">1-1010</span>
                  </button>
                  
                  {Object.entries(POKEMON_GENERATIONS).map(([gen, data]) => (
                    <button 
                      key={gen}
                      className="generation-button"
                      onClick={() => startGame(gen)}
                    >
                      <span className="generation-emoji">{data.emoji}</span>
                      <span className="generation-name">{data.name}</span>
                      <span className="generation-count">{data.range[0]}-{data.range[1]}</span>
                    </button>
                  ))}
                </div>
                
                <button 
                  className="back-to-start-button"
                  onClick={() => setShowGenerationSelect(false)}
                >
                  ← Voltar
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="quiz-stats">
              <div className="stat">
                <span className="stat-label">Pontuação:</span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Perguntas:</span>
                <span className="stat-value">{questionsAnswered}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Taxa de acerto:</span>
                <span className="stat-value">
                  {questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0}%
                </span>
              </div>
            </div>

            {loading ? (
              <div className="quiz-loading">
                <div className="loading-spinner"></div>
                <p>Carregando próximo Pokémon...</p>
              </div>
            ) : currentPokemon ? (
              <div className="quiz-question">
                <div className="pokemon-display">
                  {!showResult && (
                    <div className="mystery-text">
                      <h3>🤔 Quem é esse Pokémon?</h3>
                    </div>
                  )}
                  <img 
                    src={showResult ? 
                      currentPokemon.image : 
                      (silhouetteImage || currentPokemon.image)
                    } 
                    alt="Quem é esse Pokémon?" 
                    className={`pokemon-image ${!showResult && !silhouetteImage ? 'silhouette' : ''}`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                  {showResult && (
                    <div className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓ Correto!' : '✗ Incorreto!'}
                      <p className="correct-answer">
                        Resposta: {formatPokemonName(currentPokemon.name)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="options-container">
                  {options.map((option, index) => (
                    <button
                      key={option.id}
                      className={`option-button ${
                        selectedAnswer?.id === option.id ? 'selected' : ''
                      } ${
                        showResult && option.isCorrect ? 'correct' : ''
                      } ${
                        showResult && selectedAnswer?.id === option.id && !option.isCorrect ? 'incorrect' : ''
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                    >
                      {formatPokemonName(option.name)}
                    </button>
                  ))}
                </div>

                {showResult && (
                  <div className="quiz-actions">
                    <button className="next-button" onClick={nextQuestion}>
                      Próxima Pergunta →
                    </button>
                    <button className="restart-button" onClick={restartGame}>
                      Reiniciar Quiz
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default QuizPage
