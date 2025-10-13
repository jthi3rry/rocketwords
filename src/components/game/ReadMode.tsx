'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { formatWord } from '@/utils/gameUtils'
import CaseToggleButton from '@/components/CaseToggleButton'
import RepeatButton from '@/components/RepeatButton'

interface ReadModeProps {
  onFeedback: (isCorrect: boolean) => void
  onPlayWord: (word: string) => void
}

export default function ReadMode({ onFeedback, onPlayWord }: ReadModeProps) {
  const { state, dispatch } = useGame()
  const [currentWord, setCurrentWord] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const hasInitialized = useRef(false)
  
  // Memoize callbacks to prevent unnecessary re-renders
  const onWordSelected = useCallback((word: string) => {
    setCurrentWord(formatWord(word, state.isUpperCase))
    setIsButtonDisabled(false) // Re-enable button when new word loads
  }, [])

  const onEmptyWordList = useCallback(() => {
    setCurrentWord('ADD WORDS IN PARENT MODE!')
  }, [])

  // Use custom hooks
  const { initializeGameMode, playCurrentWord } = useGameModeInitialization({
    onPlayWord,
    onWordSelected,
    onEmptyWordList
  })


  const startReadTheWord = useCallback(() => {
    initializeGameMode()
  }, [initializeGameMode])

  const handleISaidIt = () => {
    setIsButtonDisabled(true) // Disable button immediately
    dispatch({ type: 'INCREMENT_SCORE' })
    onFeedback(true)
    setTimeout(startReadTheWord, 1500)
  }

  const handleNextWord = () => {
    startReadTheWord()
  }


  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      startReadTheWord()
    }
  }, []) // Only run on mount

  // Update current word when case changes
  useEffect(() => {
    if (state.currentWord) {
      setCurrentWord(formatWord(state.currentWord, state.isUpperCase))
    }
  }, [state.isUpperCase, state.currentWord])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        <RepeatButton />
        <CaseToggleButton />
      </div>
      <div 
        className="p-4 sm:p-6 md:p-8 bg-gray-800 rounded-3xl w-full max-w-2xl text-center mb-4 sm:mb-6 md:mb-8 shadow-md"
      >
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-blue-400">
          {currentWord}
        </p>
      </div>
      <div className="flex flex-row gap-2 sm:gap-3 md:gap-4">
        <button 
          onClick={handleISaidIt}
          disabled={isButtonDisabled}
          className={`btn-game btn-answer px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-xl md:text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          I said it! 🎉
        </button>
        <button 
          onClick={handleNextWord}
          className="btn-game btn-mode px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-xl md:text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          Next Word ➡️
        </button>
      </div>
    </div>
  )
}
