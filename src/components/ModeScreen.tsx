'use client'

import { useGame } from '@/context/GameContext'
import BackButton from './BackButton'

export default function ModeScreen() {
  const { state, dispatch } = useGame()

  const handleModeSelect = (mode: string) => {
    dispatch({ type: 'SET_MODE', payload: mode })
    dispatch({ type: 'SET_SCREEN', payload: 'game' })
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level' })
  }

  if (state.currentScreen !== 'mode') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 h-full w-full transition-opacity duration-500">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-400 mb-4 sm:mb-6 md:mb-8 text-center">
        How do you want to play?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-2xl mb-8 sm:mb-12">
        <button 
          onClick={() => handleModeSelect('listen')}
          className="btn-game btn-mode px-4 sm:px-6 py-6 sm:py-8 rounded-2xl text-lg sm:text-xl md:text-2xl font-bold hover:scale-105"
        >
          <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">👂</span><br />Listen
        </button>
        <button 
          onClick={() => handleModeSelect('read')}
          className="btn-game btn-mode px-4 sm:px-6 py-6 sm:py-8 rounded-2xl text-lg sm:text-xl md:text-2xl font-bold hover:scale-105"
        >
          <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">📖</span><br />Read
        </button>
        <button 
          onClick={() => handleModeSelect('write')}
          className="btn-game btn-mode px-4 sm:px-6 py-6 sm:py-8 rounded-2xl text-lg sm:text-xl md:text-2xl font-bold hover:scale-105"
        >
          <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">✍️</span><br />Write
        </button>
      </div>
      <BackButton onClick={handleBack} />
    </div>
  )
}

