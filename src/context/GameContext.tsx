'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { syncToFirestore, syncFromFirestore, mergeData, enableAutoSync, disableAutoSync, SyncStatus } from '@/utils/firebaseSync'

interface Level {
  name: string
  words: string[]
}

interface GameState {
  levels: Record<string, Level>
  levelOrder: string[]
  currentWord: string | null
  score: number
  mode: string | null
  currentWordList: string[]
  currentLevelName: string
  currentScreen: string
  isParentLoggedIn: boolean
  isUpperCase: boolean
  userId: string | null
  syncStatus: SyncStatus
  lastModified?: number
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
  | { type: 'UPDATE_LEVEL_ORDER'; payload: string[] }
  | { type: 'UPDATE_LEVEL_NAME'; payload: { key: string; name: string } }
  | { type: 'ADD_WORD'; payload: { levelKey: string; word: string } }
  | { type: 'REMOVE_WORD'; payload: { levelKey: string; word: string } }
  | { type: 'SET_PARENT_LOGIN'; payload: boolean }
  | { type: 'TOGGLE_CASE' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'SYNC_LEVELS'; payload: { levels: Record<string, Level>; levelOrder: string[]; lastModified: number } }
  | { type: 'UPDATE_LAST_MODIFIED' }

const GameContext = createContext<GameContextType | undefined>(undefined)

const initialState: GameState = {
  levels: {
    level1: { name: 'Level 1', words: ['the', 'am', 'we', 'look', 'i', 'is', 'to', 'here', 'mum', 'in'] },
    level2: { name: 'Level 2', words: ['dad', 'can', 'on', 'see', 'went', 'me', 'up', 'at', 'and', 'go'] }
  },
  levelOrder: ['level1', 'level2'],
  currentWord: null,
  score: 0,
  mode: null,
  currentWordList: [],
  currentLevelName: '',
  currentScreen: 'welcome',
  isParentLoggedIn: false,
  isUpperCase: true,
  userId: null,
  syncStatus: 'idle',
  lastModified: 0 // Start at 0 so Firebase data is always newer until local changes are made
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
        levels: { ...state.levels, [action.payload.key]: action.payload.level },
        levelOrder: [...state.levelOrder, action.payload.key],
        lastModified: Date.now()
      }
    
    case 'REMOVE_LEVEL':
      const newLevels = { ...state.levels }
      delete newLevels[action.payload]
      return { 
        ...state, 
        levels: newLevels, 
        levelOrder: state.levelOrder.filter(key => key !== action.payload),
        lastModified: Date.now() 
      }
    
    case 'UPDATE_LEVEL_ORDER':
      return {
        ...state,
        levelOrder: action.payload,
        lastModified: Date.now()
      }
    
    case 'UPDATE_LEVEL_NAME':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.payload.key]: {
            ...state.levels[action.payload.key],
            name: action.payload.name
          }
        },
        lastModified: Date.now()
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
        },
        lastModified: Date.now()
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
        },
        lastModified: Date.now()
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
    
    case 'SET_USER_ID':
      return { ...state, userId: action.payload }
    
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload }
    
    case 'SYNC_LEVELS':
      return { 
        ...state, 
        levels: action.payload.levels,
        levelOrder: action.payload.levelOrder,
        lastModified: action.payload.lastModified
      }
    
    case 'UPDATE_LAST_MODIFIED':
      return { ...state, lastModified: Date.now() }
    
    default:
      return state
  }
}

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const isSyncInitialized = useRef(false)
  const isInitialMount = useRef(true)
  const previousLevelsRef = useRef<string>('')
  const syncStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to set sync status (simplified since we handle timing in the sync operation)
  const setSyncStatusWithMinDuration = (status: 'syncing' | 'synced' | 'error' | 'offline' | 'idle') => {
    dispatch({ type: 'SET_SYNC_STATUS', payload: status })
  }

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

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!state.userId) {
      disableAutoSync()
      isSyncInitialized.current = false
      return
    }

    // Skip if already initialized for this user
    if (isSyncInitialized.current) return

    const initSync = async () => {
      try {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' })
        
        // Merge local and remote data with timestamps
        // Use ?? instead of || to allow 0 as a valid timestamp
        const result = await mergeData(state.userId!, state.levels, state.levelOrder, state.lastModified ?? Date.now())
        dispatch({ type: 'SYNC_LEVELS', payload: result })
        
        // Enable real-time sync
        enableAutoSync(
          state.userId!,
          (levels, levelOrder, lastModified) => {
            dispatch({ type: 'SYNC_LEVELS', payload: { levels, levelOrder, lastModified } })
            setSyncStatusWithMinDuration('synced')
          },
          (error) => {
            console.error('Sync error:', error)
            setSyncStatusWithMinDuration('error')
          }
        )
        
        setSyncStatusWithMinDuration('synced')
        isSyncInitialized.current = true
      } catch (error) {
        console.error('Initial sync error:', error)
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' })
      }
    }

    initSync()

    return () => {
      disableAutoSync()
    }
  }, [state.userId, state.levels, state.lastModified])

  // Sync levels to Firestore when they change (debounced)
  // Skip on initial mount and only run when user is authenticated
  useEffect(() => {
    // Skip initial mount (when data is loaded from localStorage)
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousLevelsRef.current = JSON.stringify(state.levels)
      return
    }

    // Only sync if user is authenticated and sync is initialized
    if (!state.userId || !isSyncInitialized.current) return

    // Check if levels actually changed (deep comparison via JSON)
    const currentLevelsString = JSON.stringify(state.levels)
    if (previousLevelsRef.current === currentLevelsString) {
      // No changes to levels, skip sync
      return
    }

    // Update the reference to current levels
    previousLevelsRef.current = currentLevelsString

    // Debounced sync with increased delay for fewer writes
    const syncTimer = setTimeout(async () => {
      if (!state.userId) return // Double check in async context
      
      try {
        console.log('Starting sync...')
        setSyncStatusWithMinDuration('syncing')
        
        // Start the actual sync operation
        const syncPromise = syncToFirestore(state.userId, state.levels, state.levelOrder)
        
        // Wait for both the sync to complete AND the minimum visual duration
        await Promise.all([
          syncPromise,
          new Promise(resolve => setTimeout(resolve, 1000)) // Minimum 1 second visual feedback
        ])
        
        console.log('Sync completed, setting to synced')
        setSyncStatusWithMinDuration('synced')
      } catch (error) {
        console.error('Sync error:', error)
        setSyncStatusWithMinDuration('error')
      }
    }, 500) // Reduced to 500ms for faster feedback

    return () => clearTimeout(syncTimer)
  }, [state.levels, state.userId])

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

