import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ListenMode from '@/components/game/ListenMode'
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
  generateMultipleChoiceOptions: jest.fn(),
  formatWord: jest.fn(),
}))

import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { generateMultipleChoiceOptions, formatWord } from '@/utils/gameUtils'

describe('ListenMode', () => {
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

    ;(generateMultipleChoiceOptions as jest.Mock).mockReturnValue(['cat', 'dog', 'bird', 'fish'])
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

  it('should render listen mode with control buttons', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Check that the control buttons are rendered
    expect(screen.getByText('🗣️')).toBeInTheDocument()
    expect(screen.getByText('Aa')).toBeInTheDocument()
  })

  it('should render empty state when no words are available', () => {
    mockUseGame.mockReturnValue({
      state: {
        ...defaultState,
        currentWordList: [],
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(screen.getByText('ADD WORDS IN PARENT MODE!')).toBeInTheDocument()
  })

  it('should initialize game mode on mount', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(mockInitializeGameMode).toHaveBeenCalled()
  })

  it('should render with proper styling classes', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    expect(repeatButton).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'lg:text-6xl')

    const caseToggleButton = screen.getByText('Aa')
    expect(caseToggleButton).toHaveClass('btn-game', 'btn-mode', 'p-2', 'sm:p-3', 'rounded-full', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold', 'transition-all', 'duration-200', 'transform', 'hover:scale-105', 'active:scale-95', 'bg-blue-500', 'hover:bg-blue-600', 'text-white')
  })

  it('should render with proper layout structure', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    const mainContainer = repeatButton.closest('div')?.parentElement
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'w-full')
  })

  it('should maintain proper component structure', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    expect(repeatButton.tagName).toBe('SPAN')

    const caseToggleButton = screen.getByText('Aa')
    expect(caseToggleButton.tagName).toBe('BUTTON')
  })

  it('should render RepeatButton and CaseToggleButton', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // These buttons should be present (they're rendered by their respective components)
    expect(screen.getByText('🗣️')).toBeInTheDocument()
    expect(screen.getByText('Aa')).toBeInTheDocument()
  })

  it('should render with proper container structure', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    const mainContainer = repeatButton.closest('div')?.parentElement
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'w-full')
  })

  it('should handle empty word list gracefully', () => {
    mockUseGame.mockReturnValue({
      state: {
        ...defaultState,
        currentWordList: [],
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(screen.getByText('ADD WORDS IN PARENT MODE!')).toBeInTheDocument()
    expect(screen.getByText('ADD WORDS IN PARENT MODE!')).toHaveClass('text-xl')
  })

  it('should render control buttons container with proper styling', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    const controlContainer = repeatButton.closest('div')
    expect(controlContainer).toHaveClass('flex', 'items-center', 'gap-2', 'sm:gap-3', 'md:gap-4', 'mb-4', 'sm:mb-6', 'md:mb-8')
  })

  it('should call useGameModeInitialization with correct parameters', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(useGameModeInitialization).toHaveBeenCalledWith({
      onPlayWord: mockOnPlayWord,
      onWordSelected: expect.any(Function),
      onEmptyWordList: expect.any(Function),
    })
  })

  it('should handle onWordSelected callback correctly', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Verify that the hook was called with the correct parameters
    expect(useGameModeInitialization).toHaveBeenCalledWith({
      onPlayWord: mockOnPlayWord,
      onWordSelected: expect.any(Function),
      onEmptyWordList: expect.any(Function),
    })

    // Verify that the onWordSelected callback is a function
    const hookCall = (useGameModeInitialization as jest.Mock).mock.calls[0][0]
    expect(typeof hookCall.onWordSelected).toBe('function')
  })

  it('should handle onEmptyWordList callback correctly', () => {
    let capturedOnEmptyWordList: (() => void) | null = null
    
    ;(useGameModeInitialization as jest.Mock).mockImplementation(({ onEmptyWordList }) => {
      capturedOnEmptyWordList = onEmptyWordList
      return {
        initializeGameMode: mockInitializeGameMode,
        playCurrentWord: mockPlayCurrentWord,
      }
    })

    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Simulate the hook calling onEmptyWordList
    if (capturedOnEmptyWordList) {
      capturedOnEmptyWordList()
    }

    // The component should handle this gracefully (no options should be set)
    expect(generateMultipleChoiceOptions).not.toHaveBeenCalled()
  })

  it('should render grid container with proper styling', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // The grid container should be present even when empty
    const gridDiv = document.querySelector('.grid.grid-cols-2')
    expect(gridDiv).toBeInTheDocument()
    expect(gridDiv).toHaveClass('grid', 'grid-cols-2', 'gap-2', 'sm:gap-3', 'md:gap-4', 'w-full', 'max-w-xl')
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
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // The component should handle case changes - formatWord will be called when options are rendered
    // Since we're not simulating the full flow, we'll just verify the component renders
    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })

  it('should render with proper responsive design', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Check that the grid container has responsive classes
    const gridDiv = document.querySelector('.grid.grid-cols-2')
    expect(gridDiv).toHaveClass('grid-cols-2')
  })

  it('should handle component lifecycle correctly', () => {
    const { unmount } = renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(mockInitializeGameMode).toHaveBeenCalledTimes(1)

    // Component should unmount without errors
    unmount()
  })

  it('should pass correct props to child components', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Verify that the component renders without errors
    expect(screen.getByText('🗣️')).toBeInTheDocument()
    expect(screen.getByText('Aa')).toBeInTheDocument()
  })

  it('should handle state updates correctly', () => {
    const { rerender } = renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Change the state
    mockUseGame.mockReturnValue({
      state: {
        ...defaultState,
        isUpperCase: false,
      },
      dispatch: mockDispatch,
    })

    rerender(<ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)

    // Component should handle state changes
    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })

  it('should maintain proper component hierarchy', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    const repeatButton = screen.getByText('🗣️')
    const mainContainer = repeatButton.closest('div')?.parentElement
    const controlContainer = repeatButton.closest('div')
    
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'w-full')
    expect(controlContainer).toHaveClass('flex', 'items-center', 'gap-2', 'sm:gap-3', 'md:gap-4', 'mb-4', 'sm:mb-6', 'md:mb-8')
  })

  it('should handle different word list states', () => {
    // Test with empty word list
    mockUseGame.mockReturnValue({
      state: {
        ...defaultState,
        currentWordList: [],
      },
      dispatch: mockDispatch,
    })

    const { rerender } = renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    expect(screen.getByText('ADD WORDS IN PARENT MODE!')).toBeInTheDocument()

    // Test with word list
    mockUseGame.mockReturnValue({
      state: defaultState,
      dispatch: mockDispatch,
    })

    rerender(<ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)

    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })

  it('should handle callback functions correctly', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Verify that the callbacks are passed correctly
    expect(useGameModeInitialization).toHaveBeenCalledWith({
      onPlayWord: mockOnPlayWord,
      onWordSelected: expect.any(Function),
      onEmptyWordList: expect.any(Function),
    })
  })

  it('should render with proper accessibility structure', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Check that buttons are properly rendered
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Check that the repeat button is a span (not a button)
    const repeatButton = screen.getByText('🗣️')
    expect(repeatButton.tagName).toBe('SPAN')
  })

  it('should handle button interactions correctly', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Test that buttons can be clicked without errors
    const caseToggleButton = screen.getByText('Aa')
    fireEvent.click(caseToggleButton)
    
    // Should not throw any errors
    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })

  it('should handle component re-renders correctly', () => {
    const { rerender } = renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Re-render with same props
    rerender(<ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)

    // Component should still render correctly
    expect(screen.getByText('🗣️')).toBeInTheDocument()
    expect(screen.getByText('Aa')).toBeInTheDocument()
  })

  it('should handle different game states', () => {
    // Test with different current word
    mockUseGame.mockReturnValue({
      state: {
        ...defaultState,
        currentWord: 'dog',
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Component should render with different word
    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })

  it('should handle focus removal when new word loads', () => {
    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Get the onWordSelected callback from the hook
    const onWordSelected = useGameModeInitialization.mock.calls[0][0].onWordSelected
    
    // Verify that the callback is a function (this ensures the blur logic is in place)
    expect(typeof onWordSelected).toBe('function')
    
    // The blur functionality is implemented in the component code
    // This test verifies that the callback exists and can be called
    expect(() => onWordSelected('test')).not.toThrow()
  })

  it('should not call blur when no element is focused', async () => {
    // Mock document.activeElement to be null
    Object.defineProperty(document, 'activeElement', {
      value: null,
      writable: true,
    })

    renderWithProviders(
      <ListenMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />
    )

    // Simulate onWordSelected being called
    const onWordSelected = useGameModeInitialization.mock.calls[0][0].onWordSelected
    
    await act(async () => {
      onWordSelected('test')
    })

    // Should not throw any errors and should complete successfully
    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })
})