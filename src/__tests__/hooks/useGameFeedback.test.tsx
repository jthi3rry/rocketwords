import { renderHook, act } from '@testing-library/react'
import { useGameFeedback } from '@/hooks/useGameFeedback'

describe('useGameFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with no feedback shown', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    expect(result.current.showFeedback).toBe(false)
    expect(result.current.feedbackMessage).toBe('')
  })

  it('should show correct feedback when answer is correct', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    act(() => {
      result.current.showInlineFeedback(true)
    })
    
    expect(result.current.showFeedback).toBe(true)
    expect(result.current.feedbackMessage).toMatch(/✅/)
    expect(result.current.feedbackMessage).toMatch(/(Great!|Awesome!|You got it!|Good job!|Exactly!|You nailed it!|Fantastic!|Spot on!|You're on fire!)/)
  })

  it('should show incorrect feedback when answer is incorrect', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    act(() => {
      result.current.showInlineFeedback(false)
    })
    
    expect(result.current.showFeedback).toBe(true)
    expect(result.current.feedbackMessage).toMatch(/❌/)
    expect(result.current.feedbackMessage).toMatch(/(Good try!|Not quite!|Keep trying!|Don't give up!|So close!|Almost!|Think about this!|Give it another shot!)/)
  })

  it('should hide feedback after timeout', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    act(() => {
      result.current.showInlineFeedback(true)
    })
    
    expect(result.current.showFeedback).toBe(true)
    
    act(() => {
      jest.advanceTimersByTime(1500)
    })
    
    expect(result.current.showFeedback).toBe(false)
  })

  it('should generate different feedback messages on multiple calls', () => {
    const { result } = renderHook(() => useGameFeedback())
    const messages = new Set()
    
    // Call multiple times to test randomization
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.showInlineFeedback(true)
      })
      messages.add(result.current.feedbackMessage)
      
      act(() => {
        jest.advanceTimersByTime(1500)
      })
    }
    
    // Should have multiple different messages
    expect(messages.size).toBeGreaterThan(1)
  })

  it('should handle rapid successive feedback calls', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    act(() => {
      result.current.showInlineFeedback(true)
    })
    
    expect(result.current.showFeedback).toBe(true)
    const firstMessage = result.current.feedbackMessage
    
    act(() => {
      result.current.showInlineFeedback(false)
    })
    
    expect(result.current.showFeedback).toBe(true)
    expect(result.current.feedbackMessage).not.toBe(firstMessage)
    expect(result.current.feedbackMessage).toMatch(/❌/)
  })

  it('should show new feedback immediately when called again', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    act(() => {
      result.current.showInlineFeedback(true)
    })
    
    act(() => {
      jest.advanceTimersByTime(1000) // Partially through timeout
    })
    
    expect(result.current.showFeedback).toBe(true)
    
    act(() => {
      result.current.showInlineFeedback(false)
    })
    
    expect(result.current.showFeedback).toBe(true)
    expect(result.current.feedbackMessage).toMatch(/❌/)
    
    // The new feedback should be shown immediately
    expect(result.current.feedbackMessage).toMatch(/❌/)
  })
})
