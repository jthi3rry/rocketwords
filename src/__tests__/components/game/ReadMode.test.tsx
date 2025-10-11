import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReadMode from '@/components/game/ReadMode'
import { renderWithProviders } from '../../testUtils'

// Mock the GameContext
const mockDispatch = jest.fn()
const mockUseGame = jest.fn()

jest.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}))

// Mock the custom hook
const mockInitializeGameMode = jest.fn()
const mockPlayCurrentWord = jest.fn()

jest.mock('@/hooks/useGameModeInitialization', () => ({
  useGameModeInitialization: jest.fn(),
}))

// Mock the gameUtils
jest.mock('@/utils/gameUtils', () => ({
  formatWord: jest.fn(),
}))

import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { formatWord } from '@/utils/gameUtils'

describe('ReadMode', () => {
  const mockOnFeedback = jest.fn()
  const mockOnPlayWord = jest.fn()

  const defaultState = {
    currentWord: 'cat',
    currentWordList: ['cat', 'dog', 'bird', 'fish'],
    isUpperCase: true,
    score: 0,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
    mockUseGame.mockReturnValue({
      state: defaultState,
      dispatch: mockDispatch,
    })

    ;(formatWord as jest.Mock).mockImplementation((word) => word.toUpperCase())
    
    // Mock the useGameModeInitialization hook
    ;(useGameModeInitialization as jest.Mock).mockReturnValue({
      initializeGameMode: mockInitializeGameMode,
      playCurrentWord: mockPlayCurrentWord,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render read mode with control buttons', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Check that the control buttons are rendered
    expect(screen.getByText('🗣️')).toBeInTheDocument()
    expect(screen.getByText('Aa')).toBeInTheDocument()
  })

  it('should initialize game mode on mount', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(mockInitializeGameMode).toHaveBeenCalled()
  })

  it('should handle I said it button click', async () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const iSaidItButton = screen.getByText('I said it! 🎉')
    fireEvent.click(iSaidItButton)

    expect(mockOnFeedback).toHaveBeenCalledWith(true)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'INCREMENT_SCORE' })

    // Fast-forward time by 1500ms
    jest.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(mockInitializeGameMode).toHaveBeenCalledTimes(2) // Once on mount, once after delay
    })
  })

  it('should handle Next Word button click', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const nextWordButton = screen.getByText('Next Word ➡️')
    fireEvent.click(nextWordButton)

    expect(mockInitializeGameMode).toHaveBeenCalledTimes(2) // Once on mount, once on click
  })

  it('should render with proper styling classes', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    expect(repeatButton).toHaveClass('text-6xl')

    const caseToggleButton = screen.getByText('Aa')
    expect(caseToggleButton).toHaveClass('btn-game', 'btn-mode', 'p-3', 'rounded-full', 'text-2xl', 'font-bold')

    const iSaidItButton = screen.getByText('I said it! 🎉')
    expect(iSaidItButton).toHaveClass('btn-game', 'btn-answer', 'px-8', 'py-4', 'rounded-full', 'text-2xl', 'font-bold', 'text-white', 'bg-green-500', 'hover:bg-green-600')

    const nextWordButton = screen.getByText('Next Word ➡️')
    expect(nextWordButton).toHaveClass('btn-game', 'btn-mode', 'px-8', 'py-4', 'rounded-full', 'text-2xl', 'font-bold', 'text-white', 'bg-purple-500', 'hover:bg-purple-600')
  })

  it('should render with proper layout structure', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    const mainContainer = repeatButton.closest('div')?.parentElement
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'w-full')
  })

  it('should render word display area with proper styling', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const wordDisplay = screen.getByText('CAT')
    const wordContainer = wordDisplay.closest('div')
    expect(wordContainer).toHaveClass('p-8', 'bg-gray-800', 'rounded-3xl', 'w-full', 'max-w-2xl', 'text-center', 'mb-8', 'shadow-md')
    expect(wordDisplay).toHaveClass('text-5xl', 'md:text-7xl', 'font-extrabold', 'text-blue-400')
  })

  it('should render button container with responsive layout', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const iSaidItButton = screen.getByText('I said it! 🎉')
    const buttonContainer = iSaidItButton.closest('div')
    expect(buttonContainer).toHaveClass('flex', 'flex-col', 'md:flex-row', 'gap-4')
  })

  it('should maintain proper component structure', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    expect(repeatButton.tagName).toBe('SPAN')

    const caseToggleButton = screen.getByText('Aa')
    expect(caseToggleButton.tagName).toBe('BUTTON')

    const iSaidItButton = screen.getByText('I said it! 🎉')
    expect(iSaidItButton.tagName).toBe('BUTTON')

    const nextWordButton = screen.getByText('Next Word ➡️')
    expect(nextWordButton.tagName).toBe('BUTTON')
  })

  it('should render RepeatButton and CaseToggleButton', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // These buttons should be present (they're rendered by their respective components)
    expect(screen.getByText('🗣️')).toBeInTheDocument()
    expect(screen.getByText('Aa')).toBeInTheDocument()
  })

  it('should render control buttons container with proper styling', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    const controlContainer = repeatButton.closest('div')
    expect(controlContainer).toHaveClass('flex', 'items-center', 'gap-4', 'mb-8')
  })

  it('should handle case toggle updates', () => {
    ;(formatWord as jest.Mock).mockImplementation((word) => word.toLowerCase())
    
    mockUseGame.mockReturnValue({
      state: {
        ...defaultState,
        isUpperCase: false,
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(formatWord).toHaveBeenCalledWith('cat', false)
  })

  it('should render with proper responsive design', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const wordDisplay = screen.getByText('CAT')
    expect(wordDisplay).toHaveClass('text-5xl', 'md:text-7xl')

    const iSaidItButton = screen.getByText('I said it! 🎉')
    const buttonContainer = iSaidItButton.closest('div')
    expect(buttonContainer).toHaveClass('flex', 'flex-col', 'md:flex-row')
  })

  it('should handle timer-based next word after I said it', async () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const iSaidItButton = screen.getByText('I said it! 🎉')
    fireEvent.click(iSaidItButton)

    // Should not call initializeGameMode immediately for the timer
    expect(mockInitializeGameMode).toHaveBeenCalledTimes(1) // Only on mount

    // Fast-forward time by 1500ms
    jest.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(mockInitializeGameMode).toHaveBeenCalledTimes(2) // Now after timer
    })
  })

  it('should render word display with current word', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // The component should display the current word
    expect(screen.getByText('CAT')).toBeInTheDocument()
  })

  it('should render both action buttons', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(screen.getByText('I said it! 🎉')).toBeInTheDocument()
    expect(screen.getByText('Next Word ➡️')).toBeInTheDocument()
  })

  it('should handle button clicks without errors', () => {
    renderWithProviders(
      <ReadMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const iSaidItButton = screen.getByText('I said it! 🎉')
    const nextWordButton = screen.getByText('Next Word ➡️')

    // Both buttons should be clickable without errors
    fireEvent.click(iSaidItButton)
    fireEvent.click(nextWordButton)

    expect(mockOnFeedback).toHaveBeenCalledWith(true)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'INCREMENT_SCORE' })
  })
})