'use client'

import { useGame } from '@/context/GameContext'

export default function WelcomeScreen() {
  const { state, dispatch } = useGame()

  const handleStart = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level' })
  }

  const handleParentMode = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'parentLogin' })
  }

  if (state.currentScreen !== 'welcome') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full w-full transition-opacity duration-500">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
          🚀&nbsp;Rocket&nbsp;Words!&nbsp;⭐
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-md">
          Let&apos;s learn some new words! Are you ready for an adventure?
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={handleStart}
            className="btn-game px-8 py-4 rounded-full text-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
          >
            Start 🚀
          </button>
        </div>
      </div>
      {/* Parent Mode Cog Icon */}
      <button 
        onClick={handleParentMode}
        className="absolute bottom-4 left-4 p-4 rounded-full text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors text-3xl"
      >
        ⚙️
      </button>
    </div>
  )
}
