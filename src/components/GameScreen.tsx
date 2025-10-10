'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/context/GameContext'
import ListenMode from './game/ListenMode'
import ReadMode from './game/ReadMode'
import WriteMode from './game/WriteMode'
import { useGameFeedback } from '@/hooks/useGameFeedback'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

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
    <div className="flex flex-col items-center justify-center p-8 h-full w-full transition-opacity duration-500">
      <div className="flex justify-between items-center w-full max-w-xl mb-6">
        <h2 className="text-3xl font-bold text-gray-300">{getModeTitle()}</h2>
        <div className="relative">
          <span className="text-2xl font-bold text-green-400">Score: {state.score}</span>
        </div>
      </div>
      
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
      
      <button 
        onClick={handleBack}
        className="btn-game absolute bottom-4 left-4 px-6 py-2 rounded-full text-sm font-bold text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        Go Back ↩️
      </button>

      {showFeedback && (
        <div className="feedback">
          {feedbackMessage}
        </div>
      )}
    </div>
  )
}

