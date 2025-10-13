import { render, screen, fireEvent } from '@testing-library/react'
import CaseToggleButton from '@/components/CaseToggleButton'
import { renderWithGameContext, createMockGameState } from '../testUtils'

// Mock the useGame hook
jest.mock('@/context/GameContext', () => ({
  useGame: jest.fn(),
}))

import { useGame } from '@/context/GameContext'

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>
const mockDispatch = jest.fn()

describe('CaseToggleButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render uppercase toggle when isUpperCase is true', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({ isUpperCase: true }),
      dispatch: mockDispatch,
    })

    render(<CaseToggleButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Aa')
    expect(button).toHaveAttribute('title', 'Switch to lowercase letters')
  })

  it('should render lowercase toggle when isUpperCase is false', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({ isUpperCase: false }),
      dispatch: mockDispatch,
    })

    render(<CaseToggleButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('aA')
    expect(button).toHaveAttribute('title', 'Switch to uppercase letters')
  })

  it('should dispatch TOGGLE_CASE action when clicked', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({ isUpperCase: true }),
      dispatch: mockDispatch,
    })

    render(<CaseToggleButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_CASE' })
  })

  it('should have correct CSS classes', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({ isUpperCase: true }),
      dispatch: mockDispatch,
    })

    render(<CaseToggleButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-game', 'btn-mode', 'p-2', 'sm:p-3', 'rounded-full', 'text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold', 'transition-all', 'duration-200', 'transform', 'hover:scale-105', 'active:scale-95', 'bg-blue-500', 'hover:bg-blue-600', 'text-white')
  })

  it('should be accessible', () => {
    mockUseGame.mockReturnValue({
      state: createMockGameState({ isUpperCase: true }),
      dispatch: mockDispatch,
    })

    render(<CaseToggleButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title')
    expect(button).toBeEnabled()
  })
})

