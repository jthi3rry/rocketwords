'use client'

import { useGame } from '@/context/GameContext'
import WelcomeScreen from './WelcomeScreen'
import LevelScreen from './LevelScreen'
import ModeScreen from './ModeScreen'
import GameScreen from './GameScreen'
import ParentLoginScreen from './ParentLoginScreen'
import ParentModeScreen from './ParentModeScreen'
import Feedback from './Feedback'

export default function GameContainer() {
  const { state } = useGame()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="container-bg rounded-[3rem] p-8 md:p-12 w-full max-w-4xl min-h-[70vh] flex flex-col items-center text-center relative shadow-xl">
        <WelcomeScreen />
        <LevelScreen />
        <ModeScreen />
        <GameScreen />
        <ParentLoginScreen />
        <ParentModeScreen />
        <Feedback />
      </div>
    </div>
  )
}

