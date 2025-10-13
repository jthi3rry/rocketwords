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
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 h-full w-full transition-opacity duration-500">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 md:mb-8 leading-tight">
          🚀&nbsp;Rocket&nbsp;Words!&nbsp;⭐
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-10 max-w-md text-center px-4">
          Let&apos;s learn some new words! Are you ready for an adventure?
        </p>
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <button 
            onClick={handleStart}
            className="btn-game px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-xl md:text-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
          >
            Start 🚀
          </button>
        </div>
      </div>
      {/* Parent Mode Button */}
      <button 
        onClick={handleParentMode}
        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-2 sm:px-4 sm:py-3 rounded-full text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
        title="Parent Settings"
        aria-label="Open parent settings"
      >
        <span className="text-sm sm:text-base font-medium">Parent</span>
        <span className="text-lg sm:text-xl md:text-2xl">⚙️</span>
      </button>
    </div>
  )
}
