import { renderHook, act } from '@testing-library/react'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

// Mock the Speech Synthesis API
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(),
  onvoiceschanged: null,
}

const mockSpeechSynthesisUtterance = jest.fn()

// Mock voices
const mockVoices = [
  { name: 'Google US English', lang: 'en-US' },
  { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
  { name: 'Alex', lang: 'en-US' },
  { name: 'Samantha', lang: 'en-US' },
  { name: 'Victoria', lang: 'en-AU' },
  { name: 'Karen', lang: 'en-AU' },
  { name: 'Daniel', lang: 'en-GB' },
  { name: 'Kate', lang: 'en-GB' },
  { name: 'Moira', lang: 'en-IE' },
]

describe('useSpeechSynthesis', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset global mocks
    global.speechSynthesis = mockSpeechSynthesis as any
    global.SpeechSynthesisUtterance = mockSpeechSynthesisUtterance as any
    
    mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices)
    mockSpeechSynthesisUtterance.mockImplementation((text) => ({
      text,
      voice: null,
      rate: 1,
      pitch: 1,
    }))
  })

  it('should initialize with playWord function', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    
    expect(result.current.playWord).toBeDefined()
    expect(typeof result.current.playWord).toBe('function')
  })

  it('should not initialize speech synthesis when not in browser', () => {
    const originalWindow = global.window
    const originalSpeechSynthesis = global.speechSynthesis
    
    // Remove window and speechSynthesis
    delete (global as any).window
    delete (global as any).speechSynthesis
    
    // Clear the mock before testing
    mockSpeechSynthesis.getVoices.mockClear()
    
    renderHook(() => useSpeechSynthesis())
    
    expect(mockSpeechSynthesis.getVoices).not.toHaveBeenCalled()
    
    // Restore globals
    global.window = originalWindow
    global.speechSynthesis = originalSpeechSynthesis
  })

  it('should not initialize when speechSynthesis is not available', () => {
    const originalSpeechSynthesis = global.speechSynthesis
    delete (global as any).speechSynthesis
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('test')
    })
    
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    
    global.speechSynthesis = originalSpeechSynthesis
  })

  it('should play word with speech synthesis', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('hello')
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
  })

  it('should set utterance properties correctly', () => {
    const mockUtterance = {
      text: '',
      voice: null,
      rate: 1,
      pitch: 1,
    }
    
    mockSpeechSynthesisUtterance.mockReturnValue(mockUtterance)
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    expect(mockUtterance.rate).toBe(0.6)
    expect(mockUtterance.pitch).toBe(1.2)
  })

  it('should select Google voice when available', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    const mockUtterance = mockSpeechSynthesisUtterance.mock.results[0].value
    expect(mockUtterance.voice).toBe(mockVoices[0]) // Google US English
  })

  it('should select Microsoft voice when Google is not available', () => {
    const voicesWithoutGoogle = mockVoices.filter(v => !v.name.includes('Google'))
    mockSpeechSynthesis.getVoices.mockReturnValue(voicesWithoutGoogle)
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    const mockUtterance = mockSpeechSynthesisUtterance.mock.results[0].value
    expect(mockUtterance.voice).toBe(voicesWithoutGoogle[0]) // Microsoft David
  })

  it('should select Australian English voice when preferred voices not available', () => {
    const voicesWithoutPreferred = mockVoices.filter(v => 
      !v.name.includes('Google') && 
      !v.name.includes('Microsoft') &&
      !v.lang.startsWith('en-US')
    )
    mockSpeechSynthesis.getVoices.mockReturnValue(voicesWithoutPreferred)
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    const mockUtterance = mockSpeechSynthesisUtterance.mock.results[0].value
    expect(mockUtterance.voice).toBe(voicesWithoutPreferred[0]) // Victoria (en-AU)
  })

  it('should select British English voice when other preferred voices not available', () => {
    const voicesWithoutPreferred = mockVoices.filter(v => 
      !v.name.includes('Google') && 
      !v.name.includes('Microsoft') &&
      !v.lang.startsWith('en-US') &&
      !v.lang.startsWith('en-AU')
    )
    mockSpeechSynthesis.getVoices.mockReturnValue(voicesWithoutPreferred)
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    const mockUtterance = mockSpeechSynthesisUtterance.mock.results[0].value
    expect(mockUtterance.voice).toBe(voicesWithoutPreferred[0]) // Daniel (en-GB)
  })

  it('should select any English voice when specific preferences not available', () => {
    const onlyGenericEnglish = mockVoices.filter(v => v.lang === 'en-US' && !v.name.includes('Google') && !v.name.includes('Microsoft'))
    mockSpeechSynthesis.getVoices.mockReturnValue(onlyGenericEnglish)
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    const mockUtterance = mockSpeechSynthesisUtterance.mock.results[0].value
    expect(mockUtterance.voice).toBe(onlyGenericEnglish[0])
  })

  it('should handle no voices available', () => {
    mockSpeechSynthesis.getVoices.mockReturnValue([])
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('hello')
    })
    
    const mockUtterance = mockSpeechSynthesisUtterance.mock.results[0].value
    expect(mockUtterance.voice).toBeNull()
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
  })

  it('should handle voices changed event', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    
    // Simulate voices changed event
    act(() => {
      if (mockSpeechSynthesis.onvoiceschanged) {
        mockSpeechSynthesis.onvoiceschanged()
      }
    })
    
    expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled()
  })

  it('should call voices selection immediately on mount', () => {
    renderHook(() => useSpeechSynthesis())
    
    expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled()
  })

  it('should not play word when not in browser', () => {
    const originalWindow = global.window
    const originalSpeechSynthesis = global.speechSynthesis
    
    // Remove window and speechSynthesis
    delete (global as any).window
    delete (global as any).speechSynthesis
    
    // Clear the mock before testing
    mockSpeechSynthesis.speak.mockClear()
    
    const { result } = renderHook(() => useSpeechSynthesis())
    
    act(() => {
      result.current.playWord('test')
    })
    
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled()
    
    // Restore globals
    global.window = originalWindow
    global.speechSynthesis = originalSpeechSynthesis
  })
})
