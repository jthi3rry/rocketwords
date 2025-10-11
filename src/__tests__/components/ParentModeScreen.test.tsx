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
    
    expect(screen.getByText('Manage Words & Levels')).toBeInTheDocument()
    expect(screen.getByText('Current Words:')).toBeInTheDocument()
  })

  it('should display existing levels', () => {
    renderWithProviders(<ParentModeScreen />)
    
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })

  it('should display words for selected level', () => {
    renderWithProviders(<ParentModeScreen />)
    
    // Should show words from first level by default
    expect(screen.getByText('cat')).toBeInTheDocument()
    expect(screen.getByText('dog')).toBeInTheDocument()
  })

  it('should add a new level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const newLevelInput = screen.getByPlaceholderText('New Level Name')
    const addLevelButton = screen.getByText('Add Level')
    
    await user.type(newLevelInput, 'Level 3')
    await user.click(addLevelButton)
    
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
    
    const addLevelButton = screen.getByText('Add Level')
    await user.click(addLevelButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should remove a level when more than one exists', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Get the level remove button (not the word remove buttons) - it's the first one
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    const removeLevelButton = removeButtons[0]
    await user.click(removeLevelButton)
    
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
    
    // Get the level remove button (not the word remove buttons) - it's the first one
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    const removeLevelButton = removeButtons[0]
    expect(removeLevelButton).toBeDisabled()
  })

  it('should update level name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Get the level name input (not the select)
    const levelNameInput = screen.getByPlaceholderText('Edit Level Name')
    const saveNameButton = screen.getByText('Save Name')
    
    await user.clear(levelNameInput)
    await user.type(levelNameInput, 'Updated Level 1')
    await user.click(saveNameButton)
    
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
    
    const newWordInput = screen.getByPlaceholderText('Add new word')
    const addWordButton = screen.getByText('Add Word')
    
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
    
    const newWordInput = screen.getByPlaceholderText('Add new word')
    const addWordButton = screen.getByText('Add Word')
    
    await user.type(newWordInput, 'cat') // Already exists
    await user.click(addWordButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not add empty word', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const addWordButton = screen.getByText('Add Word')
    await user.click(addWordButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should remove a word from current level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    // Get the word remove buttons (not the level remove button)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    // The first remove button is the level remove button, so we want the second one (word remove)
    await user.click(removeButtons[1]) // Remove first word
    
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
    
    // Get the select element specifically
    const levelSelect = screen.getByRole('combobox')
    await user.selectOptions(levelSelect, 'level2')
    
    // Should show words from level 2
    expect(screen.getByText('bird')).toBeInTheDocument()
    expect(screen.getByText('fish')).toBeInTheDocument()
  })

  it('should convert words to lowercase when adding', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const newWordInput = screen.getByPlaceholderText('Add new word')
    const addWordButton = screen.getByText('Add Word')
    
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
    
    const newWordInput = screen.getByPlaceholderText('Add new word')
    const addWordButton = screen.getByText('Add Word')
    
    await user.type(newWordInput, 'bird')
    await user.click(addWordButton)
    
    expect(newWordInput).toHaveValue('')
  })

  it('should clear input after adding level', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ParentModeScreen />)
    
    const newLevelInput = screen.getByPlaceholderText('New Level Name')
    const addLevelButton = screen.getByText('Add Level')
    
    await user.type(newLevelInput, 'Level 3')
    await user.click(addLevelButton)
    
    expect(newLevelInput).toHaveValue('')
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
