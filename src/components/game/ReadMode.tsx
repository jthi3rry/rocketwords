'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { formatWord } from '@/utils/gameUtils'
import CaseToggle from '@/components/CaseToggle'
import RepeatButton from '@/components/RepeatButton'

interface ReadModeProps {
  onFeedback: (isCorrect: boolean) => void
  onPlayWord: (word: string) => void
}

export default function ReadMode({ onFeedback, onPlayWord }: ReadModeProps) {
  const { state, dispatch } = useGame()
  const [currentWord, setCurrentWord] = useState('')
  
  // Use custom hooks
  const { initializeGameMode, playCurrentWord } = useGameModeInitialization({
    onPlayWord,
    onWordSelected: (word) => {
      setCurrentWord(formatWord(word, state.isUpperCase))
    },
    onEmptyWordList: () => {
      setCurrentWord('ADD WORDS IN PARENT MODE!')
    }
  })


  const startReadTheWord = useCallback(() => {
    initializeGameMode()
  }, [initializeGameMode])

  const handleISaidIt = () => {
    dispatch({ type: 'INCREMENT_SCORE' })
    onFeedback(true)
    setTimeout(startReadTheWord, 1500)
  }

  const handleNextWord = () => {
    startReadTheWord()
  }


  useEffect(() => {
    startReadTheWord()
  }, [])

  // Update current word when case changes
  useEffect(() => {
    if (state.currentWord) {
      setCurrentWord(formatWord(state.currentWord, state.isUpperCase))
    }
  }, [state.isUpperCase, state.currentWord])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-4 mb-8">
        <RepeatButton />
        <CaseToggle />
      </div>
      <div 
        className="p-8 bg-gray-800 rounded-3xl w-full max-w-2xl text-center mb-8 shadow-md"
      >
        <p className="text-5xl md:text-7xl font-extrabold text-blue-400">
          {currentWord}
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <button 
          onClick={handleISaidIt}
          className="btn-game btn-answer px-8 py-4 rounded-full text-2xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
        >
          I said it! 🎉
        </button>
        <button 
          onClick={handleNextWord}
          className="btn-game btn-mode px-8 py-4 rounded-full text-2xl font-bold text-white bg-purple-500 hover:bg-purple-600 transition-colors"
        >
          Next Word ➡️
        </button>
      </div>
    </div>
  )
}
