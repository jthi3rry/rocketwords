'use client'

import { useGame } from '@/context/GameContext'

export default function CaseToggleButton() {
  const { state, dispatch } = useGame()

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_CASE' })
  }

  return (
    <button
      onClick={handleToggle}
      className="btn-game btn-mode p-2 sm:p-3 rounded-full text-lg sm:text-xl md:text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 bg-blue-500 hover:bg-blue-600 text-white"
      title={`Switch to ${state.isUpperCase ? 'lowercase' : 'uppercase'} letters`}
    >
      {state.isUpperCase ? 'Aa' : 'aA'}
    </button>
  )
}

