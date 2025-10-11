import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { GameState } from '@/context/GameContext'
import { AuthProvider } from '@/context/AuthContext'
import { 
  createMockUser as createFirebaseMockUser, 
  createMockFirestoreData as createFirebaseMockData, 
  mockAuthStateManager,
  mockFirestoreManager,
  clearAllFirebaseMocks 
} from './mocks/firebaseMocks'

// This file contains test utilities and should not be run as a test

// Mock data generators
export const createMockLevel = (name: string, words: string[] = []) => ({
  name,
  words,
})

export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  levels: {
    level1: createMockLevel('Level 1', ['cat', 'dog', 'bird']),
    level2: createMockLevel('Level 2', ['fish', 'frog', 'duck']),
  },
  currentWord: null,
  score: 0,
  mode: null,
  currentWordList: [],
  currentLevelName: '',
  currentScreen: 'welcome',
  isParentLoggedIn: false,
  isUpperCase: true,
  ...overrides,
})

// Custom render function that includes GameContext
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<GameState>
}

export const renderWithGameContext = (
  ui: React.ReactElement,
  { initialState = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  // Since GameProvider is mocked globally, just render without wrapper
  return render(ui, { ...renderOptions })
}

// Custom render function that includes both GameContext and AuthContext
export const renderWithProviders = (
  ui: React.ReactElement,
  { initialState = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Test utilities for common assertions
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectNotToBeInDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument()
}

// Mock functions for testing
export const createMockCallback = () => jest.fn()

// Helper to wait for async operations
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock localStorage helpers
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks()
  mockLocalStorage.getItem.mockClear()
  mockLocalStorage.setItem.mockClear()
  mockLocalStorage.removeItem.mockClear()
  mockLocalStorage.clear.mockClear()
  clearAllFirebaseMocks()
}

// Firebase testing helpers
export const createMockUser = (overrides = {}) => createFirebaseMockUser(overrides)
export const createMockFirestoreData = (overrides = {}) => createFirebaseMockData(overrides)

// Auth state helpers
export const setMockAuthUser = (user: any) => {
  mockAuthStateManager.setUser(user)
}

export const clearMockAuthUser = () => {
  mockAuthStateManager.setUser(null)
}

// Firestore helpers
export const setMockFirestoreData = (path: string, data: any) => {
  mockFirestoreManager.setDocument(path, data)
}

export const clearMockFirestoreData = (path: string) => {
  mockFirestoreManager.clearDocument(path)
}

// Wait for auth state change
export const waitForAuthStateChange = () => new Promise(resolve => setTimeout(resolve, 0))
