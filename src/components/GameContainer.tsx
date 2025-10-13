'use client'

import { useEffect } from 'react'
import { useGame } from '@/context/GameContext'
import { useAuth } from '@/context/AuthContext'
import WelcomeScreen from './WelcomeScreen'
import LevelScreen from './LevelScreen'
import ModeScreen from './ModeScreen'
import GameScreen from './GameScreen'
import ParentLoginScreen from './ParentLoginScreen'
import ParentModeScreen from './ParentModeScreen'
import AccountManagementScreen from './AccountManagementScreen'
import Feedback from './Feedback'

export default function GameContainer() {
  const { state, dispatch } = useGame()
  const { user } = useAuth()

  // Sync user ID with GameContext when auth state changes
  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER_ID', payload: user.uid })
    } else {
      dispatch({ type: 'SET_USER_ID', payload: null })
    }
  }, [user, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ touchAction: 'manipulation' }}>
      <div className="container-bg rounded-[3rem] p-8 md:p-12 w-full max-w-4xl min-h-[70vh] flex flex-col items-center text-center relative shadow-xl" style={{ touchAction: 'manipulation' }}>
        <WelcomeScreen />
        <LevelScreen />
        <ModeScreen />
        <GameScreen />
        <ParentLoginScreen />
        <ParentModeScreen />
        <AccountManagementScreen />
        <Feedback />
      </div>
    </div>
  )
}

