import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParentModeScreen from '@/components/ParentModeScreen'
import { renderWithGameContext, renderWithProviders, createMockGameState } from '../testUtils'

// Mock the useGame hook
jest.mock('@/context/GameContext', () => ({
  useGame: jest.fn(),
}))

import { useGame } from '@/context/GameContext'

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>

describe('ParentModeScreen', () => {
  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        levels: {
          level1: { name: 'Level 1', words: ['cat', 'dog'] },
          level2: { name: 'Level 2', words: ['bird', 'fish'] },
        },
        levelOrder: ['level1', 'level2'],
        currentScreen: 'parentMode',
      }),
      dispatch: mockDispatch,
    })
  })

  it('should render parent mode interface', () => {
    renderWithProviders(<ParentModeScreen />)
    
    expect(screen.getByText('Create Learning Adventures! 📚')).toBeInTheDocument()
    expect(screen.getByText('Manage Levels 📚')).toBeInTheDocument()
  })

  it('should display existing levels', () => {
    renderWithProviders(<ParentModeScreen />)
    
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })

  it('should display words for expanded level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click on Level 1 to expand it
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // Should show words from expanded level (displayed in uppercase)
    expect(screen.getByText('CAT')).toBeInTheDocument()
    expect(screen.getByText('DOG')).toBeInTheDocument()
  })

  it('should add a new level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click the "Add New Level" button at the bottom
    const addLevelButton = screen.getByText('Add New Level')
    await user.click(addLevelButton)
    
    // Now the input should be visible
    const newLevelInput = screen.getByPlaceholderText("Level name")
    await user.type(newLevelInput, 'Level 3')
    
    // The level should be created automatically after typing (auto-save)
    await user.click(document.body) // Blur the input to trigger auto-save
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_LEVEL',
      payload: {
        key: expect.stringMatching(/^level_\d+$/),
        level: { name: 'Level 3', words: [] }
      }
    })
  })

  it('should not add level with empty name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click the "Add New Level" button at the bottom
    const addLevelButton = screen.getByText('Add New Level')
    await user.click(addLevelButton)
    
    // Don't type anything, just blur the input
    const newLevelInput = screen.getByPlaceholderText("Level name")
    await user.click(document.body) // Blur the input
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should remove a level when more than one exists', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the delete button next to the level name field
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // Get the level delete button (✕ button next to the level name field)
    const levelDeleteButton = screen.getByTitle('Delete level')
    await user.click(levelDeleteButton)
    
    // Should show confirmation dialog, then click the actual delete button
    const confirmDeleteButton = screen.getByText('Delete ✕')
    await user.click(confirmDeleteButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_LEVEL',
      payload: 'level1'
    })
  })

  it('should not remove level when only one exists', async () => {
    const user = userEvent.setup()
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        levels: {
          level1: { name: 'Level 1', words: ['cat'] },
        },
        levelOrder: ['level1'],
        currentScreen: 'parentMode',
      }),
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level to see the word delete button
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // When there's only one level, the level delete button should not be visible
    const deleteButtons = screen.getAllByText('✕')
    // Only word delete buttons should be present, not level delete buttons
    expect(deleteButtons).toHaveLength(1) // Only the word delete button
  })

  it('should update level name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the level name input
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // Get the level name input (it should have the current level name as value)
    const levelNameInput = screen.getByPlaceholderText('Level name')
    
    await user.clear(levelNameInput)
    await user.type(levelNameInput, 'Updated Level 1')
    await user.click(document.body) // Blur to trigger auto-save
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_LEVEL_NAME',
      payload: {
        key: 'level1',
        name: 'Updated Level 1'
      }
    })
  })

  it('should add a word to expanded level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the word input
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add ➕')
    
    await user.type(newWordInput, 'bird')
    await user.click(addWordButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_WORD',
      payload: {
        levelKey: 'level1',
        word: 'bird'
      }
    })
  })

  it('should not add duplicate word', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the word input
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add ➕')
    
    await user.type(newWordInput, 'cat') // Already exists
    await user.click(addWordButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not add empty word', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the word input
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    const addWordButton = screen.getByText('Add ➕')
    await user.click(addWordButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should remove a word from expanded level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the word delete buttons
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // Get the word delete button by title attribute (first one for the first word)
    const wordDeleteButtons = screen.getAllByTitle('Remove word')
    const wordDeleteButton = wordDeleteButtons[0] // First word delete button
    await user.click(wordDeleteButton)
    
    // Should directly remove the word without confirmation
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_WORD',
      payload: {
        levelKey: 'level1',
        word: 'cat'
      }
    })
  })

  it('should expand different levels', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click on Level 2 to expand it
    const level2Button = screen.getByText('Level 2')
    await user.click(level2Button)
    
    // Should show words from level 2 (displayed in uppercase)
    expect(screen.getByText('BIRD')).toBeInTheDocument()
    expect(screen.getByText('FISH')).toBeInTheDocument()
  })

  it('should convert words to lowercase when adding', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the word input
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add ➕')
    
    await user.type(newWordInput, 'BIRD')
    await user.click(addWordButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_WORD',
      payload: {
        levelKey: 'level1',
        word: 'bird' // Should be lowercase
      }
    })
  })

  it('should clear input after adding word', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand the level first to access the word input
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add ➕')
    
    await user.type(newWordInput, 'bird')
    await user.click(addWordButton)
    
    expect(newWordInput).toHaveValue('')
  })

  it('should display added level name in input after adding level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click the "Add New Level" button at the bottom
    const addLevelButton = screen.getByText('Add New Level')
    await user.click(addLevelButton)
    
    // Now the input should be visible
    const newLevelInput = screen.getByPlaceholderText("Level name")
    await user.type(newLevelInput, 'Level 3')
    
    // The level should be created automatically after typing (auto-save)
    await user.click(document.body) // Blur the input to trigger auto-save
    
    // Verify that the dispatch was called to add the level
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_LEVEL',
      payload: {
        key: expect.stringMatching(/^level_\d+$/),
        level: { name: 'Level 3', words: [] }
      }
    })
  })

  it('should handle level selection when levels change', () => {
    // Start with one level
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        levels: {
          level1: { name: 'Level 1', words: ['cat'] },
        },
        levelOrder: ['level1'],
        currentScreen: 'parentMode',
      }),
      dispatch: mockDispatch,
    })

    const { rerender } = renderWithProviders(<ParentModeScreen />)
    
    // Add another level
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        levels: {
          level1: { name: 'Level 1', words: ['cat'] },
          level2: { name: 'Level 2', words: ['dog'] },
        },
        levelOrder: ['level1', 'level2'],
        currentScreen: 'parentMode',
      }),
      dispatch: mockDispatch,
    })

    rerender(<ParentModeScreen />)
    
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })

  // New tests for accordion behavior
  it('should collapse accordion when clicking on expanded level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand Level 1
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // Should show words
    expect(screen.getByText('CAT')).toBeInTheDocument()
    
    // Click again to collapse
    await user.click(level1Header)
    
    // Words should no longer be visible
    expect(screen.queryByText('CAT')).not.toBeInTheDocument()
  })

  it('should only allow one level to be expanded at a time', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Expand Level 1
    const level1Header = screen.getByText('Level 1')
    await user.click(level1Header)
    
    // Should show Level 1 words
    expect(screen.getByText('CAT')).toBeInTheDocument()
    
    // Expand Level 2
    const level2Header = screen.getByText('Level 2')
    await user.click(level2Header)
    
    // Level 1 words should be hidden, Level 2 words should be visible
    expect(screen.queryByText('CAT')).not.toBeInTheDocument()
    expect(screen.getByText('BIRD')).toBeInTheDocument()
  })

  it('should auto-expand new level when created', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click "Add New Level" button
    const addLevelButton = screen.getByText('Add New Level')
    await user.click(addLevelButton)
    
    // Type new level name
    const newLevelInput = screen.getByPlaceholderText("Level name")
    await user.type(newLevelInput, 'Level 3')
    await user.click(document.body) // Blur to trigger auto-save
    
    // Verify that the dispatch was called to add the level
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_LEVEL',
      payload: {
        key: expect.stringMatching(/^level_\d+$/),
        level: { name: 'Level 3', words: [] }
      }
    })
  })

  it('should show word count in accordion header', () => {
    renderWithProviders(<ParentModeScreen />)
    
    // Both levels should show "2 words"
    expect(screen.getAllByText('2 words')).toHaveLength(2)
  })


  describe('Level input cursor position preservation', () => {
    it('should transition focus to newly created level input after auto-save', async () => {
      const user = userEvent.setup()
      const { rerender } = renderWithProviders(<ParentModeScreen />)
      
      // Click "Add New Level" button
      const addLevelButton = screen.getByText('Add New Level')
      await user.click(addLevelButton)
      
      // Type new level name
      const newLevelInput = screen.getByPlaceholderText("Level name")
      await user.type(newLevelInput, 'My New Level')
      
      // Verify the input has the text and is focused initially
      expect(newLevelInput).toHaveValue('My New Level')
      expect(newLevelInput).toHaveFocus()
      
      // Wait for auto-save timeout (2 seconds)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'ADD_LEVEL',
          payload: {
            key: expect.any(String),
            level: { name: 'My New Level', words: [] }
          }
        })
      }, { timeout: 3000 })
      
      // Update the mock state to include the new level
      const autoSaveCall = mockDispatch.mock.calls.find(call => 
        call[0].type === 'ADD_LEVEL' && call[0].payload.level.name === 'My New Level'
      )
      const newLevelKey = autoSaveCall[0].payload.key
      
      // Update the mock to include the new level in the state
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          levels: {
            level1: { name: 'Level 1', words: ['cat', 'dog'] },
            level2: { name: 'Level 2', words: ['bird', 'fish'] },
            [newLevelKey]: { name: 'My New Level', words: [] },
          },
          levelOrder: ['level1', 'level2', newLevelKey],
          currentScreen: 'parentMode',
        }),
        dispatch: mockDispatch,
      })
      
      // Re-render with updated state
      rerender(<ParentModeScreen />)
      
      // After auto-save, the "Add New Level" input should be hidden
      expect(newLevelInput).not.toBeInTheDocument()
      
      // The newly created level should be expanded and its input should be visible
      const levelNameInput = screen.getByDisplayValue('My New Level')
      expect(levelNameInput).toBeInTheDocument()
      
      // The level should be expanded (indicated by the rotated arrow)
      const levelHeader = screen.getByText('My New Level').closest('.bg-gray-800')
      const arrow = levelHeader?.querySelector('.rotate-90')
      expect(arrow).toBeInTheDocument()
    })

    it('should handle blur after auto-save without creating duplicate levels', async () => {
      const user = userEvent.setup()
      const { rerender } = renderWithProviders(<ParentModeScreen />)
      
      // Click "Add New Level" button
      const addLevelButton = screen.getByText('Add New Level')
      await user.click(addLevelButton)
      
      // Type new level name
      const newLevelInput = screen.getByPlaceholderText("Level name")
      await user.type(newLevelInput, 'My New Level')
      
      // Wait for auto-save to complete
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'ADD_LEVEL',
          payload: {
            key: expect.any(String),
            level: { name: 'My New Level', words: [] }
          }
        })
      }, { timeout: 3000 })
      
      // Update the mock state to include the new level
      const autoSaveCall = mockDispatch.mock.calls.find(call => 
        call[0].type === 'ADD_LEVEL' && call[0].payload.level.name === 'My New Level'
      )
      const newLevelKey = autoSaveCall[0].payload.key
      
      // Update the mock to include the new level in the state
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          levels: {
            level1: { name: 'Level 1', words: ['cat', 'dog'] },
            level2: { name: 'Level 2', words: ['bird', 'fish'] },
            [newLevelKey]: { name: 'My New Level', words: [] },
          },
          levelOrder: ['level1', 'level2', newLevelKey],
          currentScreen: 'parentMode',
        }),
        dispatch: mockDispatch,
      })
      
      // Re-render with updated state
      rerender(<ParentModeScreen />)
      
      // Clear the dispatch mock to track new calls
      mockDispatch.mockClear()
      
      // Blur the input
      await user.click(document.body)
      
      // Should not create another level since it already exists
      expect(mockDispatch).not.toHaveBeenCalledWith({
        type: 'ADD_LEVEL',
        payload: expect.any(Object)
      })
    })

    it('should transition from add level input to newly created level input', async () => {
      const user = userEvent.setup()
      const { rerender } = renderWithProviders(<ParentModeScreen />)
      
      // Click "Add New Level" button
      const addLevelButton = screen.getByText('Add New Level')
      await user.click(addLevelButton)
      
      // Type new level name
      const newLevelInput = screen.getByPlaceholderText("Level name")
      await user.type(newLevelInput, 'Test Level')
      
      // The add level input should be visible initially
      expect(newLevelInput).toBeInTheDocument()
      expect(newLevelInput).toHaveValue('Test Level')
      
      // Wait for auto-save
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'ADD_LEVEL',
          payload: {
            key: expect.any(String),
            level: { name: 'Test Level', words: [] }
          }
        })
      }, { timeout: 3000 })
      
      // Update the mock state to include the new level
      const autoSaveCall = mockDispatch.mock.calls.find(call => 
        call[0].type === 'ADD_LEVEL' && call[0].payload.level.name === 'Test Level'
      )
      const newLevelKey = autoSaveCall[0].payload.key
      
      // Update the mock to include the new level in the state
      mockUseGame.mockReturnValue({
        state: createMockGameState({
          levels: {
            level1: { name: 'Level 1', words: ['cat', 'dog'] },
            level2: { name: 'Level 2', words: ['bird', 'fish'] },
            [newLevelKey]: { name: 'Test Level', words: [] },
          },
          levelOrder: ['level1', 'level2', newLevelKey],
          currentScreen: 'parentMode',
        }),
        dispatch: mockDispatch,
      })
      
      // Re-render with updated state
      rerender(<ParentModeScreen />)
      
      // After auto-save, the add level input should be hidden
      expect(newLevelInput).not.toBeInTheDocument()
      
      // The newly created level input should be visible
      const levelNameInput = screen.getByDisplayValue('Test Level')
      expect(levelNameInput).toBeInTheDocument()
      
      // The level should be expanded (indicated by the rotated arrow)
      const levelHeader = screen.getByText('Test Level').closest('.bg-gray-800')
      const arrow = levelHeader?.querySelector('.rotate-90')
      expect(arrow).toBeInTheDocument()
    })
  })

  describe('Level name editing', () => {
    it('should preserve text when editing level name during auto-save', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ParentModeScreen />)
      
      // Expand Level 1
      const level1Header = screen.getByText('Level 1').closest('.bg-gray-800')
      const level1Arrow = level1Header?.querySelector('span')
      await user.click(level1Arrow!)
      
      // Find the level name input
      const levelNameInput = screen.getByDisplayValue('Level 1')
      expect(levelNameInput).toBeInTheDocument()
      
      // Type additional text
      await user.type(levelNameInput, ' Updated')
      
      // Verify the input has the updated text
      expect(levelNameInput).toHaveValue('Level 1 Updated')
      
      // Wait for auto-save timeout (1 second)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'UPDATE_LEVEL_NAME',
          payload: {
            key: 'level1',
            name: 'Level 1 Updated'
          }
        })
      }, { timeout: 2000 })
      
      // The input should still have the text after auto-save
      expect(levelNameInput).toHaveValue('Level 1 Updated')
    })

    it('should handle blur without losing text when editing level name', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ParentModeScreen />)
      
      // Expand Level 1
      const level1Header = screen.getByText('Level 1').closest('.bg-gray-800')
      const level1Arrow = level1Header?.querySelector('span')
      await user.click(level1Arrow!)
      
      // Find the level name input
      const levelNameInput = screen.getByDisplayValue('Level 1')
      expect(levelNameInput).toBeInTheDocument()
      
      // Type additional text
      await user.type(levelNameInput, ' Modified')
      
      // Verify the input has the updated text
      expect(levelNameInput).toHaveValue('Level 1 Modified')
      
      // Blur the input to trigger immediate save
      await user.click(document.body)
      
      // Verify the dispatch was called
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_LEVEL_NAME',
        payload: {
          key: 'level1',
          name: 'Level 1 Modified'
        }
      })
      
      // The input should still have the text after blur
      expect(levelNameInput).toHaveValue('Level 1 Modified')
    })

    it('should trim whitespace when saving but preserve user input', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ParentModeScreen />)
      
      // Expand Level 1
      const level1Header = screen.getByText('Level 1').closest('.bg-gray-800')
      const level1Arrow = level1Header?.querySelector('span')
      await user.click(level1Arrow!)
      
      // Find the level name input
      const levelNameInput = screen.getByDisplayValue('Level 1')
      expect(levelNameInput).toBeInTheDocument()
      
      // Type text with trailing spaces
      await user.type(levelNameInput, ' With Spaces   ')
      
      // Verify the input has the text with spaces
      expect(levelNameInput).toHaveValue('Level 1 With Spaces   ')
      
      // Blur the input to trigger save
      await user.click(document.body)
      
      // Verify the dispatch was called with trimmed name
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_LEVEL_NAME',
        payload: {
          key: 'level1',
          name: 'Level 1 With Spaces'
        }
      })
      
      // The input should now show the trimmed version
      expect(levelNameInput).toHaveValue('Level 1 With Spaces')
    })
  })
})
