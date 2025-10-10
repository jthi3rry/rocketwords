'use client'

import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

/**
 * Self-contained repeat button component for playing the current word
 * No props needed - component manages its own functionality
 */
export default function RepeatButton() {
  const { playWord } = useSpeechSynthesis()
  const { playCurrentWord } = useGameModeInitialization({ onPlayWord: playWord })

  return (
    <button 
      onClick={playCurrentWord}
      className="btn-game btn-mode p-4 rounded-full"
    >
      <span className="text-6xl">🗣️</span>
    </button>
  )
}
