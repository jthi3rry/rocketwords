import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import WelcomeScreen from '@/components/WelcomeScreen'
import { renderWithProviders } from '../testUtils'

// Mock the GameContext
const mockDispatch = jest.fn()
const mockUseGame = jest.fn()

jest.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}))

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render welcome screen when currentScreen is welcome', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    expect(screen.getByText('🚀 Rocket Words! ⭐')).toBeInTheDocument()
    expect(screen.getByText("Let's learn some new words! Are you ready for an adventure?")).toBeInTheDocument()
    expect(screen.getByText('Start 🚀')).toBeInTheDocument()
    expect(screen.getByText('⚙️')).toBeInTheDocument()
  })

  it('should not render when currentScreen is not welcome', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'level' },
      dispatch: mockDispatch,
    })

    const { container } = renderWithProviders(<WelcomeScreen />)
    expect(container.firstChild).toBeNull()
  })

  it('should dispatch SET_SCREEN to level when Start button is clicked', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    const startButton = screen.getByText('Start 🚀')
    fireEvent.click(startButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'level',
    })
  })

  it('should dispatch SET_SCREEN to parentLogin when parent mode button is clicked', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    const parentModeButton = screen.getByText('⚙️')
    fireEvent.click(parentModeButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'parentLogin',
    })
  })

  it('should have proper styling classes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    // Check the main container (outer div)
    const mainContainer = screen.getByText('🚀 Rocket Words! ⭐').closest('div')?.parentElement
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'p-4', 'sm:p-6', 'md:p-8', 'h-full', 'w-full', 'transition-opacity', 'duration-500')

    const startButton = screen.getByText('Start 🚀')
    expect(startButton).toHaveClass('btn-game', 'px-6', 'sm:px-8', 'py-3', 'sm:py-4', 'rounded-full', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold', 'text-white', 'bg-blue-500', 'hover:bg-blue-600', 'transition-colors', 'duration-300')

    const parentModeButton = screen.getByText('⚙️').closest('button')
    expect(parentModeButton).toHaveClass('absolute', 'bottom-3', 'left-3', 'sm:bottom-4', 'sm:left-4', 'px-3', 'py-2', 'sm:px-4', 'sm:py-3', 'rounded-full', 'text-gray-400', 'bg-gray-700', 'hover:bg-gray-600', 'transition-colors', 'flex', 'items-center', 'gap-2')
  })

  it('should render with responsive design classes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    const title = screen.getByText('🚀 Rocket Words! ⭐')
    expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'lg:text-6xl')

    const description = screen.getByText("Let's learn some new words! Are you ready for an adventure?")
    expect(description).toHaveClass('text-base', 'sm:text-lg', 'md:text-xl')

    // Check that the Start button has the expected classes
    const startButton = screen.getByText('Start 🚀')
    expect(startButton).toHaveClass('btn-game', 'px-6', 'sm:px-8', 'py-3', 'sm:py-4', 'rounded-full', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold')
  })

  it('should handle multiple rapid clicks on Start button', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    const startButton = screen.getByText('Start 🚀')
    
    // Click multiple times rapidly
    fireEvent.click(startButton)
    fireEvent.click(startButton)
    fireEvent.click(startButton)

    // Should dispatch for each click
    expect(mockDispatch).toHaveBeenCalledTimes(3)
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_SCREEN',
      payload: 'level',
    })
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SET_SCREEN',
      payload: 'level',
    })
    expect(mockDispatch).toHaveBeenNthCalledWith(3, {
      type: 'SET_SCREEN',
      payload: 'level',
    })
  })

  it('should handle multiple rapid clicks on parent mode button', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    const parentModeButton = screen.getByText('⚙️')
    
    // Click multiple times rapidly
    fireEvent.click(parentModeButton)
    fireEvent.click(parentModeButton)

    // Should dispatch for each click
    expect(mockDispatch).toHaveBeenCalledTimes(2)
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_SCREEN',
      payload: 'parentLogin',
    })
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SET_SCREEN',
      payload: 'parentLogin',
    })
  })

  it('should render with proper accessibility attributes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    const startButton = screen.getByText('Start 🚀')
    expect(startButton.tagName).toBe('BUTTON')

    const parentModeButton = screen.getByText('⚙️').closest('button')
    expect(parentModeButton?.tagName).toBe('BUTTON')
  })

  it('should maintain proper component structure', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<WelcomeScreen />)

    // Check that the main structure is correct
    const title = screen.getByText('🚀 Rocket Words! ⭐')
    expect(title.tagName).toBe('H1')

    const description = screen.getByText("Let's learn some new words! Are you ready for an adventure?")
    expect(description.tagName).toBe('P')

    const startButton = screen.getByText('Start 🚀')
    expect(startButton).toBeInTheDocument()

    const parentModeButton = screen.getByText('⚙️').closest('button')
    expect(parentModeButton).toBeInTheDocument()
  })
})
