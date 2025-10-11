'use client'

import { useGame } from '@/context/GameContext'
import { getSortedLevelKeys } from '@/utils/gameUtils'

export default function LevelScreen() {
  const { state, dispatch } = useGame()

  const handleLevelSelect = (levelKey: string) => {
    if (levelKey === 'all-levels') {
      dispatch({
        type: 'SET_LEVEL_DATA',
        payload: {
          levelName: 'All Levels',
          wordList: Object.values(state.levels).reduce((acc: string[], level) => acc.concat(level.words), [])
        }
      })
    } else {
      dispatch({
        type: 'SET_LEVEL_DATA',
        payload: {
          levelName: state.levels[levelKey].name,
          wordList: state.levels[levelKey].words
        }
      })
    }
    // Reset last word when changing levels
    dispatch({ type: 'SET_CURRENT_WORD', payload: null })
    dispatch({ type: 'SET_SCREEN', payload: 'mode' })
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'welcome' })
  }

  if (state.currentScreen !== 'level') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full w-full transition-opacity duration-500">
      <h2 className="text-3xl md:text-4xl font-extrabold text-purple-400 mb-8">
        Choose your adventure!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mb-8">
        {getSortedLevelKeys(state.levels).map(key => (
          <button
            key={key}
            onClick={() => handleLevelSelect(key)}
            className="btn-game btn-level px-6 py-4 rounded-2xl text-xl font-bold hover:scale-105"
          >
            {state.levels[key].name}
          </button>
        ))}
        <button
          onClick={() => handleLevelSelect('all-levels')}
          className="btn-game px-6 py-4 rounded-2xl text-xl font-bold hover:scale-105 bg-blue-500 hover:bg-blue-600"
        >
          All Levels
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
