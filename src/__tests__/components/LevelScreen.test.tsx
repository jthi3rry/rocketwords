import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LevelScreen from '@/components/LevelScreen'
import { renderWithProviders } from '../testUtils'

// Mock the GameContext
const mockDispatch = jest.fn()
const mockUseGame = jest.fn()

jest.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}))

// Mock the gameUtils
jest.mock('@/utils/gameUtils', () => ({
  getSortedLevelKeys: jest.fn(),
}))

import { getSortedLevelKeys } from '@/utils/gameUtils'

describe('LevelScreen', () => {
  const mockLevels = {
    level1: { name: 'Level 1', words: ['cat', 'dog', 'bird'] },
    level2: { name: 'Level 2', words: ['fish', 'frog', 'duck'] },
    level3: { name: 'Level 3', words: ['lion', 'tiger', 'bear'] },
  }
  const mockLevelOrder = ['level1', 'level2', 'level3']

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSortedLevelKeys as jest.Mock).mockReturnValue(mockLevelOrder)
  })

  it('should render level screen when currentScreen is level', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    expect(screen.getByText('Choose your adventure!')).toBeInTheDocument()
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    expect(screen.getByText('All Levels')).toBeInTheDocument()
    expect(screen.getByText('Go Back ↩️')).toBeInTheDocument()
  })

  it('should not render when currentScreen is not level', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'welcome',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    const { container } = renderWithProviders(<LevelScreen />)
    expect(container.firstChild).toBeNull()
  })

  it('should call getSortedLevelKeys with the levels from state', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    expect(getSortedLevelKeys).toHaveBeenCalledWith(mockLevels, mockLevelOrder)
  })

  it('should dispatch SET_LEVEL_DATA and navigate to mode when a level is selected', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const level1Button = screen.getByText('Level 1')
    fireEvent.click(level1Button)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LEVEL_DATA',
      payload: {
        levelName: 'Level 1',
        wordList: ['cat', 'dog', 'bird']
      }
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENT_WORD',
      payload: null
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'mode'
    })
  })

  it('should dispatch SET_LEVEL_DATA with all words when All Levels is selected', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const allLevelsButton = screen.getByText('All Levels')
    fireEvent.click(allLevelsButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LEVEL_DATA',
      payload: {
        levelName: 'All Levels',
        wordList: ['cat', 'dog', 'bird', 'fish', 'frog', 'duck', 'lion', 'tiger', 'bear']
      }
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENT_WORD',
      payload: null
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'mode'
    })
  })

  it('should dispatch SET_SCREEN to welcome when Go Back is clicked', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const backButton = screen.getByText('Go Back ↩️')
    fireEvent.click(backButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'welcome'
    })
  })

  it('should handle multiple level selections correctly', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    // Click Level 2
    const level2Button = screen.getByText('Level 2')
    fireEvent.click(level2Button)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LEVEL_DATA',
      payload: {
        levelName: 'Level 2',
        wordList: ['fish', 'frog', 'duck']
      }
    })

    // Click Level 3
    const level3Button = screen.getByText('Level 3')
    fireEvent.click(level3Button)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LEVEL_DATA',
      payload: {
        levelName: 'Level 3',
        wordList: ['lion', 'tiger', 'bear']
      }
    })
  })

  it('should render with proper styling classes', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const title = screen.getByText('Choose your adventure!')
    expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl', 'font-extrabold', 'text-purple-400', 'mb-4', 'sm:mb-6', 'md:mb-8', 'text-center')

    const level1Button = screen.getByText('Level 1')
    expect(level1Button).toHaveClass('btn-game', 'btn-level', 'px-4', 'sm:px-6', 'py-3', 'sm:py-4', 'rounded-2xl', 'text-lg', 'sm:text-xl', 'font-bold', 'hover:scale-105')

    const allLevelsButton = screen.getByText('All Levels')
    expect(allLevelsButton).toHaveClass('btn-game', 'px-4', 'sm:px-6', 'py-3', 'sm:py-4', 'rounded-2xl', 'text-lg', 'sm:text-xl', 'font-bold', 'hover:scale-105', 'bg-blue-500', 'hover:bg-blue-600')

    const backButton = screen.getByText('Go Back ↩️')
    expect(backButton).toHaveClass('btn-game', 'absolute', 'bottom-4', 'left-4', 'sm:bottom-6', 'sm:left-6', 'px-4', 'sm:px-6', 'py-2', 'rounded-full', 'text-sm', 'font-bold', 'text-gray-400', 'bg-gray-700', 'hover:bg-gray-600', 'transition-colors')
  })

  it('should render with responsive grid layout', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const level1Button = screen.getByText('Level 1')
    const gridContainer = level1Button.closest('div')
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-3', 'sm:gap-4', 'md:gap-6', 'w-full', 'max-w-xl', 'mb-8', 'sm:mb-12')
  })

  it('should handle empty levels gracefully', () => {
    ;(getSortedLevelKeys as jest.Mock).mockReturnValue([])
    
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: {}
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    expect(screen.getByText('Choose your adventure!')).toBeInTheDocument()
    expect(screen.getByText('All Levels')).toBeInTheDocument()
    expect(screen.getByText('Go Back ↩️')).toBeInTheDocument()
    
    // Should not render any level buttons
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument()
  })

  it('should handle All Levels selection with empty levels', () => {
    ;(getSortedLevelKeys as jest.Mock).mockReturnValue([])
    
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: {}
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const allLevelsButton = screen.getByText('All Levels')
    fireEvent.click(allLevelsButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LEVEL_DATA',
      payload: {
        levelName: 'All Levels',
        wordList: []
      }
    })
  })

  it('should maintain proper component structure', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const title = screen.getByText('Choose your adventure!')
    expect(title.tagName).toBe('H2')

    const level1Button = screen.getByText('Level 1')
    expect(level1Button.tagName).toBe('BUTTON')

    const allLevelsButton = screen.getByText('All Levels')
    expect(allLevelsButton.tagName).toBe('BUTTON')

    const backButton = screen.getByText('Go Back ↩️')
    expect(backButton.tagName).toBe('BUTTON')
  })

  it('should handle rapid clicks on different levels', () => {
    mockUseGame.mockReturnValue({
      state: { 
        currentScreen: 'level',
        levels: mockLevels,
        levelOrder: mockLevelOrder
      },
      dispatch: mockDispatch,
    })

    renderWithProviders(<LevelScreen />)

    const level1Button = screen.getByText('Level 1')
    const level2Button = screen.getByText('Level 2')

    fireEvent.click(level1Button)
    fireEvent.click(level2Button)

    // Should have dispatched 6 times (3 actions per level selection)
    expect(mockDispatch).toHaveBeenCalledTimes(6)
  })
})
