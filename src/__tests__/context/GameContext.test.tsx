import { renderHook, act } from '@testing-library/react'
import { GameProvider, useGame } from '@/context/GameContext'
import { createMockGameState, mockLocalStorage } from '../testUtils'

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('GameProvider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider,
      })

      expect(result.current.state).toEqual({
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
        lastModified: 0
      })
      expect(result.current.dispatch).toBeDefined()
    })

    it('should load data from localStorage on mount', () => {
      const savedData = {
        levels: {
          custom: { name: 'Custom Level', words: ['cat', 'dog'] }
        },
        score: 50,
        isParentLoggedIn: true,
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData))

      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider,
      })

      expect(result.current.state.levels).toEqual(savedData.levels)
      expect(result.current.state.score).toBe(50)
      expect(result.current.state.isParentLoggedIn).toBe(true)
    })

  it('should handle invalid localStorage data gracefully', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    mockLocalStorage.getItem.mockReturnValue('invalid json')

    expect(() => {
      renderHook(() => useGame(), {
        wrapper: GameProvider,
      })
    }).toThrow()
    
    consoleSpy.mockRestore()
  })
  })

  describe('Game Actions', () => {
    let result: any

    beforeEach(() => {
      const hookResult = renderHook(() => useGame(), {
        wrapper: GameProvider,
      })
      result = hookResult.result
    })

    describe('LOAD_DATA', () => {
      it('should load data without currentScreen', () => {
        const data = { score: 100, isParentLoggedIn: true }
        
        act(() => {
          result.current.dispatch({ type: 'LOAD_DATA', payload: data })
        })

        expect(result.current.state.score).toBe(100)
        expect(result.current.state.isParentLoggedIn).toBe(true)
        expect(result.current.state.currentScreen).toBe('welcome') // Should not change
      })
    })

    describe('SET_SCREEN', () => {
      it('should set current screen', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_SCREEN', payload: 'level' })
        })

        expect(result.current.state.currentScreen).toBe('level')
      })
    })

    describe('SET_MODE', () => {
      it('should set game mode', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_MODE', payload: 'listen' })
        })

        expect(result.current.state.mode).toBe('listen')
      })
    })

    describe('SET_CURRENT_WORD', () => {
      it('should set current word', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_CURRENT_WORD', payload: 'cat' })
        })

        expect(result.current.state.currentWord).toBe('cat')
      })

      it('should set current word to null', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_CURRENT_WORD', payload: null })
        })

        expect(result.current.state.currentWord).toBeNull()
      })
    })

    describe('SET_SCORE', () => {
      it('should set score', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_SCORE', payload: 150 })
        })

        expect(result.current.state.score).toBe(150)
      })
    })

    describe('INCREMENT_SCORE', () => {
      it('should increment score by 10', () => {
        act(() => {
          result.current.dispatch({ type: 'INCREMENT_SCORE' })
        })

        expect(result.current.state.score).toBe(10)
      })

      it('should increment score from existing value', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_SCORE', payload: 50 })
        })

        act(() => {
          result.current.dispatch({ type: 'INCREMENT_SCORE' })
        })

        expect(result.current.state.score).toBe(60)
      })
    })

    describe('SET_LEVEL_DATA', () => {
      it('should set level data', () => {
        const levelData = { levelName: 'Level 3', wordList: ['cat', 'dog', 'bird'] }
        
        act(() => {
          result.current.dispatch({ type: 'SET_LEVEL_DATA', payload: levelData })
        })

        expect(result.current.state.currentLevelName).toBe('Level 3')
        expect(result.current.state.currentWordList).toEqual(['cat', 'dog', 'bird'])
      })
    })

    describe('ADD_LEVEL', () => {
      it('should add a new level', () => {
        const newLevel = { key: 'level3', level: { name: 'Level 3', words: ['cat', 'dog'] } }
        
        act(() => {
          result.current.dispatch({ type: 'ADD_LEVEL', payload: newLevel })
        })

        expect(result.current.state.levels.level3).toEqual({ name: 'Level 3', words: ['cat', 'dog'] })
        expect(result.current.state.levelOrder).toContain('level3')
      })
    })

    describe('REMOVE_LEVEL', () => {
      it('should remove a level', () => {
        act(() => {
          result.current.dispatch({ type: 'REMOVE_LEVEL', payload: 'level1' })
        })

        expect(result.current.state.levels.level1).toBeUndefined()
        expect(result.current.state.levels.level2).toBeDefined()
      })
    })

    describe('UPDATE_LEVEL_NAME', () => {
      it('should update level name', () => {
        act(() => {
          result.current.dispatch({ type: 'UPDATE_LEVEL_NAME', payload: { key: 'level1', name: 'Updated Level 1' } })
        })

        expect(result.current.state.levels.level1.name).toBe('Updated Level 1')
      })
    })

    describe('ADD_WORD', () => {
      it('should add word to level', () => {
        act(() => {
          result.current.dispatch({ type: 'ADD_WORD', payload: { levelKey: 'level1', word: 'cat' } })
        })

        expect(result.current.state.levels.level1.words).toContain('cat')
      })
    })

    describe('REMOVE_WORD', () => {
      it('should remove word from level', () => {
        act(() => {
          result.current.dispatch({ type: 'REMOVE_WORD', payload: { levelKey: 'level1', word: 'the' } })
        })

        expect(result.current.state.levels.level1.words).not.toContain('the')
      })
    })

    describe('SET_PARENT_LOGIN', () => {
      it('should set parent login status', () => {
        act(() => {
          result.current.dispatch({ type: 'SET_PARENT_LOGIN', payload: true })
        })

        expect(result.current.state.isParentLoggedIn).toBe(true)
      })
    })

    describe('TOGGLE_CASE', () => {
      it('should toggle case setting', () => {
        expect(result.current.state.isUpperCase).toBe(true)
        
        act(() => {
          result.current.dispatch({ type: 'TOGGLE_CASE' })
        })

        expect(result.current.state.isUpperCase).toBe(false)
        
        act(() => {
          result.current.dispatch({ type: 'TOGGLE_CASE' })
        })

        expect(result.current.state.isUpperCase).toBe(true)
      })
    })

    describe('RESET_GAME', () => {
      it('should reset game state', () => {
        // Set some state first
        act(() => {
          result.current.dispatch({ type: 'SET_SCORE', payload: 100 })
          result.current.dispatch({ type: 'SET_CURRENT_WORD', payload: 'cat' })
          result.current.dispatch({ type: 'SET_MODE', payload: 'listen' })
        })

        act(() => {
          result.current.dispatch({ type: 'RESET_GAME' })
        })

        expect(result.current.state.score).toBe(0)
        expect(result.current.state.currentWord).toBeNull()
        expect(result.current.state.mode).toBeNull()
        expect(result.current.state.currentScreen).toBe('welcome')
        expect(result.current.state.isParentLoggedIn).toBe(false)
      })
    })
  })

  describe('localStorage persistence', () => {
    it('should save state to localStorage on changes', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider,
      })

      act(() => {
        result.current.dispatch({ type: 'SET_SCORE', payload: 50 })
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'rocketWordsData',
        expect.stringContaining('"score":50')
      )
    })

    it('should not save currentScreen to localStorage', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider,
      })

      act(() => {
        result.current.dispatch({ type: 'SET_SCREEN', payload: 'level' })
      })

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.currentScreen).toBe('welcome')
    })
  })

  describe('useGame hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useGame())
      }).toThrow('useGame must be used within a GameProvider')
      
      consoleSpy.mockRestore()
    })
  })
})
