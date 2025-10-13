import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ModeScreen from '@/components/ModeScreen'
import { renderWithProviders } from '../testUtils'

// Mock the GameContext
const mockDispatch = jest.fn()
const mockUseGame = jest.fn()

jest.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}))

describe('ModeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render mode screen when currentScreen is mode', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    expect(screen.getByText('How do you want to play?')).toBeInTheDocument()
    expect(screen.getByText('👂')).toBeInTheDocument()
    expect(screen.getByText('Listen')).toBeInTheDocument()
    expect(screen.getByText('📖')).toBeInTheDocument()
    expect(screen.getByText('Read')).toBeInTheDocument()
    expect(screen.getByText('✍️')).toBeInTheDocument()
    expect(screen.getByText('Write')).toBeInTheDocument()
    expect(screen.getByText('Go Back ↩️')).toBeInTheDocument()
  })

  it('should not render when currentScreen is not mode', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    const { container } = renderWithProviders(<ModeScreen />)
    expect(container.firstChild).toBeNull()
  })

  it('should dispatch SET_MODE and SET_SCREEN when Listen mode is selected', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const listenButton = screen.getByText('Listen')
    fireEvent.click(listenButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_MODE',
      payload: 'listen'
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'game'
    })
  })

  it('should dispatch SET_MODE and SET_SCREEN when Read mode is selected', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const readButton = screen.getByText('Read')
    fireEvent.click(readButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_MODE',
      payload: 'read'
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'game'
    })
  })

  it('should dispatch SET_MODE and SET_SCREEN when Write mode is selected', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const writeButton = screen.getByText('Write')
    fireEvent.click(writeButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_MODE',
      payload: 'write'
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'game'
    })
  })

  it('should dispatch SET_SCREEN to level when Go Back is clicked', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const backButton = screen.getByText('Go Back ↩️')
    fireEvent.click(backButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'level'
    })
  })

  it('should render with proper styling classes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const title = screen.getByText('How do you want to play?')
    expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'font-extrabold', 'text-purple-400', 'mb-4', 'sm:mb-6', 'md:mb-8', 'text-center')

    const listenButton = screen.getByText('Listen')
    expect(listenButton).toHaveClass('btn-game', 'btn-mode', 'px-4', 'sm:px-6', 'py-6', 'sm:py-8', 'rounded-2xl', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold', 'hover:scale-105')

    const readButton = screen.getByText('Read')
    expect(readButton).toHaveClass('btn-game', 'btn-mode', 'px-4', 'sm:px-6', 'py-6', 'sm:py-8', 'rounded-2xl', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold', 'hover:scale-105')

    const writeButton = screen.getByText('Write')
    expect(writeButton).toHaveClass('btn-game', 'btn-mode', 'px-4', 'sm:px-6', 'py-6', 'sm:py-8', 'rounded-2xl', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold', 'hover:scale-105')

    const backButton = screen.getByText('Go Back ↩️')
    expect(backButton).toHaveClass('btn-game', 'absolute', 'bottom-4', 'left-4', 'sm:bottom-6', 'sm:left-6', 'px-4', 'sm:px-6', 'py-2', 'rounded-full', 'text-sm', 'font-bold', 'text-gray-400', 'bg-gray-700', 'hover:bg-gray-600', 'transition-colors')
  })

  it('should render with responsive grid layout', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const listenButton = screen.getByText('Listen')
    const gridContainer = listenButton.closest('div')
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-3', 'sm:gap-4', 'md:gap-6', 'w-full', 'max-w-2xl', 'mb-8', 'sm:mb-12')
  })

  it('should handle multiple mode selections correctly', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    // Click Listen mode
    const listenButton = screen.getByText('Listen')
    fireEvent.click(listenButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_MODE',
      payload: 'listen'
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'game'
    })

    // Reset mock calls
    mockDispatch.mockClear()

    // Click Write mode
    const writeButton = screen.getByText('Write')
    fireEvent.click(writeButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_MODE',
      payload: 'write'
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'game'
    })
  })

  it('should handle rapid clicks on different modes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const listenButton = screen.getByText('Listen')
    const readButton = screen.getByText('Read')

    fireEvent.click(listenButton)
    fireEvent.click(readButton)

    // Should have dispatched 4 times (2 actions per mode selection)
    expect(mockDispatch).toHaveBeenCalledTimes(4)
  })

  it('should maintain proper component structure', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const title = screen.getByText('How do you want to play?')
    expect(title.tagName).toBe('H2')

    const listenButton = screen.getByText('Listen')
    expect(listenButton.tagName).toBe('BUTTON')

    const readButton = screen.getByText('Read')
    expect(readButton.tagName).toBe('BUTTON')

    const writeButton = screen.getByText('Write')
    expect(writeButton.tagName).toBe('BUTTON')

    const backButton = screen.getByText('Go Back ↩️')
    expect(backButton.tagName).toBe('BUTTON')
  })

  it('should render emoji icons correctly', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const listenEmoji = screen.getByText('👂')
    expect(listenEmoji).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'mb-1', 'sm:mb-2')

    const readEmoji = screen.getByText('📖')
    expect(readEmoji).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'mb-1', 'sm:mb-2')

    const writeEmoji = screen.getByText('✍️')
    expect(writeEmoji).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'mb-1', 'sm:mb-2')
  })

  it('should handle back navigation correctly', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    const backButton = screen.getByText('Go Back ↩️')
    fireEvent.click(backButton)

    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'level'
    })
  })

  it('should render all three game modes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'mode' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ModeScreen />)

    // Check that all three modes are present
    expect(screen.getByText('Listen')).toBeInTheDocument()
    expect(screen.getByText('Read')).toBeInTheDocument()
    expect(screen.getByText('Write')).toBeInTheDocument()

    // Check that all three emojis are present
    expect(screen.getByText('👂')).toBeInTheDocument()
    expect(screen.getByText('📖')).toBeInTheDocument()
    expect(screen.getByText('✍️')).toBeInTheDocument()
  })
})
