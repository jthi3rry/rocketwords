'use client'

import { useGame } from '@/context/GameContext'
import { getSortedLevelKeys } from '@/utils/gameUtils'
import BackButton from './BackButton'

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
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 h-full w-full transition-opacity duration-500">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-400 mb-4 sm:mb-6 md:mb-8 text-center">
        Choose your adventure!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full max-w-xl mb-8 sm:mb-12">
        {getSortedLevelKeys(state.levels, state.levelOrder).map(key => (
          <button
            key={key}
            onClick={() => handleLevelSelect(key)}
            className="btn-game btn-level px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold hover:scale-105"
          >
            {state.levels[key].name}
          </button>
        ))}
        <button
          onClick={() => handleLevelSelect('all-levels')}
          className="btn-game px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold hover:scale-105 bg-blue-500 hover:bg-blue-600"
        >
          All Levels
        </button>
      </div>
      <BackButton onClick={handleBack} />
    </div>
  )
}
