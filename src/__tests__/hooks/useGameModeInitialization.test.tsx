import { renderHook, act } from '@testing-library/react'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'
import { renderWithGameContext, createMockGameState } from '../testUtils'

// Mock the useGame hook
jest.mock('@/context/GameContext', () => ({
  useGame: jest.fn(),
}))

import { useGame } from '@/context/GameContext'

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>

describe('useGameModeInitialization', () => {
  const mockDispatch = jest.fn()
  const mockOnPlayWord = jest.fn()
  const mockOnWordSelected = jest.fn()
  const mockOnEmptyWordList = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        currentWord: null,
        currentWordList: ['cat', 'dog', 'bird', 'fish'],
      }),
      dispatch: mockDispatch,
    })
  })

  it('should initialize with correct functions', () => {
    const { result } = renderHook(() =>
      useGameModeInitialization({
        onPlayWord: mockOnPlayWord,
        onWordSelected: mockOnWordSelected,
        onEmptyWordList: mockOnEmptyWordList,
      })
    )

    expect(result.current.initializeGameMode).toBeDefined()
    expect(result.current.playCurrentWord).toBeDefined()
    expect(typeof result.current.initializeGameMode).toBe('function')
    expect(typeof result.current.playCurrentWord).toBe('function')
  })

  describe('initializeGameMode', () => {
    it('should select a word from current word list', () => {
      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      act(() => {
        result.current.initializeGameMode()
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CURRENT_WORD',
        payload: expect.any(String),
      })
      expect(mockOnWordSelected).toHaveBeenCalledWith(expect.any(String))
    })

    it('should call onEmptyWordList when word list is empty', () => {
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWordList: [],
        }),
        dispatch: mockDispatch,
      })

      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      act(() => {
        result.current.initializeGameMode()
      })

      expect(mockOnEmptyWordList).toHaveBeenCalled()
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockOnWordSelected).not.toHaveBeenCalled()
    })

    it('should not select the same word twice in a row', () => {
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWord: 'cat',
          currentWordList: ['cat', 'dog'],
        }),
        dispatch: mockDispatch,
      })

      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      act(() => {
        result.current.initializeGameMode()
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CURRENT_WORD',
        payload: 'dog', // Should select the other word
      })
    })

    it('should allow same word when only one word in list', () => {
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWord: 'cat',
          currentWordList: ['cat'],
        }),
        dispatch: mockDispatch,
      })

      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      act(() => {
        result.current.initializeGameMode()
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CURRENT_WORD',
        payload: 'cat', // Should allow same word when only one available
      })
    })

    it('should return the selected word', () => {
      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      let selectedWord: string | null = null
      act(() => {
        selectedWord = result.current.initializeGameMode()
      })

      expect(selectedWord).toBeTruthy()
      expect(['cat', 'dog', 'bird', 'fish']).toContain(selectedWord)
    })

    it('should return null when word list is empty', () => {
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWordList: [],
        }),
        dispatch: mockDispatch,
      })

      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      let selectedWord: string | null = null
      act(() => {
        selectedWord = result.current.initializeGameMode()
      })

      expect(selectedWord).toBeNull()
    })
  })

  describe('playCurrentWord', () => {
    it('should call onPlayWord with current word', () => {
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWord: 'cat',
        }),
        dispatch: mockDispatch,
      })

      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      act(() => {
        result.current.playCurrentWord()
      })

      expect(mockOnPlayWord).toHaveBeenCalledWith('cat')
    })

    it('should not call onPlayWord when no current word', () => {
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWord: null,
        }),
        dispatch: mockDispatch,
      })

      const { result } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      act(() => {
        result.current.playCurrentWord()
      })

      expect(mockOnPlayWord).not.toHaveBeenCalled()
    })
  })

  describe('callback dependencies', () => {
    it('should update when state changes', () => {
      const { result, rerender } = renderHook(() =>
        useGameModeInitialization({
          onPlayWord: mockOnPlayWord,
          onWordSelected: mockOnWordSelected,
          onEmptyWordList: mockOnEmptyWordList,
        })
      )

      // Change the state
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          currentWord: 'dog',
          currentWordList: ['dog', 'cat'],
        }),
        dispatch: mockDispatch,
      })

      rerender()

      act(() => {
        result.current.playCurrentWord()
      })

      expect(mockOnPlayWord).toHaveBeenCalledWith('dog')
    })
  })
})
