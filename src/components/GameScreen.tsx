'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/context/GameContext'
import ListenMode from './game/ListenMode'
import ReadMode from './game/ReadMode'
import WriteMode from './game/WriteMode'
import { useGameFeedback } from '@/hooks/useGameFeedback'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import BackButton from './BackButton'

export default function GameScreen() {
  const { state, dispatch } = useGame()
  const { playWord } = useSpeechSynthesis()
  const { showFeedback, feedbackMessage, showInlineFeedback } = useGameFeedback()

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'mode' })
  }


  const getModeTitle = () => {
    const modeTitles: Record<string, string> = {
      listen: 'Listen',
      read: 'Read',
      write: 'Write'
    }
    return `${state.currentLevelName} - ${modeTitles[state.mode || '']}`
  }

  if (state.currentScreen !== 'game') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 h-full w-full transition-opacity duration-500">
      <div className="flex justify-between items-center w-full max-w-xl mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-300">{getModeTitle()}</h2>
        <div className="relative">
          <span className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-green-400">Score: {state.score}</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full pb-16 sm:pb-20">
        {state.mode === 'listen' && (
          <ListenMode 
            key="listen"
            onFeedback={showInlineFeedback}
            onPlayWord={playWord}
          />
        )}
        
        {state.mode === 'read' && (
          <ReadMode 
            key="read"
            onFeedback={showInlineFeedback}
            onPlayWord={playWord}
          />
        )}
        
        {state.mode === 'write' && (
          <WriteMode 
            key="write"
            onFeedback={showInlineFeedback}
            onPlayWord={playWord}
          />
        )}
      </div>
      
      <BackButton onClick={handleBack} />

      {showFeedback && (
        <div className="feedback">
          {feedbackMessage}
        </div>
      )}
    </div>
  )
}

