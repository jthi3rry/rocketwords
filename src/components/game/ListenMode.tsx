'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { generateMultipleChoiceOptions, formatWord } from '@/utils/gameUtils'
import CaseToggleButton from '@/components/CaseToggleButton'
import RepeatButton from '@/components/RepeatButton'

interface ListenModeProps {
  onFeedback: (isCorrect: boolean) => void
  onPlayWord: (word: string) => void
}

export default function ListenMode({ onFeedback, onPlayWord }: ListenModeProps) {
  const { state, dispatch } = useGame()
  const [options, setOptions] = useState<string[]>([])
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [disabledButtons, setDisabledButtons] = useState(new Set<string>())
  const hasInitialized = useRef(false)
  
  // Memoize callbacks to prevent unnecessary re-renders
  const onWordSelected = useCallback((word: string) => {
    const optionWords = generateMultipleChoiceOptions(word, state.currentWordList, 4)
    setOptions(optionWords)
    setButtonsDisabled(false)
    setDisabledButtons(new Set())
    onPlayWord(word)
  }, [])

  const onEmptyWordList = useCallback(() => {
    setOptions([])
  }, [])

  // Use custom hooks
  const { initializeGameMode, playCurrentWord } = useGameModeInitialization({
    onPlayWord,
    onWordSelected,
    onEmptyWordList
  })

  const startListenAndTap = useCallback(() => {
    initializeGameMode()
  }, [initializeGameMode])

  const handleTapAnswer = (selectedWord: string) => {
    if (buttonsDisabled) return

    const isCorrect = selectedWord === state.currentWord

    if (isCorrect) {
      dispatch({ type: 'INCREMENT_SCORE' })
      onFeedback(true)
      setButtonsDisabled(true)
      // Automatically play the next word after a delay
      setTimeout(() => {
        startListenAndTap()
      }, 1500)
    } else {
      onFeedback(false)
      setDisabledButtons(prev => new Set(Array.from(prev).concat(selectedWord)))
    }
  }


  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      startListenAndTap()
    }
  }, []) // Only run on mount


  if (state.currentWordList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <p className="text-xl">ADD WORDS IN PARENT MODE!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        <RepeatButton />
        <CaseToggleButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full max-w-xl">
        {options.map((word, index) => {
          const isDisabled = buttonsDisabled || disabledButtons.has(word)
          return (
            <button
              key={index}
              onClick={() => handleTapAnswer(word)}
              disabled={isDisabled}
              className={`btn-game btn-answer p-3 sm:p-4 md:p-6 rounded-xl text-lg sm:text-xl md:text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 w-full md:w-auto ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formatWord(word, state.isUpperCase)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
