import { render, screen, fireEvent } from '@testing-library/react'
import RepeatButton from '@/components/RepeatButton'

// Mock the hooks
jest.mock('@/hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: jest.fn(),
}))

jest.mock('@/hooks/useGameModeInitialization', () => ({
  useGameModeInitialization: jest.fn(),
}))

import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useGameModeInitialization } from '@/hooks/useGameModeInitialization'

const mockUseSpeechSynthesis = useSpeechSynthesis as jest.MockedFunction<typeof useSpeechSynthesis>
const mockUseGameModeInitialization = useGameModeInitialization as jest.MockedFunction<typeof useGameModeInitialization>

describe('RepeatButton', () => {
  const mockPlayWord = jest.fn()
  const mockPlayCurrentWord = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseSpeechSynthesis.mockReturnValue({
      playWord: mockPlayWord,
    })
    
    mockUseGameModeInitialization.mockReturnValue({
      initializeGameMode: jest.fn(),
      playCurrentWord: mockPlayCurrentWord,
    })
  })

  it('should render repeat button with emoji', () => {
    render(<RepeatButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('🗣️')
  })

  it('should call playCurrentWord when clicked', () => {
    render(<RepeatButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockPlayCurrentWord).toHaveBeenCalled()
  })

  it('should have correct CSS classes', () => {
    render(<RepeatButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-game', 'btn-mode', 'p-4', 'rounded-full')
  })

  it('should have correct emoji size', () => {
    render(<RepeatButton />)
    
    const emoji = screen.getByText('🗣️')
    expect(emoji).toHaveClass('text-6xl')
  })

  it('should be accessible', () => {
    render(<RepeatButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeEnabled()
  })

  it('should initialize hooks with correct parameters', () => {
    render(<RepeatButton />)
    
    expect(mockUseGameModeInitialization).toHaveBeenCalledWith({
      onPlayWord: mockPlayWord,
    })
  })
})
