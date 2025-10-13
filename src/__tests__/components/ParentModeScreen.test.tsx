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

  it('should display words for selected level', () => {
    renderWithProviders(<ParentModeScreen />)
    
    // Should show words from first level by default (displayed in uppercase)
    expect(screen.getByText('CAT')).toBeInTheDocument()
    expect(screen.getByText('DOG')).toBeInTheDocument()
  })

  it('should add a new level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click the "Add" button to show the input (the first button with "Add" text)
    const addButtons = screen.getAllByRole('button', { name: /add/i })
    const addLevelButton = addButtons[0] // First button is for adding levels
    await user.click(addLevelButton)
    
    // Now the input should be visible
    const newLevelInput = screen.getByPlaceholderText("e.g., 'Animals 🐱'")
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
    
    // Click the "Add" button to show the input (the first button with "Add" text)
    const addButtons = screen.getAllByRole('button', { name: /add/i })
    const addLevelButton = addButtons[0] // First button is for adding levels
    await user.click(addLevelButton)
    
    // Don't type anything, just blur the input
    const newLevelInput = screen.getByPlaceholderText("e.g., 'Animals 🐱'")
    await user.click(document.body) // Blur the input
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should remove a level when more than one exists', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Get the level delete button (✕ button next to Level 1)
    const deleteButtons = screen.getAllByText('✕')
    const levelDeleteButton = deleteButtons[0] // First delete button is for level
    await user.click(levelDeleteButton)
    
    // Should show confirmation dialog, then click the actual delete button
    const confirmDeleteButton = screen.getByText('Delete ✕')
    await user.click(confirmDeleteButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_LEVEL',
      payload: 'level1'
    })
  })

  it('should not remove level when only one exists', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        levels: {
          level1: { name: 'Level 1', words: ['cat'] },
        },
        currentScreen: 'parentMode',
      }),
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentModeScreen />)
    
    // When there's only one level, the delete button should not be visible
    const deleteButtons = screen.getAllByText('✕')
    // Only word delete buttons should be present, not level delete buttons
    expect(deleteButtons).toHaveLength(1) // Only the word delete button
  })

  it('should update level name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
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

  it('should add a word to current level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add Words ➕')
    
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
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add Words ➕')
    
    await user.type(newWordInput, 'cat') // Already exists
    await user.click(addWordButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not add empty word', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const addWordButton = screen.getByText('Add Words ➕')
    await user.click(addWordButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should remove a word from current level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Get the word delete button by title attribute (first one for the first word)
    const wordDeleteButtons = screen.getAllByTitle('Remove word')
    const wordDeleteButton = wordDeleteButtons[0] // First word delete button
    await user.click(wordDeleteButton)
    
    // Should show confirmation dialog, then click the actual delete button
    const confirmDeleteButton = screen.getByText('Delete ✕')
    await user.click(confirmDeleteButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_WORD',
      payload: {
        levelKey: 'level1',
        word: 'cat'
      }
    })
  })

  it('should switch between levels', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click on Level 2 button to switch to it
    const level2Button = screen.getByText('Level 2')
    await user.click(level2Button)
    
    // Should show words from level 2 (displayed in uppercase)
    expect(screen.getByText('BIRD')).toBeInTheDocument()
    expect(screen.getByText('FISH')).toBeInTheDocument()
  })

  it('should convert words to lowercase when adding', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add Words ➕')
    
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
    
    const newWordInput = screen.getByPlaceholderText('Words (space or comma separated)... ✍️')
    const addWordButton = screen.getByText('Add Words ➕')
    
    await user.type(newWordInput, 'bird')
    await user.click(addWordButton)
    
    expect(newWordInput).toHaveValue('')
  })

  it('should display added level name in input after adding level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Click the "Add" button to show the input (the first button with "Add" text)
    const addButtons = screen.getAllByRole('button', { name: /add/i })
    const addLevelButton = addButtons[0] // First button is for adding levels
    await user.click(addLevelButton)
    
    // Now the input should be visible
    const newLevelInput = screen.getByPlaceholderText("e.g., 'Animals 🐱'")
    await user.type(newLevelInput, 'Level 3')
    
    // The level should be created automatically after typing (auto-save)
    await user.click(document.body) // Blur the input to trigger auto-save
    
    // Wait for the new level to be created and the input to show the level name
    await waitFor(() => {
      expect(screen.getByDisplayValue('Level 3')).toBeInTheDocument()
    })
    
    // The input should now show the level name instead of being cleared
    expect(screen.getByDisplayValue('Level 3')).toBeInTheDocument()
  })

  it('should handle level selection when levels change', () => {
    // Start with one level
    mockUseGame.mockReturnValue({
      state: createMockGameState({
        levels: {
          level1: { name: 'Level 1', words: ['cat'] },
        },
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
        currentScreen: 'parentMode',
      }),
      dispatch: mockDispatch,
    })

    rerender(<ParentModeScreen />)
    
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })
})
