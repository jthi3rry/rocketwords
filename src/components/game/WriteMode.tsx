'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { generateLetterOptions, formatWord, formatLetter } from '@/utils/gameUtils'
import CaseToggleButton from '@/components/CaseToggleButton'
import RepeatButton from '@/components/RepeatButton'

interface WriteModeProps {
  onFeedback: (isCorrect: boolean) => void
  onPlayWord: (word: string) => void
}

export default function WriteMode({ onFeedback, onPlayWord }: WriteModeProps) {
  const { state, dispatch } = useGame()
  const [currentWord, setCurrentWord] = useState('')
  const [typedWord, setTypedWord] = useState('')
  const [letterButtons, setLetterButtons] = useState<{ letter: string; id: string }[]>([])
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  
  // Use custom hooks
  const { initializeGameMode, playCurrentWord } = useGameModeInitialization({
    onPlayWord,
    onWordSelected: (word) => {
      setCurrentWord(formatWord(word, state.isUpperCase))
      setTypedWord('')
      setButtonsDisabled(false)
      const letterOptions = generateLetterOptions(word)
      setLetterButtons(letterOptions)
    },
    onEmptyWordList: () => {
      setCurrentWord('ADD WORDS IN PARENT MODE!')
    }
  })

  const startTypeTheWord = useCallback(() => {
    initializeGameMode()
  }, [initializeGameMode])

  const handleLetterTap = (letterId: string) => {
    if (buttonsDisabled) return

    const letterOption = letterButtons.find(btn => btn.id === letterId)
    if (!letterOption) return

    const nextLetter = state.currentWord?.[typedWord.length]

    if (letterOption.letter === nextLetter) {
      const newTypedWord = typedWord + letterOption.letter
      setTypedWord(newTypedWord)
      
      // Remove the selected letter button
      setLetterButtons(prev => prev.filter(btn => btn.id !== letterId))
      
      if (state.currentWord === newTypedWord) {
        dispatch({ type: 'INCREMENT_SCORE' })
        onFeedback(true)
        setButtonsDisabled(true)
        setTimeout(() => {
          initializeGameMode()
        }, 1500)
      }
    } else {
      // Reset on mistake: clear typed word and restore all letters
      setTypedWord('')
      onFeedback(false)
      if (state.currentWord) {
        const letterOptions = generateLetterOptions(state.currentWord)
        setLetterButtons(letterOptions)
      }
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
        <CaseToggleButton />
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
      <div className="flex flex-wrap justify-center gap-2 mt-4 min-h-[6rem]">
        {letterButtons.map((letterOption) => (
          <button
            key={letterOption.id}
            onClick={() => handleLetterTap(letterOption.id)}
            disabled={buttonsDisabled}
            className={`btn-game btn-answer px-6 py-4 rounded-xl text-3xl font-bold hover:scale-110 ${
              buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {formatLetter(letterOption.letter, state.isUpperCase)}
          </button>
        ))}
      </div>
    </div>
  )
}
