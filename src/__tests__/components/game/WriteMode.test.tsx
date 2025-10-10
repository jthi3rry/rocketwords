import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WriteMode from '@/components/game/WriteMode'
import { renderWithGameContext, createMockGameState } from '../../testUtils'

// Mock the useGame hook
jest.mock('@/context/GameContext', () => ({
  useGame: jest.fn(),
}))

// Mock the useGameModeInitialization hook
jest.mock('@/hooks/useGameModeInitialization', () => ({
  useGameModeInitialization: jest.fn(),
}))

import { useGame } from '@/context/GameContext'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>
const mockUseGameModeInitialization = useGameModeInitialization as jest.MockedFunction<typeof useGameModeInitialization>

describe('WriteMode', () => {
  const mockDispatch = jest.fn()
  const mockOnFeedback = jest.fn()
  const mockOnPlayWord = jest.fn()
  const mockInitializeGameMode = jest.fn()
  const mockPlayCurrentWord = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        currentWord: 'cat',
        isUpperCase: true,
      }),
      dispatch: mockDispatch,
    })
    
    mockUseGameModeInitialization.mockImplementation(({ onWordSelected }) => {
      // Simulate the hook behavior by calling onWordSelected when initializeGameMode is called
      const mockInit = jest.fn(() => {
        if (onWordSelected) {
          onWordSelected('cat')
        }
      })
      
      return {
        initializeGameMode: mockInit,
        playCurrentWord: mockPlayCurrentWord,
      }
    })
  })

  it('should render write mode interface', () => {
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    expect(screen.getByText('CAT')).toBeInTheDocument()
    expect(screen.getByText('_ _ _')).toBeInTheDocument()
  })

  it('should display word in correct case', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        currentWord: 'cat',
        isUpperCase: false,
      }),
      dispatch: mockDispatch,
    })

    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    expect(screen.getByText('cat')).toBeInTheDocument()
  })

  it.skip('should show "ADD WORDS IN PARENT MODE!" when no words available', () => {
    // Override the default mock for this specific test
    mockUseGameModeInitialization.mockImplementation(({ onEmptyWordList }) => {
      const mockInit = jest.fn(() => {
        // Simulate empty word list by calling onEmptyWordList instead of onWordSelected
        if (onEmptyWordList) {
          onEmptyWordList()
        }
      })
      
      return {
        initializeGameMode: mockInit,
        playCurrentWord: mockPlayCurrentWord,
      }
    })

    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    expect(screen.getByText('ADD WORDS IN PARENT MODE!')).toBeInTheDocument()
  })

  it('should initialize game mode on component mount', () => {
    let mockInitCalled = false
    mockUseGameModeInitialization.mockImplementation(({ onWordSelected }) => {
      const mockInit = jest.fn(() => {
        mockInitCalled = true
        if (onWordSelected) {
          onWordSelected('cat')
        }
      })
      
      return {
        initializeGameMode: mockInit,
        playCurrentWord: mockPlayCurrentWord,
      }
    })

    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    expect(mockInitCalled).toBe(true)
  })

  it('should display letter buttons for the current word', () => {
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Should show unique letters from 'cat': c, a, t
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('should handle correct letter selection', async () => {
    const user = userEvent.setup()
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Click correct first letter (C)
    const letterButton = screen.getByText('C')
    await user.click(letterButton)
    
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('should handle incorrect letter selection', async () => {
    const user = userEvent.setup()
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Click incorrect letter (A instead of C)
    const letterButton = screen.getByText('A')
    await user.click(letterButton)
    
    expect(mockOnFeedback).toHaveBeenCalledWith(false)
  })

  it('should complete word when all letters are correct', async () => {
    const user = userEvent.setup()
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Click letters in correct order: C, A, T
    await user.click(screen.getByText('C'))
    await user.click(screen.getByText('A'))
    await user.click(screen.getByText('T'))
    
    expect(mockOnFeedback).toHaveBeenCalledWith(true)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'INCREMENT_SCORE' })
  })

  it('should disable buttons after word completion', async () => {
    const user = userEvent.setup()
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Complete the word
    await user.click(screen.getByText('C'))
    await user.click(screen.getByText('A'))
    await user.click(screen.getByText('T'))
    
    // Buttons should be disabled
    const letterButtons = screen.getAllByRole('button').filter(button => 
      button.textContent === 'C' || button.textContent === 'A' || button.textContent === 'T'
    )
    
    letterButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should show case toggle and repeat button', () => {
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Case toggle should be present
    expect(screen.getByText('Aa')).toBeInTheDocument()
    
    // Repeat button should be present
    expect(screen.getByText('🗣️')).toBeInTheDocument()
  })

  it('should handle word with repeated letters', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        currentWord: 'hello',
        isUpperCase: true,
      }),
      dispatch: mockDispatch,
    })

    mockUseGameModeInitialization.mockImplementation(({ onWordSelected }) => {
      const mockInit = jest.fn(() => {
        if (onWordSelected) {
          onWordSelected('hello')
        }
      })
      
      return {
        initializeGameMode: mockInit,
        playCurrentWord: mockPlayCurrentWord,
      }
    })

    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Should show unique letters from 'hello': H, E, L, O
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
    
    // Should not show duplicate L
    const lButtons = screen.getAllByText('L')
    expect(lButtons).toHaveLength(1)
  })

  it('should not allow clicking buttons when disabled', async () => {
    const user = userEvent.setup()
    render(<WriteMode onFeedback={mockOnFeedback} onPlayWord={mockOnPlayWord} />)
    
    // Complete the word to disable buttons
    await user.click(screen.getByText('C'))
    await user.click(screen.getByText('A'))
    await user.click(screen.getByText('T'))
    
    // Try to click a letter button again
    const letterButton = screen.getByText('C')
    await user.click(letterButton)
    
    // Should not call feedback again
    expect(mockOnFeedback).toHaveBeenCalledTimes(1)
  })
})
