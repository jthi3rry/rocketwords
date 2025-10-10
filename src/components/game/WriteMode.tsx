'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { generateUniqueLetters, formatWord, formatLetter } from '@/utils/gameUtils'
import CaseToggle from '@/components/CaseToggle'
import RepeatButton from '@/components/RepeatButton'

interface WriteModeProps {
  onFeedback: (isCorrect: boolean) => void
  onPlayWord: (word: string) => void
}

export default function WriteMode({ onFeedback, onPlayWord }: WriteModeProps) {
  const { state, dispatch } = useGame()
  const [currentWord, setCurrentWord] = useState('')
  const [typedWord, setTypedWord] = useState('')
  const [letterButtons, setLetterButtons] = useState<string[]>([])
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  
  // Use custom hooks
  const { initializeGameMode, playCurrentWord } = useGameModeInitialization({
    onPlayWord,
    onWordSelected: (word) => {
      setCurrentWord(formatWord(word, state.isUpperCase))
      setTypedWord('')
      setButtonsDisabled(false)
      const shuffledLetters = generateUniqueLetters(word)
      setLetterButtons(shuffledLetters)
    },
    onEmptyWordList: () => {
      setCurrentWord('ADD WORDS IN PARENT MODE!')
    }
  })

  const startTypeTheWord = useCallback(() => {
    initializeGameMode()
  }, [initializeGameMode])

  const handleLetterTap = (letter: string) => {
    if (buttonsDisabled) return

    const nextLetter = state.currentWord?.[typedWord.length]

    if (letter === nextLetter) {
      const newTypedWord = typedWord + letter
      setTypedWord(newTypedWord)
      
      if (state.currentWord === newTypedWord) {
        dispatch({ type: 'INCREMENT_SCORE' })
        onFeedback(true)
        setButtonsDisabled(true)
        setTimeout(() => {
          initializeGameMode()
        }, 1500)
      }
    } else {
      setTypedWord('')
      onFeedback(false)
    }
  }

  useEffect(() => {
    initializeGameMode()
  }, []) // Only run on mount

  // Update current word when case changes
  useEffect(() => {
    if (state.currentWord) {
      setCurrentWord(formatWord(state.currentWord, state.isUpperCase))
    }
  }, [state.isUpperCase, state.currentWord])

  const displayTypedWord = () => {
    if (!state.currentWord) return ''
    const placeholder = Array(state.currentWord.length).fill('_')
    for (let i = 0; i < typedWord.length; i++) {
      placeholder[i] = formatLetter(typedWord[i], state.isUpperCase)
    }
    return placeholder.join(' ')
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-4 mb-8">
        <RepeatButton />
        <CaseToggle />
      </div>
      <div className="flex flex-col items-center w-full max-w-xl">
        <div className="p-8 bg-gray-800 rounded-3xl w-full text-center mb-8 shadow-md">
          <p className="text-5xl md:text-7xl font-extrabold text-blue-400 mb-4">
            {currentWord}
          </p>
          <p className="text-3xl md:text-5xl font-extrabold text-purple-400 p-2 min-h-[4rem]">
            {displayTypedWord()}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {letterButtons.map((letter, index) => (
          <button
            key={index}
            onClick={() => handleLetterTap(letter)}
            disabled={buttonsDisabled}
            className={`btn-game btn-answer px-6 py-4 rounded-xl text-3xl font-bold hover:scale-110 ${
              buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {formatLetter(letter, state.isUpperCase)}
          </button>
        ))}
      </div>
    </div>
  )
}
