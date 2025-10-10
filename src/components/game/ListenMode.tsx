'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { generateMultipleChoiceOptions, formatWord } from '@/utils/gameUtils'
import CaseToggle from '@/components/CaseToggle'
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
  
  // Use custom hooks
  const { initializeGameMode, playCurrentWord } = useGameModeInitialization({
    onPlayWord,
    onWordSelected: (word) => {
      const optionWords = generateMultipleChoiceOptions(word, state.currentWordList, 4)
      setOptions(optionWords)
      setButtonsDisabled(false)
      setDisabledButtons(new Set())
      onPlayWord(word)
    },
    onEmptyWordList: () => {
      setOptions([])
    }
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
    startListenAndTap()
  }, [])


  if (state.currentWordList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <p className="text-xl">ADD WORDS IN PARENT MODE!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-4 mb-8">
        <RepeatButton />
        <CaseToggle />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
        {options.map((word, index) => {
          const isDisabled = buttonsDisabled || disabledButtons.has(word)
          return (
            <button
              key={index}
              onClick={() => handleTapAnswer(word)}
              disabled={isDisabled}
              className={`btn-game btn-answer p-6 rounded-xl text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 w-full md:w-auto ${
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
