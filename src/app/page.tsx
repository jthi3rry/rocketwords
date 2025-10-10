'use client'

import { GameProvider } from '@/context/GameContext'
import GameContainer from '@/components/GameContainer'

export default function Home() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  )
}

