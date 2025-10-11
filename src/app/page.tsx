'use client'

import { GameProvider } from '@/context/GameContext'
import { AuthProvider } from '@/context/AuthContext'
import GameContainer from '@/components/GameContainer'

export default function Home() {
  return (
    <AuthProvider>
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </AuthProvider>
  )
}

