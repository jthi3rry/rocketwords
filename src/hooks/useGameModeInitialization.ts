'use client'

import { useCallback } from 'react'
import { useGame } from '@/context/GameContext'

interface UseGameModeInitializationProps {
  onPlayWord: (word: string) => void
  onWordSelected?: (word: string) => void
  onEmptyWordList?: () => void
}

/**
 * Custom hook for game mode initialization logic
 * @param props - Configuration object with callbacks
 * @returns Object with initialization function and word playing function
 */
export const useGameModeInitialization = (props: UseGameModeInitializationProps) => {
  const { state, dispatch } = useGame()
  const { onPlayWord, onWordSelected, onEmptyWordList } = props

  const handleWordSelection = useCallback((wordList: string[]) => {
    if (wordList.length === 0) return null

    let newWord: string
    do {
      newWord = wordList[Math.floor(Math.random() * wordList.length)]
    } while (newWord === state.currentWord && wordList.length > 1)

    dispatch({ type: 'SET_CURRENT_WORD', payload: newWord })
    return newWord
  }, [state.currentWord, dispatch])

  const playCurrentWord = useCallback(() => {
    if (state.currentWord) {
      onPlayWord(state.currentWord)
    }
  }, [state.currentWord, onPlayWord])

  const initializeGameMode = useCallback(() => {
    const wordList = state.currentWordList
    if (wordList.length === 0) {
      onEmptyWordList?.()
      return null
    }

    const newWord = handleWordSelection(wordList)
    if (!newWord) return null

    onWordSelected?.(newWord)
    return newWord
  }, [handleWordSelection, state.currentWordList, onEmptyWordList, onWordSelected])

  return {
    initializeGameMode,
    playCurrentWord
  }
}
