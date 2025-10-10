import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { GameProvider } from '@/context/GameContext'
import { GameState } from '@/context/GameContext'

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
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
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
}
