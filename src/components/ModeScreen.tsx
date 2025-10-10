'use client'

import { useGame } from '@/context/GameContext'

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
    <div className="flex flex-col items-center justify-center p-8 h-full w-full transition-opacity duration-500">
      <h2 className="text-3xl md:text-4xl font-extrabold text-purple-400 mb-8">
        How do you want to play?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mb-8">
        <button 
          onClick={() => handleModeSelect('listen')}
          className="btn-game btn-mode px-6 py-8 rounded-2xl text-2xl font-bold hover:scale-105"
        >
          <span className="text-4xl mb-2">👂</span><br />Listen
        </button>
        <button 
          onClick={() => handleModeSelect('read')}
          className="btn-game btn-mode px-6 py-8 rounded-2xl text-2xl font-bold hover:scale-105"
        >
          <span className="text-4xl mb-2">📖</span><br />Read
        </button>
        <button 
          onClick={() => handleModeSelect('write')}
          className="btn-game btn-mode px-6 py-8 rounded-2xl text-2xl font-bold hover:scale-105"
        >
          <span className="text-4xl mb-2">✍️</span><br />Write
        </button>
      </div>
      <button 
        onClick={handleBack}
        className="btn-game px-6 py-2 rounded-full text-sm font-bold text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        Go Back ↩️
      </button>
    </div>
  )
}

