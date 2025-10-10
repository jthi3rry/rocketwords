'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

interface Level {
  name: string
  words: string[]
}

interface GameState {
  levels: Record<string, Level>
  currentWord: string | null
  score: number
  mode: string | null
  currentWordList: string[]
  currentLevelName: string
  currentScreen: string
  isParentLoggedIn: boolean
  isUpperCase: boolean
}

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

type GameAction =
  | { type: 'LOAD_DATA'; payload: Partial<GameState> }
  | { type: 'SET_SCREEN'; payload: string }
  | { type: 'SET_MODE'; payload: string }
  | { type: 'SET_CURRENT_WORD'; payload: string | null }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'INCREMENT_SCORE' }
  | { type: 'SET_LEVEL_DATA'; payload: { levelName: string; wordList: string[] } }
  | { type: 'ADD_LEVEL'; payload: { key: string; level: Level } }
  | { type: 'REMOVE_LEVEL'; payload: string }
  | { type: 'UPDATE_LEVEL_NAME'; payload: { key: string; name: string } }
  | { type: 'ADD_WORD'; payload: { levelKey: string; word: string } }
  | { type: 'REMOVE_WORD'; payload: { levelKey: string; word: string } }
  | { type: 'SET_PARENT_LOGIN'; payload: boolean }
  | { type: 'TOGGLE_CASE' }
  | { type: 'RESET_GAME' }

const GameContext = createContext<GameContextType | undefined>(undefined)

const initialState: GameState = {
  levels: {
    level1: { name: 'Level 1', words: ['the', 'am', 'we', 'look', 'i', 'is', 'to', 'here', 'mum', 'in'] },
    level2: { name: 'Level 2', words: ['dad', 'can', 'on', 'see', 'went', 'me', 'up', 'at', 'and', 'go'] }
  },
  currentWord: null,
  score: 0,
  mode: null,
  currentWordList: [],
  currentLevelName: '',
  currentScreen: 'welcome',
  isParentLoggedIn: false,
  isUpperCase: true
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_DATA':
      const { currentScreen, ...savedData } = action.payload
      return { ...state, ...savedData }
    
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload }
    
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    
    case 'SET_CURRENT_WORD':
      return { ...state, currentWord: action.payload }
    
    case 'SET_SCORE':
      return { ...state, score: action.payload }
    
    case 'INCREMENT_SCORE':
      return { ...state, score: state.score + 10 }
    
    case 'SET_LEVEL_DATA':
      return { 
        ...state, 
        currentLevelName: action.payload.levelName,
        currentWordList: action.payload.wordList
      }
    
    case 'ADD_LEVEL':
      return {
        ...state,
        levels: { ...state.levels, [action.payload.key]: action.payload.level }
      }
    
    case 'REMOVE_LEVEL':
      const newLevels = { ...state.levels }
      delete newLevels[action.payload]
      return { ...state, levels: newLevels }
    
    case 'UPDATE_LEVEL_NAME':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.payload.key]: {
            ...state.levels[action.payload.key],
            name: action.payload.name
          }
        }
      }
    
    case 'ADD_WORD':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.payload.levelKey]: {
            ...state.levels[action.payload.levelKey],
            words: [...state.levels[action.payload.levelKey].words, action.payload.word]
          }
        }
      }
    
    case 'REMOVE_WORD':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.payload.levelKey]: {
            ...state.levels[action.payload.levelKey],
            words: state.levels[action.payload.levelKey].words.filter(
              word => word !== action.payload.word
            )
          }
        }
      }
    
    case 'SET_PARENT_LOGIN':
      return { ...state, isParentLoggedIn: action.payload }
    
    case 'TOGGLE_CASE':
      return { ...state, isUpperCase: !state.isUpperCase }
    
    case 'RESET_GAME':
      return {
        ...state,
        score: 0,
        currentWord: null,
        mode: null,
        currentWordList: [],
        currentLevelName: ''
      }
    
    default:
      return state
  }
}

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = JSON.parse(localStorage.getItem('rocketWordsData') || '{}')
      if (savedData && Object.keys(savedData).length > 0) {
        dispatch({ type: 'LOAD_DATA', payload: savedData })
      }
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rocketWordsData', JSON.stringify(state))
    }
  }, [state])


  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

