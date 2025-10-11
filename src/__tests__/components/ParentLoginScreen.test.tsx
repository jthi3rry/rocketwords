import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ParentLoginScreen from '@/components/ParentLoginScreen'
import { renderWithProviders } from '../testUtils'

// Mock the GameContext
const mockDispatch = jest.fn()
const mockUseGame = jest.fn()

jest.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}))

describe('ParentLoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render parent login screen when currentScreen is parentLogin', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    expect(screen.getByText('Parent Mode')).toBeInTheDocument()
    expect(screen.getByText("What's this number?")).toBeInTheDocument()
    expect(screen.getByText('_ _ _')).toBeInTheDocument() // Empty input display
  })

  it('should not render when currentScreen is not parentLogin', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'welcome' },
      dispatch: mockDispatch,
    })

    const { container } = renderWithProviders(<ParentLoginScreen />)
    expect(container.firstChild).toBeNull()
  })

  it('should render keypad with all digits 0-9', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    // Check that all digits 1-9 are present
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument()
    }

    // Check that 0 is present
    expect(screen.getByText('0')).toBeInTheDocument()

    // Check that Clear button is present
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('should handle back button', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const backButton = screen.getByText('Cancel')
    fireEvent.click(backButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCREEN',
      payload: 'welcome'
    })
  })

  it('should render with proper styling classes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const title = screen.getByText('Parent Mode')
    expect(title).toHaveClass('text-3xl', 'md:text-4xl', 'font-extrabold', 'text-purple-400', 'mb-6')

    const inputDisplay = screen.getByText('_ _ _')
    expect(inputDisplay).toHaveClass('text-4xl', 'font-extrabold', 'text-purple-400', 'tracking-widest', 'mb-4')

    const button5 = screen.getByText('5')
    expect(button5).toHaveClass('numeral-btn', 'btn-game', 'btn-mode', 'px-6', 'py-4', 'text-2xl', 'rounded-lg')

    const clearButton = screen.getByText('Clear')
    expect(clearButton).toHaveClass('btn-game', 'px-6', 'py-4', 'text-lg', 'rounded-lg', 'bg-red-500', 'hover:bg-red-600')

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toHaveClass('btn-game', 'px-6', 'py-3', 'rounded-full', 'text-lg', 'font-bold', 'text-gray-400', 'bg-gray-700', 'hover:bg-gray-600')
  })

  it('should render with responsive grid layout', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const button5 = screen.getByText('5')
    const gridContainer = button5.closest('div')
    expect(gridContainer).toHaveClass('grid', 'grid-cols-3', 'gap-2')
  })

  it('should maintain proper component structure', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const title = screen.getByText('Parent Mode')
    expect(title.tagName).toBe('H2')

    const button5 = screen.getByText('5')
    expect(button5.tagName).toBe('BUTTON')

    const clearButton = screen.getByText('Clear')
    expect(clearButton.tagName).toBe('BUTTON')

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton.tagName).toBe('BUTTON')
  })

  it('should render with proper container structure', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const title = screen.getByText('Parent Mode')
    const mainContainer = title.closest('div')
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'p-8', 'h-full', 'w-full')
  })

  it('should render challenge number display', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    // The component should display a number in words
    const numberDisplay = screen.getByText("What's this number?").nextElementSibling
    expect(numberDisplay).toHaveClass('text-xl', 'font-bold', 'mb-4', 'text-white')
  })

  it('should render input display area', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const inputDisplay = screen.getByText('_ _ _')
    expect(inputDisplay).toBeInTheDocument()
    expect(inputDisplay).toHaveClass('text-4xl', 'font-extrabold', 'text-purple-400', 'tracking-widest', 'mb-4')
  })

  it('should render all keypad buttons with correct classes', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    // Check that all number buttons have the correct classes
    for (let i = 1; i <= 9; i++) {
      const button = screen.getByText(i.toString())
      expect(button).toHaveClass('numeral-btn', 'btn-game', 'btn-mode', 'px-6', 'py-4', 'text-2xl', 'rounded-lg')
    }

    // Check that 0 button has the correct classes
    const button0 = screen.getByText('0')
    expect(button0).toHaveClass('numeral-btn', 'btn-game', 'btn-mode', 'px-6', 'py-4', 'text-2xl', 'rounded-lg')
  })

  it('should render clear button with correct styling', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const clearButton = screen.getByText('Clear')
    expect(clearButton).toHaveClass('btn-game', 'px-6', 'py-4', 'text-lg', 'rounded-lg', 'bg-red-500', 'hover:bg-red-600', 'col-span-1')
  })

  it('should render cancel button with correct styling', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toHaveClass('btn-game', 'px-6', 'py-3', 'rounded-full', 'text-lg', 'font-bold', 'text-gray-400', 'bg-gray-700', 'hover:bg-gray-600')
  })

  it('should handle keypad button clicks', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const button5 = screen.getByText('5')
    fireEvent.click(button5)

    // The button should be clickable (no error thrown)
    expect(button5).toBeInTheDocument()
  })

  it('should handle clear button click', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const clearButton = screen.getByText('Clear')
    fireEvent.click(clearButton)

    // The button should be clickable (no error thrown)
    expect(clearButton).toBeInTheDocument()
  })

  it('should render with proper responsive design', () => {
    mockUseGame.mockReturnValue({
      state: { currentScreen: 'parentLogin' },
      dispatch: mockDispatch,
    })

    renderWithProviders(<ParentLoginScreen />)

    const title = screen.getByText('Parent Mode')
    expect(title).toHaveClass('text-3xl', 'md:text-4xl')

    const inputContainer = screen.getByText('_ _ _').closest('div')
    expect(inputContainer).toHaveClass('w-full', 'max-w-xs', 'text-center')
  })
})